import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure .env is loaded when imported directly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const API_BASE = 'https://generativelanguage.googleapis.com';

export async function generateText({ prompt, model = process.env.GEMINI_MODEL || 'gemini-2.5-flash', safetySettings, generationConfig } = {}) {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  if (!key) {
    const err = new Error('GEMINI_API_KEY missing');
    err.code = 'NO_KEY';
    throw err;
  }
  if (!prompt) {
    const err = new Error('Prompt is required');
    err.code = 'BAD_INPUT';
    throw err;
  }

  const url = `${API_BASE}/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: String(prompt) }]}],
  };
  if (safetySettings) body.safetySettings = safetySettings;
  if (generationConfig) body.generationConfig = generationConfig;

  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Gemini generateContent failed: ${res.status} ${text}`);
  }
  const data = JSON.parse(text);
  const part = data?.candidates?.[0]?.content?.parts?.find?.((p) => typeof p.text === 'string');
  return part?.text || '';
}

