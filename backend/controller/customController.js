import { cloudinary } from '../config/cloudinary.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { InferenceClient } from '@huggingface/inference';

// Ensure .env is loaded even when this module is imported before server.js calls dotenv.config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Ensure fetch exists (Node 18+ has it; fallback to undici/node-fetch if needed)
let _fetch = globalThis.fetch;
if (typeof _fetch !== 'function') {
  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    _fetch = (await import('node-fetch')).default;
  } catch {
    // noop; will throw later if used
  }
}

const IMAGE_PROVIDER = (process.env.IMAGE_PROVIDER || 'huggingface').toLowerCase();
const HF_MODEL = process.env.HF_MODEL || 'black-forest-labs/FLUX.1-dev';
const DIRECT_IMAGE_URL_REGEX = new RegExp(String.raw`https?://[^\s"'\\]+\.(?:png|jpe?g|webp)`, 'i');
const ESCAPED_SLASH_REGEX = /\\\//g;

function extractDirectImageUrl(str = '') {
  const match = str.match(DIRECT_IMAGE_URL_REGEX);
  return match ? match[0].replace(ESCAPED_SLASH_REGEX, '/') : null;
}

async function fetchBufferFromUrl(url) {
  const res = await _fetch(url);
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
  const arr = await res.arrayBuffer();
  return Buffer.from(arr);
}

const FALLBACK_HF_KEY = (process.env.FALLBACK_HF_KEY || '').trim();
let hfClient = null;

function getHfToken() {
  return (process.env.HF_TOKEN || process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY || FALLBACK_HF_KEY || '').trim();
}

function getHfClient() {
  const token = getHfToken();
  if (!token) {
    const err = new Error('HUGGINGFACE_API_KEY missing');
    err.code = 'NO_KEY';
    throw err;
  }
  if (!hfClient) {
    hfClient = new InferenceClient(token);
  }
  return hfClient;
}

async function callHuggingFaceImageAPI({ prompt }) {
  const client = getHfClient();
  try {
    const blob = await client.textToImage({
      provider: 'nebius',
      model: HF_MODEL,
      inputs: prompt,
      parameters: {
        num_inference_steps: 5,
        guidance_scale: 7,
        negative_prompt: 'blurry, distorted, bad anatomy, watermark, text, logo',
      },
    });
    if (!blob) throw new Error('Empty Hugging Face response');
    const arr = await blob.arrayBuffer();
    if (!arr || arr.byteLength === 0) throw new Error('Empty Hugging Face image data');
    return Buffer.from(arr);
  } catch (err) {
    const e = new Error(`HuggingFace image request failed: ${err?.message || err}`);
    e.code = err?.code || 'PROVIDER_FAIL';
    throw e;
  }
}

