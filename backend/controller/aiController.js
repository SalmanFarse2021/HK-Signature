import { generateText } from '../services/gemini.js';

export async function generateTextHandler(req, res) {
  try {
    const { prompt, model } = req.body || {};
    const text = await generateText({ prompt, model });
    return res.json({ success: true, text });
  } catch (err) {
    const code = err?.code === 'NO_KEY' ? 500 : 400;
    return res.status(code).json({ success: false, message: err?.message || 'Generation failed' });
  }
}

