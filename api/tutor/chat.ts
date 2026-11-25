import { runSocraticChat } from '../_gemini';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { message, history = [], subject = 'General Study' } = body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const reply = await runSocraticChat(message, history, subject);
    return res.status(200).json({ reply });
  } catch (err: any) {
    console.error('Error in /api/tutor/chat:', err);
    return res.status(err?.status || 500).json({
      error: err?.message || 'Failed to generate tutor response',
      details: err?.message || 'Server error',
    });
  }
}
