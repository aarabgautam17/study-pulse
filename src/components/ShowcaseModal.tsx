import React, { useState } from 'react';
import {
  Trophy,
  X,
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Brain,
  Calendar,
  Clock,
  Award,
} from 'lucide-react';
import { StudentProfile } from '../types';

interface ShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
}

export const ShowcaseModal: React.FC<ShowcaseModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const projectPitchText = `Project Name: StudyPulse — AI Socratic Tutor & Academic Schedule Manager
Category: Education & Study Tools (School Innovation Challenge - Grade 8 & 9)
Submission Deadline: Kartik 13, 2083

Real-World Problem:
Students often face overwhelming exam stress, procrastination, and difficulties understanding tough STEM & humanities concepts. When using traditional AI tools, students frequently copy answers directly, bypassing genuine learning and failing exams.

Our AI-Powered Solution:
StudyPulse provides a dedicated Socratic AI study companion that guides students to deduce answers themselves through step-by-step questions, real-world analogies, and personalized revision kits (flashcards, quizzes with hints, and summary sheets). It pairs active recall with custom focus timers and automated weekly goal tracking.

Key Innovations:
1. Strict Socratic Anti-Cheating Engine: The AI cannot be used to search for or output direct answers; it coaches students to master principles independently.
2. Personalized Revision Generator: Transforms class notes into interactive flashcards and multiple-choice quizzes with progressive hints.
3. Exam Deadline & Schedule Visualizer: Computes countdowns, highlights urgent deadlines, and tracks topic mastery.
4. Integrated Study Timer with Web Audio Chimes: Pomodoro and custom focus intervals with automatic session logging.
5. Gamified Progress Tracking: XP points, daily streaks, and milestone badges that build consistent study habits.

Built with: React, TypeScript, Tailwind CSS, Express, and Google Gemini 3.8 Flash.`;

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(projectPitchText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  School Innovation Challenge Showcase
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                  Grade 8 & 9 Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Submission Target: Kartik 13, 2083 · Special Assembly Recognition
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Challenge Highlights */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Top 5 Recognition Criteria Addressed</span>
          </div>
          <p className="leading-relaxed">
            This project solves a real daily school problem: helping students learn concepts deeply without cheating, organizing exam deadlines, and motivating daily study routines.
          </p>
        </div>

        {/* 4 Feature Pillars for Judges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>1. Socratic Anti-Cheating</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Refuses to give away direct answers or write homework solutions. Guides students step-by-step with simple analogies.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
              <Brain className="w-4 h-4 text-emerald-600" />
              <span>2. AI Revision Kit Generator</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Transforms class notes into interactive flashcards, self-test quizzes with progressive hints, and summary sheets.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>3. Focus Timers & Audio Chimes</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Custom Pomodoro intervals synthesized with native Web Audio chimes; automatically records focus hours toward goals.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
              <Calendar className="w-4 h-4 text-rose-600" />
              <span>4. Weekly Goals & Exam Countdown</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Visualizes daily study distribution, days remaining until exams, and topic checklists to eliminate last-minute cramming.
            </p>
          </div>
        </div>

        {/* Project Pitch Text Area for Competition Submission */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Competition Project Description
            </label>
            <button
              onClick={handleCopyPitch}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Pitch for Form</span>
                </>
              )}
            </button>
          </div>

          <textarea
            readOnly
            rows={6}
            value={projectPitchText}
            className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed focus:outline-hidden resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <a
            href="https://forms.gle/ewaDJM8XFUiXyfoFA"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
          >
            <span>Open School Submission Form</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            Close & Continue Exploring
          </button>
        </div>
      </div>
    </div>
  );
};
