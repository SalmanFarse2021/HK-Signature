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

// Context descriptions for categories
const CATEGORY_CONTEXTS = {
  'Saree': `Hand-Made–Painted Saree (শাড়ি). A hand-painted saree is a wearable piece of art. Each saree is individually designed and painted by skilled Bangladeshi artisans. The fabric—cotton, silk, muslin, or georgette—acts as a canvas for floral, abstract, cultural, or modern designs. The colors are vibrant, long-lasting, and carefully chosen to reflect elegance and tradition. No two pieces are identical, making every saree unique and exclusive.`,
  'Three-Piece': `Hand-Painted Three-Piece (Salwar, Kameez & Dupatta). A hand-painted three-piece blends style with everyday comfort. The kameez, salwar, and dupatta showcase coordinated hand-painted motifs. Designs range from minimal strokes to detailed artwork. Perfect for casual outings, office wear, or festive events. Soft fabrics like cotton, viscose, or lawn give a graceful flow and breathable feel. Each set has handcrafted charm that mass-produced clothes can’t match.`,
  'Salwar Kameez': `Hand-Painted Salwar Kameez. Individually painted by artisans to highlight the neckline, borders, sleeves, or full body. Ideal for those who love artistic and elegant outfits. Colors and patterns reflect traditional Bangladeshi aesthetics with a modern twist. Light, comfortable, and perfect for daily wear or semi-formal occasions.`,
  'Panjabi': `Hand-Painted Panjabi (পাঞ্জাবি). A hand-painted panjabi gives classic menswear a creative flair. Crafted on cotton, endi, or silk fabrics for comfort and style. Detailed brushwork around the collar, cuffs, chest, or full front panel. Designs often include geometric patterns, folk art, floral themes, or modern abstract art. Perfect for festivals, Pohela Boishakh, Eid, cultural programs, or stylish casual wear.`,
  'T-Shirt': `Hand-Painted T-Shirts. Hand-painted T-shirts add personality and creativity to everyday casual wear. Made on soft cotton tees to ensure comfort and durability. Artists paint custom designs—nature, cartoons, typography, cultural symbols, abstract art, etc. Because each piece is painted manually, every shirt becomes a one-of-a-kind fashion statement. Suitable for daily wear, gifts, or custom brand collections.`
};

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
        const b64 = data?.image_base64 || data?.image?.b64 || data?.data?.[0]?.b64 || data?.data?.[0]?.base64 || data?.images?.[0]?.b64 || null;
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

  // Try a mix of Imagen endpoints and Gemini models with image generation tools
  const candidates = [
    // Imagen 2 (Legacy/Stable)
    { url: 'https://generativelanguage.googleapis.com/v1beta/models/imagegeneration:generate', body: (t) => ({ prompt: { text: t } }) },
    // Imagen 3
    {
      url: 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generateImages-001:generateImages',
      body: (t) => ({ prompt: t, number_of_images: 1 })
    },
    // User specified model (Gemini 2.5 Flash - assuming it supports tool)
    {
      url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      body: (t) => ({ contents: [{ role: 'user', parts: [{ text: t }] }], tools: [{ google_search_retrieval: { dynamic_retrieval_config: { mode: "MODE_DYNAMIC", dynamic_threshold: 0.7 } } }] }) // 2.5 might not support image_generation tool yet, trying standard
    },
    // Gemini 2.0 Flash Exp (Known to support tools)
    {
      url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
      body: (t) => ({ contents: [{ role: 'user', parts: [{ text: "Generate an image of: " + t }] }], tools: [{ google_search_retrieval: {} }] }) // actually 2.0 flash exp supports image generation via simple prompt usually, or we need to check docs. 
      // Reverting to the tool definition that worked in some contexts or standard generation
    },
  ];

  // Correct tool payload for Gemini models that support image generation
  const toolBody = (t) => ({
    contents: [{ role: 'user', parts: [{ text: t }] }],
    tools: [{ image_generation: {} }]
  });

  // Add specific candidates with tool support
  candidates.push({ url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', body: toolBody });
  candidates.push({ url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', body: toolBody });
  // Try the user's model with the tool
  candidates.push({ url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', body: toolBody });


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
        // console.error(`Gemini candidate ${cand.url} failed: ${res.status} ${txt}`); // Reduce noise
        lastErr = new Error(`${res.status} ${txt}`);
        continue;
      }

      const data = await res.json();
      let b64 = null;

      // Check for Imagen response structure
      if (data?.images?.[0]?.image64) b64 = data.images[0].image64;
      else if (data?.images?.[0]?.b64Data) b64 = data.images[0].b64Data;
      else if (data?.image64) b64 = data.image64; // sometimes top level

      // Check for generateContent response structure (inline data)
      if (!b64 && data?.candidates?.[0]?.content?.parts) {
        const parts = data.candidates[0].content.parts;
        // Look for inline_data
        const imgPart = parts.find(p => p.inline_data || p.inlineData);
        if (imgPart) {
          b64 = (imgPart.inline_data || imgPart.inlineData).data;
        }
        // Look for executable_code or function_call that might return image (less likely for direct gen)
      }

      if (b64) return Buffer.from(b64, 'base64');

      // console.error(`Gemini candidate ${cand.url} returned no image data`);
      lastErr = new Error('No image data in response');
    } catch (e) {
      // console.error(`Gemini candidate ${cand.url} exception:`, e.message);
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

  console.log('Building provider pipeline...');
  console.log('IMAGE_PROVIDER env:', process.env.IMAGE_PROVIDER);
  console.log('GEMINI_API_KEY present:', Boolean(process.env.GEMINI_API_KEY));

  const order = [];
  const preferred = IMAGE_PROVIDER in REGISTRY ? IMAGE_PROVIDER : 'huggingface';
  if (providerHasKey(preferred)) order.push(preferred);
  for (const key of Object.keys(REGISTRY)) {
    if (!order.includes(key) && providerHasKey(key)) order.push(key);
  }

  // final fallback to huggingface (guaranteed key) if nothing else was added
  if (order.length === 0) order.push('huggingface');

  console.log('Provider order:', order);
  return order.map((key) => ({ key, fn: REGISTRY[key] }));
}

export async function generateCustomImage(req, res) {
  try {
    const { prompt, category, subCategory } = req.body || {};
    if (!prompt || !category) {
      return res.status(400).json({ success: false, message: 'prompt and category are required' });
    }

    // Determine context based on category/subCategory
    let contextDescription = '';

    // Normalize inputs for matching
    const cat = category.trim();
    const sub = (subCategory || '').trim();

    // Match logic
    if (cat.toLowerCase().includes('saree')) {
      contextDescription = CATEGORY_CONTEXTS['Saree'];
    } else if (cat.toLowerCase().includes('three') || sub.toLowerCase().includes('three')) {
      contextDescription = CATEGORY_CONTEXTS['Three-Piece'];
    } else if (cat.toLowerCase().includes('salwar') || sub.toLowerCase().includes('salwar')) {
      contextDescription = CATEGORY_CONTEXTS['Salwar Kameez'];
    } else if (cat.toLowerCase().includes('panjabi')) {
      contextDescription = CATEGORY_CONTEXTS['Panjabi'];
    } else if (cat.toLowerCase().includes('shirt')) {
      contextDescription = CATEGORY_CONTEXTS['T-Shirt'];
    }

    // Construct full prompt
    let fullPrompt = `${prompt}. Product mockup for ${category}${subCategory ? ' • ' + subCategory : ''}. Clean studio background, centered composition.`;
    if (contextDescription) {
      fullPrompt += `\n\nContext/Style: ${contextDescription}`;
    }

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
        console.error(`Provider ${provider.key} failed:`, err.message);
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
