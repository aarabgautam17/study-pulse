import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { runGenerateMaterials, runSocraticChat } from './api/_gemini';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// POST /api/tutor/chat - Socratic dialogue endpoint
app.post('/api/tutor/chat', async (req, res) => {
  try {
    const { message, history = [], subject = 'General Study' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const reply = await runSocraticChat(message, history, subject);
    res.json({ reply });
  } catch (err: any) {
    console.error('Error in /api/tutor/chat:', err);
    res.status(err?.status || 500).json({
      error: err?.message || 'Failed to generate tutor response',
      details: err?.message || 'Server error',
    });
  }
});

// POST /api/tutor/generate-materials - Generate Flashcards, Quizzes, and Summary Notes
app.post('/api/tutor/generate-materials', async (req, res) => {
  try {
    const { content, subject = 'General' } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content or notes are required' });
    }

    const parsed = await runGenerateMaterials(content, subject);
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/tutor/generate-materials:', err);
    res.status(err?.status || 500).json({
      error: err?.message || 'Failed to generate study materials',
      details: err?.message || 'Server error',
    });
  }
});

// Setup Vite middleware in dev, or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`StudyPulse server running on http://localhost:${PORT}`);
  });
}

startServer();
