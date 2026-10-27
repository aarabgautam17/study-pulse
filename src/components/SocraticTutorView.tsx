import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  BookOpen,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  RotateCw,
  FileText,
  Layers,
  ChevronRight,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';
import { Flashcard, QuizQuestion, SummaryNote, StudentProfile } from '../types';
import {
  sendSocraticMessage,
  generateStudyMaterials,
  ChatMessage,
} from '../services/tutorApi';

interface SocraticTutorViewProps {
  profile: StudentProfile;
  flashcards: Flashcard[];
  onToggleFlashcard: (id: string) => void;
  onAddFlashcards: (cards: Flashcard[]) => void;
  onAwardXP: (amount: number, reason?: string) => void;
}

export const SocraticTutorView: React.FC<SocraticTutorViewProps> = ({
  profile,
  flashcards,
  onToggleFlashcard,
  onAddFlashcards,
  onAwardXP,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'materials' | 'flashcards' | 'quiz' | 'notes'>('chat');
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello ${profile.name.split(' ')[0]}! I'm your Socratic Tutor. I'm here to guide you through tough concepts step-by-step using questions and simple explanations.\n\nTo ensure you truly master the material, I will never just hand you the answer. What topic or problem are we breaking down today?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(profile.subjects[0] || 'General');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Materials Generator State
  const [notesInput, setNotesInput] = useState('');
  const [generatorSubject, setGeneratorSubject] = useState(profile.subjects[0] || 'General Studies');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuizzes, setGeneratedQuizzes] = useState<QuizQuestion[]>([]);
  const [generatedNotes, setGeneratedNotes] = useState<SummaryNote[]>([]);

  // Flashcard practice state
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Quiz interactive state
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<string, number>>({});
  const [quizHintsShown, setQuizHintsShown] = useState<Record<string, boolean>>({});

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isChatLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      const response = await sendSocraticMessage(text, messages, selectedSubject);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.reply }]);
      onAwardXP(15, 'Socratic inquiry');
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having a brief connection hitch. But let's keep working: What is the primary definition or relationship in this problem?",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateMaterials = async () => {
    if (!notesInput.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await generateStudyMaterials(notesInput, generatorSubject);

      if (result.flashcards && result.flashcards.length > 0) {
        onAddFlashcards(result.flashcards);
      }
      if (result.quizzes && result.quizzes.length > 0) {
        setGeneratedQuizzes(result.quizzes);
        setUserQuizAnswers({});
        setQuizHintsShown({});
      }
      if (result.summaryNotes && result.summaryNotes.length > 0) {
        setGeneratedNotes(result.summaryNotes);
      }

      onAwardXP(50, 'Generated comprehensive revision aids');
      setActiveSubTab('flashcards');
    } catch (err: any) {
      alert('Could not generate materials automatically. Please check your notes and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuizSelect = (questionId: string, optionIndex: number, correctIndex: number) => {
    if (userQuizAnswers[questionId] !== undefined) return;

    setUserQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    if (optionIndex === correctIndex) {
      onAwardXP(20, 'Correct quiz answer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Socratic Anti-Cheating Guarantee Banner */}
      <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/70 text-indigo-900 flex items-start gap-3 shadow-xs">
        <div className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-indigo-950">
              Socratic Learning Guardrails Active
            </h3>
            <span className="text-xs bg-indigo-200/80 text-indigo-800 font-semibold px-2 py-0.5 rounded">
              Anti-Cheat Enforced
            </span>
          </div>
          <p className="text-xs text-indigo-800 leading-relaxed">
            The tutor guides your thinking with questions, analogies, and revision aids. It will <strong>never give direct homework answers</strong> or write solutions for you, ensuring real comprehension for your exams.
          </p>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'chat'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Socratic Chat Coach</span>
        </button>

        <button
          onClick={() => setActiveSubTab('materials')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'materials'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Generate Revision Kit</span>
        </button>

        <button
          onClick={() => setActiveSubTab('flashcards')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'flashcards'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Flashcards ({flashcards.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('quiz')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'quiz'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Practice Quizzes</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notes')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'notes'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Summary Notes</span>
        </button>
      </div>

      {/* TAB 1: Socratic Chat Coach */}
      {activeSubTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[600px] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                S
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Socrates AI Guide</h3>
                <p className="text-[11px] text-slate-500">Guides through questions · Never spoils solutions</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {profile.subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              );
            })}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-600 rounded-2xl p-4 text-xs flex items-center gap-2 border border-slate-200">
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Socrates is formulating a guiding step...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Prompt Suggestions */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-slate-400 font-medium shrink-0">Try asking:</span>
            {[
              "Why can't square roots be negative in real numbers?",
              'Walk me through ATP synthesis step-by-step',
              'Can you just give me the answer to question 3?',
              'How do I test concavity using derivatives?',
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-600 px-2.5 py-1 rounded-md shrink-0 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about a concept, formula, or problem step..."
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-800"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isChatLoading}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>Ask</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Generate Revision Kit */}
      {activeSubTab === 'materials' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Personalized Revision Kit Generator</h3>
            <p className="text-xs text-slate-500 mt-1">
              Paste your lecture notes, textbook excerpt, or study outline. The AI will convert it into interactive flashcards, multiple-choice quizzes with hints, and concise summary notes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Subject
              </label>
              <select
                value={generatorSubject}
                onChange={(e) => setGeneratorSubject(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {profile.subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-end gap-2 pb-1">
              <span className="text-[11px] text-slate-400 block w-full">Quick test sample notes:</span>
              <button
                type="button"
                onClick={() => {
                  setGeneratorSubject('Science');
                  setNotesInput(
                    `Topic: Photosynthesis & Plant Cells (Grade 8/9 Science)\n\n1. Equation: Carbon Dioxide (6CO2) + Water (6H2O) + Sunlight -> Glucose (C6H12O6) + Oxygen (6O2).\n2. Chloroplasts: The green organelle containing chlorophyll pigment that absorbs sunlight.\n3. Light Reaction: Occurs in the thylakoid membranes, splitting water and releasing oxygen gas as a byproduct.\n4. Calvin Cycle (Dark Reaction): Occurs in the stroma, using ATP to convert carbon dioxide into glucose sugar.\n5. Stomata: Microscopic pores on leaf undersides regulated by guard cells for gas exchange.`
                  );
                }}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-md font-medium transition-colors"
              >
                + Science (Photosynthesis)
              </button>
              <button
                type="button"
                onClick={() => {
                  setGeneratorSubject('Mathematics');
                  setNotesInput(
                    `Topic: Linear Equations & Graphs (Grade 8/9 Math)\n\n1. Slope-Intercept Form: y = mx + b, where m represents the slope (rate of change: rise over run) and b represents the y-intercept (where the line crosses the vertical y-axis).\n2. Finding the Slope: m = (y2 - y1) / (x2 - x1).\n3. Parallel vs Perpendicular Lines: Parallel lines have equal slopes (m1 = m2). Perpendicular lines have negative reciprocal slopes (m1 * m2 = -1).\n4. Solving for x: Use inverse operations (balance method): whatever you add or multiply on one side, you must do to the other.`
                  );
                }}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-md font-medium transition-colors"
              >
                + Math (Linear Equations)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Study Content or Notes
            </label>
            <textarea
              rows={8}
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Paste your syllabus notes, reading summary, or topic points here..."
              className="w-full text-sm p-4 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-800"
            />
          </div>

          <button
            onClick={handleGenerateMaterials}
            disabled={!notesInput.trim() || isGenerating}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Crafting Revision Aids...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Flashcards, Quizzes & Summaries</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* TAB 3: Flashcards Viewer */}
      {activeSubTab === 'flashcards' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Interactive Concept Flashcards</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click to flip and test your recall · Mastered cards strengthen your memory
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500 font-semibold">
              Card {activeCardIndex + 1} of {flashcards.length}
            </span>
          </div>

          {flashcards.length > 0 ? (
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Flashcard container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`min-h-[260px] p-8 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                  isFlipped
                    ? 'bg-indigo-50/70 border-indigo-400 text-indigo-950 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    {flashcards[activeCardIndex].subject}
                  </span>
                  <span className="text-xs text-slate-400">
                    {isFlipped ? 'Answer & Explanation (Click to flip back)' : 'Prompt (Click to reveal answer)'}
                  </span>
                </div>

                <div className="py-6 text-center">
                  {!isFlipped ? (
                    <h4 className="text-lg sm:text-xl font-bold leading-relaxed text-slate-800">
                      {flashcards[activeCardIndex].question}
                    </h4>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-base text-slate-800 leading-relaxed font-medium">
                        {flashcards[activeCardIndex].detailedExplanation}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHint(!showHint);
                    }}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Hide Concept Clue' : 'Need a Clue?'}</span>
                  </button>

                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Flip</span>
                  </span>
                </div>
              </div>

              {/* Socratic Hint Box */}
              {showHint && !isFlipped && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Socratic Clue: </strong>
                    {flashcards[activeCardIndex].conceptHint}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setShowHint(false);
                    setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                  }}
                  className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Previous Card
                </button>

                <button
                  onClick={() => onToggleFlashcard(flashcards[activeCardIndex].id)}
                  className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    flashcards[activeCardIndex].mastered
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {flashcards[activeCardIndex].mastered ? 'Mastered (+10 XP)' : 'Mark as Mastered'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setShowHint(false);
                    setActiveCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Next Card
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p>No flashcards loaded yet. Generate some from the "Generate Revision Kit" tab!</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Practice Quizzes */}
      {activeSubTab === 'quiz' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Conceptual Self-Test Quizzes</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose your answer carefully · You can request a Socratic hint before committing (+20 XP for correct answers)
            </p>
          </div>

          {generatedQuizzes.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No practice quizzes generated yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Paste your notes or syllabus in the "Generate Revision Kit" tab to create personalized quizzes with progressive hints.
              </p>
              <button
                onClick={() => setActiveSubTab('materials')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generate Quizzes from Your Notes</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {generatedQuizzes.map((quiz, index) => {
                const selectedAnswer = userQuizAnswers[quiz.id];
                const isAnswered = selectedAnswer !== undefined;
                const hasRequestedHint = quizHintsShown[quiz.id];

                return (
                  <div
                    key={quiz.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {index + 1}. {quiz.question}
                      </h4>

                      {!isAnswered && (
                        <button
                          onClick={() =>
                            setQuizHintsShown((prev) => ({
                              ...prev,
                              [quiz.id]: !prev[quiz.id],
                            }))
                          }
                          className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-1 rounded-md border border-amber-200"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Hint</span>
                        </button>
                      )}
                    </div>

                    {/* Socratic Hint before answer */}
                    {hasRequestedHint && !isAnswered && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                        <strong>Guiding Clue: </strong>
                        {quiz.hint}
                      </div>
                    )}

                    {/* Options */}
                    <div className="space-y-2">
                      {quiz.options.map((opt, optIdx) => {
                        let optionStyle =
                          'border-slate-200 hover:border-indigo-400 bg-slate-50/50 text-slate-800';

                        if (isAnswered) {
                          if (optIdx === quiz.correctIndex) {
                            optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                          } else if (optIdx === selectedAnswer) {
                            optionStyle = 'border-rose-400 bg-rose-50 text-rose-900 line-through';
                          } else {
                            optionStyle = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isAnswered}
                            onClick={() => handleQuizSelect(quiz.id, optIdx, quiz.correctIndex)}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${optionStyle}`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </span>

                            {isAnswered && optIdx === quiz.correctIndex && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            {isAnswered && optIdx === selectedAnswer && optIdx !== quiz.correctIndex && (
                              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation when answered */}
                    {isAnswered && (
                      <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                        <span className="font-bold block">
                          {selectedAnswer === quiz.correctIndex ? 'Correct! 🎉' : 'Nice try! Here is why:'}
                        </span>
                        <p className="leading-relaxed">{quiz.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Summary Notes */}
      {activeSubTab === 'notes' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Concise Summary Notes</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Digestible bullet concepts and practical exam tips
            </p>
          </div>

          {generatedNotes.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No summary notes generated yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Paste your lecture readings or syllabus topics in the "Generate Revision Kit" tab to create instant bullet digests and exam tip sheets.
              </p>
              <button
                onClick={() => setActiveSubTab('materials')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Create Summary Notes from Notes</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {generatedNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                        {note.subject}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">
                        {note.title}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Core Concepts to Remember
                    </h5>
                    <ul className="space-y-2">
                      {note.keyPoints.map((kp, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                          <span className="text-indigo-600 font-bold mt-0.5">·</span>
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      Exam Strategy & Common Pitfalls
                    </h5>
                    <ul className="space-y-2">
                      {note.examTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                          <span className="text-amber-600 font-bold mt-0.5">▲</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
