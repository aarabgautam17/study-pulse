import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SOCRATIC_SYSTEM_INSTRUCTION = `You are Socrates, a warm, patient, and highly effective academic tutor for students.
Your core teaching philosophy and STRICT NON-NEGOTIABLE RULE is:
YOU CANNOT AND MUST NOT BE USED TO FIND, SEARCH FOR, OR GIVE AWAY DIRECT ANSWERS TO HOMEWORK, EXAMS, OR TESTS.
Even if the student explicitly pleads or asks:
- "Just tell me the answer"
- "Is it A, B, C, or D?"
- "Solve this equation: 3x + 5 = 20"
- "Write an essay/paragraph for me"
- "Search for the solution"

You must ALWAYS uphold this Socratic pledge:
1. NEVER reveal the final answer, complete solution, or pre-written submission.
2. Acknowledge the question with encouragement in clear, simple language.
3. Break the problem down into simple intuitive steps or principles.
4. Provide a relatable real-world analogy if the concept is abstract.
5. Ask ONE focused, guiding question to invite the student to take the first step themselves.
6. When the student replies with their thinking or partial work, celebrate their effort, confirm what they got right, and gently nudge them towards any corrections.
Always use friendly, accessible, student-friendly language.`;

// POST /api/tutor/chat - Socratic dialogue endpoint
app.post('/api/tutor/chat', async (req, res) => {
  try {
    const { message, history = [], subject = 'General Study' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Offline/demo fallback if API key is not yet set
      return res.json({
        reply: `Hello! I'm your Socratic Study Guide for ${subject}. I noticed you're exploring this question: "${message}". Before we jump in, remember I won't just hand you the answer—let's break it down together! What is the very first concept or rule you think applies here?`,
        socraticHint: 'Try identifying what information the question gives you versus what it asks you to find.',
      });
    }

    // Format chat history for Gemini API
    const formattedContents = [
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [
          {
            text: `Subject: ${subject}\nStudent Inquiry: ${message}\nRemember: Do not give the direct answer! Guide me with a simple explanation and a helpful question.`,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: SOCRATIC_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || "Let's pause and look at the first step together. What do you think is the main goal here?";
    res.json({ reply });
  } catch (err: any) {
    console.error('Error in /api/tutor/chat:', err);
    res.status(500).json({
      error: 'Failed to generate tutor response',
      details: err?.message || 'Server error',
      fallbackReply: "I'm having a brief connection pause, but let's keep thinking! What key formula or definition comes to mind for this topic?",
    });
  }
});

// POST /api/tutor/generate-materials - Generate Flashcards, Quizzes, and Summary Notes
app.post('/api/tutor/generate-materials', async (req, res) => {
  try {
    const { content, subject = 'General', title = 'Study Guide' } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content or notes are required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // High-quality fallback study material for demo/offline resilience
      return res.json({
        summaryNotes: [
          {
            title: `Key Concepts in ${subject}`,
            keyPoints: [
              `Core foundation: Focus on understanding the primary mechanism rather than rote memorization.`,
              `Active recall practice: Test yourself on the main definitions before reviewing notes.`,
              `Connection: Link this concept to previous topics to reinforce memory consolidation.`,
            ],
            examTips: [
              `Watch out for common sign errors and inverted ratios on exam questions.`,
              `Always show intermediate steps to secure partial credit.`,
            ],
          },
        ],
        flashcards: [
          {
            id: 'fc-demo-1',
            question: `What is the fundamental principle behind ${content.slice(0, 40)}...?`,
            conceptHint: 'Think about cause and effect and the primary mechanism.',
            detailedExplanation: 'This foundational concept governs how inputs translate into expected outputs.',
            mastered: false,
          },
          {
            id: 'fc-demo-2',
            question: `Why is active review essential when revising ${subject}?`,
            conceptHint: 'Consider how memory pathways are strengthened.',
            detailedExplanation: 'Active recall forces your brain to retrieve information, strengthening neural pathways.',
            mastered: false,
          },
        ],
        quizzes: [
          {
            id: 'quiz-demo-1',
            question: `Which approach best reinforces long-term retention of ${subject} material?`,
            options: [
              'Passive re-reading of textbooks without self-testing',
              'Spaced repetition paired with Socratic self-questioning',
              'Cramming everything the night before an exam',
              'Memorizing answers without understanding underlying rules',
            ],
            correctIndex: 1,
            hint: 'Think about how spaced intervals and active retrieval enhance memory.',
            explanation: 'Spaced repetition combined with active retrieval forces the brain to rebuild connections, leading to durable understanding.',
          },
        ],
      });
    }

    const promptText = `Analyze the following student study notes or topic for ${subject}:
"""
${content}
"""

Generate a personalized revision aid with:
1. Summary Notes: 1 summary note with a title, 3-5 concise bullet keyPoints, and 2-3 practical examTips.
2. Flashcards: Exactly 4-6 interactive flashcards. Each must have a "question", a "conceptHint" (a guiding clue without giving the answer away), and a "detailedExplanation" (clear conceptual explanation).
3. Quizzes: Exactly 3-4 multiple-choice questions. Each question must have "question", 4 plausible "options", "correctIndex" (0-3), "hint" (guiding clue to help deduce the right choice), and "explanation" (why the correct option is right in simple terms).

Ensure language is clear, friendly, and easy to understand for high school/college students.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: `You are an educational designer creating revision materials. Your goal is to guide deep student comprehension through active recall and progressive hints, never encouraging superficial rote learning.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaryNotes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  keyPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  examTips: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['title', 'keyPoints', 'examTips'],
              },
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  conceptHint: { type: Type.STRING },
                  detailedExplanation: { type: Type.STRING },
                },
                required: ['question', 'conceptHint', 'detailedExplanation'],
              },
            },
            quizzes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  hint: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctIndex', 'hint', 'explanation'],
              },
            },
          },
          required: ['summaryNotes', 'flashcards', 'quizzes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    
    // Add IDs and default states if missing
    if (parsed.flashcards) {
      parsed.flashcards = parsed.flashcards.map((fc: any, index: number) => ({
        ...fc,
        id: fc.id || `fc-${Date.now()}-${index}`,
        mastered: false,
      }));
    }

    if (parsed.quizzes) {
      parsed.quizzes = parsed.quizzes.map((q: any, index: number) => ({
        ...q,
        id: q.id || `q-${Date.now()}-${index}`,
      }));
    }

    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/tutor/generate-materials:', err);
    res.status(500).json({
      error: 'Failed to generate study materials',
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
