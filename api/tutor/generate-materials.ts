import { runGenerateMaterials } from '../_gemini';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { content, subject = 'General' } = body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content or notes are required' });
    }

    const parsed = await runGenerateMaterials(content, subject);
    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error('Error in /api/tutor/generate-materials:', err);
    return res.status(err?.status || 500).json({
      error: err?.message || 'Failed to generate study materials',
      details: err?.message || 'Server error',
    });
  }
}
