import { Flashcard, QuizQuestion, SummaryNote } from '../types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeneratedMaterialsResponse {
  summaryNotes: SummaryNote[];
  flashcards: Flashcard[];
  quizzes: QuizQuestion[];
}

export async function sendSocraticMessage(
  message: string,
  history: ChatMessage[],
  subject: string
): Promise<{ reply: string }> {
  const res = await fetch('/api/tutor/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, subject }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to communicate with Socratic Tutor');
  }

  return res.json();
}

export async function generateStudyMaterials(
  content: string,
  subject: string
): Promise<GeneratedMaterialsResponse> {
  const res = await fetch('/api/tutor/generate-materials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, subject }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate study materials');
  }

  return res.json();
}