async function callFreepikImageAPI({ prompt }) {
  const FREEPIK_API_KEY = (process.env.FREEPIK_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');
  if (!FREEPIK_API_KEY) {
    const err = new Error('FREEPIK_API_KEY missing');
    err.code = 'NO_KEY';
    throw err;
  }

  const endpoints = [
    { url: 'https://api.freepik.com/v1/ai/text-to-image', body: (t) => ({ prompt: t }) },
    { url: 'https://api.freepik.com/v1/ai/generate-image', body: (t) => ({ prompt: t }) },
    { url: 'https://api.freepik.com/v1/ai/images', body: (t) => ({ prompt: t }) },
  ];

  const headersVariants = [
    (key) => ({ Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }),
    (key) => ({ 'X-API-KEY': key, 'Content-Type': 'application/json' }),
    (key) => ({ 'X-Freepik-API-Key': key, 'Content-Type': 'application/json' }),
  ];

  let lastErr;
  for (const ep of endpoints) {
    for (const hv of headersVariants) {
      try {
        const res = await _fetch(ep.url, {
          method: 'POST',
          headers: hv(FREEPIK_API_KEY),
          body: JSON.stringify(ep.body(prompt)),
        });
        const text = await res.text();
        if (!res.ok) { lastErr = new Error(`${res.status} ${text}`); continue; }
        let data = {};
        try { data = JSON.parse(text); } catch { data = {}; }
        // Try common fields for base64 data or direct image URLs
        const str = JSON.stringify(data);
        // base64
        const b64 = data?.image_base64 || data?.image?.b64 || data?.data?.[0]?.b64 || data?.images?.[0]?.b64 || null;
        if (b64) return Buffer.from(b64, 'base64');
        // direct URL fallback
        const directUrl = extractDirectImageUrl(str);
        if (directUrl) {
          return await fetchBufferFromUrl(directUrl);
        }
      } catch (e) { lastErr = e; }
    }
  }

  // As a last resort, try Freepik search to fetch a related image
  try {
    const searchHeaders = {
      Authorization: `Bearer ${FREEPIK_API_KEY}`,
    };
    const sRes = await _fetch('https://api.freepik.com/v1/search?limit=1&order=relevance&query=' + encodeURIComponent(prompt), { headers: searchHeaders });
    const sText = await sRes.text();
    let sData = {};
    try { sData = JSON.parse(sText); } catch { sData = {}; }
    const sStr = JSON.stringify(sData);
    const sUrl = extractDirectImageUrl(sStr);
    if (sUrl) return await fetchBufferFromUrl(sUrl);
  } catch (e) { lastErr = e; }

  const err = new Error(`Freepik image request failed: ${lastErr?.message || 'no data'}`);
  err.code = 'PROVIDER_FAIL';
  throw err;
}

async function callGeminiImageAPI({ prompt }) {
  const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
  if (!GEMINI_API_KEY) {
    const err = new Error('GEMINI_API_KEY missing');
    err.code = 'NO_KEY';
    throw err;
  }

  const candidates = [
    // Gemini 2.5 Flash (text + image tool)
    { url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', body: (t) => ({ contents: [{ role: 'user', parts: [{ text: t }] }], tools: [{ image_generation: {} }] }) },
    // Newer Gemini models with image_generation tool
    { url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', body: (t) => ({ contents: [{ role: 'user', parts: [{ text: t }] }], tools: [{ image_generation: {} }] }) },
    { url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-preview-02-05:generateContent', body: (t) => ({ contents: [{ role: 'user', parts: [{ text: t }] }], tools: [{ image_generation: {} }] }) },
    // Imagen 3 endpoints (availability varies by account/region)
    { url: 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0:generateImage', body: (t) => ({ prompt: { text: t } }) },
    { url: 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0:generateImages', body: (t) => ({ prompt: { text: t } }) },
    // Generic images endpoint observed in earlier API variants
    { url: 'https://generativelanguage.googleapis.com/v1beta/models/images:generate', body: (t) => ({ prompt: { text: t } }) },
    { url: 'https://generativelanguage.googleapis.com/v1beta/models/imagegeneration:generate', body: (t) => ({ prompt: { text: t } }) },
  ];

  let lastErr;
  for (const cand of candidates) {
    try {
      const res = await _fetch(cand.url + `?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cand.body(prompt)),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        lastErr = new Error(`${res.status} ${txt}`);
        continue;
      }
      const data = await res.json();
      let b64 = null;
      if (Array.isArray(data?.images) && data.images[0]?.b64Data) b64 = data.images[0].b64Data;
      if (!b64 && data?.predictions && Array.isArray(data.predictions) && data.predictions[0]?.bytesBase64Encoded) b64 = data.predictions[0].bytesBase64Encoded;
      if (!b64 && data?.candidates && data.candidates[0]?.content?.parts) {
        const part = data.candidates[0].content.parts.find((p) => p.inlineData?.data);
        if (part) b64 = part.inlineData.data;
      }
      if (b64) return Buffer.from(b64, 'base64');
      lastErr = new Error('No image data in response');
    } catch (e) {
      lastErr = e;
    }
  }
  const err = new Error(`Gemini image generation failed: ${lastErr?.message || 'unknown error'}`);
  err.code = 'GEN_FAIL';
  throw err;
}

function uploadBufferToCloudinary(buffer, folder = 'custom') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
    stream.end(buffer);
  });
}

function providerHasKey(name) {
  switch (name) {
    case 'huggingface':
      return Boolean(getHfToken());
    case 'freepik':
      return Boolean((process.env.FREEPIK_API_KEY || '').trim());
    case 'gemini':
      return Boolean((process.env.GEMINI_API_KEY || '').trim());
    default:
      return false;
  }
}

function buildProviderPipeline() {
  const REGISTRY = {
    huggingface: callHuggingFaceImageAPI,
    freepik: callFreepikImageAPI,
    gemini: callGeminiImageAPI,
  };

  const order = [];
  const preferred = IMAGE_PROVIDER in REGISTRY ? IMAGE_PROVIDER : 'huggingface';
  if (providerHasKey(preferred)) order.push(preferred);
  for (const key of Object.keys(REGISTRY)) {
    if (!order.includes(key) && providerHasKey(key)) order.push(key);
  }

  // final fallback to huggingface (guaranteed key) if nothing else was added
  if (order.length === 0) order.push('huggingface');

  return order.map((key) => ({ key, fn: REGISTRY[key] }));
}

export async function generateCustomImage(req, res) {
  try {
    const { prompt, category, subCategory } = req.body || {};
    if (!prompt || !category) {
      return res.status(400).json({ success: false, message: 'prompt and category are required' });
    }
    const fullPrompt = `${prompt}. Product mockup for ${category}${subCategory ? ' • ' + subCategory : ''}. Clean studio background, centered composition.`;
    const providers = buildProviderPipeline();

    let buf = null;
    let usedProvider = null;
    let lastErr = null;

    for (const provider of providers) {
      try {
        buf = await provider.fn({ prompt: fullPrompt });
        usedProvider = provider.key;
        break;
      } catch (err) {
        lastErr = err;
      }
    }

    if (!buf) {
      const message = lastErr?.message || 'Generation failed';
      const status = lastErr?.code === 'NO_KEY' ? 500 : 502;
      return res.status(status).json({ success: false, message });
    }

    const uploaded = await uploadBufferToCloudinary(buf, 'custom_designs');
    return res.status(201).json({
      success: true,
      provider: usedProvider,
      image: { url: uploaded.secure_url, public_id: uploaded.public_id },
      prompt,
      category,
      subCategory,
    });
  } catch (err) {
    const status = err?.code === 'NO_KEY' ? 500 : 502;
    return res.status(status).json({ success: false, message: err?.message || 'Generation failed' });
  }
}
