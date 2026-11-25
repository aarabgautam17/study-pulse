import { GoogleGenAI, Type } from '@google/genai';

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Add GEMINI_API_KEY in your Vercel Project Settings → Environment Variables (or AI Studio Settings → Secrets) and redeploy.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function buildGeminiHistory(
  history: Array<{ role: string; content: string }>,
  currentText: string
) {
  const cleaned: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const msg of history) {
    if (!msg?.content || typeof msg.content !== 'string') continue;
    const role: 'user' | 'model' = msg.role === 'user' ? 'user' : 'model';
    // Gemini multi-turn contents must begin with a user message
    if (cleaned.length === 0 && role === 'model') continue;

    const last = cleaned[cleaned.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += `\n\n${msg.content}`;
    } else {
      cleaned.push({ role, parts: [{ text: msg.content }] });
    }
  }

  const lastCleaned = cleaned[cleaned.length - 1];
  if (lastCleaned && lastCleaned.role === 'user') {
    lastCleaned.parts[0].text += `\n\n${currentText}`;
  } else {
    cleaned.push({ role: 'user', parts: [{ text: currentText }] });
  }

  return cleaned;
}

export const SOCRATIC_SYSTEM_INSTRUCTION = `You are Socrates, a warm, patient, and highly effective academic tutor for students.
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

export async function runSocraticChat(
  message: string,
  history: Array<{ role: string; content: string }> = [],
  subject = 'General Study'
): Promise<string> {
  const ai = getGeminiClient();
  const promptWithContext = `Subject: ${subject}\nStudent Inquiry: ${message}\nRemember: Do not give the direct answer! Guide me with a simple explanation and a helpful question.`;
  const formattedContents = buildGeminiHistory(
    Array.isArray(history) ? history : [],
    promptWithContext
  );

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: formattedContents,
    config: {
      systemInstruction: SOCRATIC_SYSTEM_INSTRUCTION,
    },
  });

  return (
    response.text ||
    "Let's pause and look at the first step together. What do you think is the main goal here?"
  );
}

export async function runGenerateMaterials(content: string, subject = 'General') {
  const ai = getGeminiClient();

  const promptText = `Analyze the following student study notes or topic for ${subject}:
"""
${content}
"""

Generate a personalized revision aid with:
1. Summary Notes: 1 summary note with a title, 3-5 concise bullet keyPoints, and 2-3 practical examTips.
2. Flashcards: Exactly 4-6 interactive flashcards. Each must have a "question", a "conceptHint" (a guiding clue without giving the answer away), and a "detailedExplanation" (clear conceptual explanation).
3. Quizzes: Exactly 3-4 multiple-choice questions. Each question must have "question", 4 plausible "options", "correctIndex" (0-3), "hint" (guiding clue to help deduce the right choice), and "explanation" (why the correct option is right in simple terms).

Ensure language is clear, friendly, and easy to understand for middle and high school students.`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
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

  if (parsed.summaryNotes) {
    parsed.summaryNotes = parsed.summaryNotes.map((note: any, index: number) => ({
      ...note,
      id: note.id || `note-${Date.now()}-${index}`,
      subject,
    }));
  }

  if (parsed.flashcards) {
    parsed.flashcards = parsed.flashcards.map((fc: any, index: number) => ({
      ...fc,
      id: fc.id || `fc-${Date.now()}-${index}`,
      subject,
      mastered: false,
    }));
  }

  if (parsed.quizzes) {
    parsed.quizzes = parsed.quizzes.map((q: any, index: number) => ({
      ...q,
      id: q.id || `q-${Date.now()}-${index}`,
    }));
  }

  return parsed;
}
