import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  Lock,
  Mail,
  User,
  Plus,
  X,
  Clock,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { StudentProfile } from '../types';

interface AuthScreenProps {
  accounts: StudentProfile[];
  onRegister: (data: {
    name: string;
    email: string;
    password?: string;
    grade: string;
    weeklyGoalHours: number;
    dailyTargetMinutes: number;
    subjects: string[];
  }) => { success: boolean; error?: string };
  onLogin: (email: string, password?: string) => { success: boolean; error?: string };
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  accounts,
  onRegister,
  onLogin,
}) => {
  // If no accounts exist, default to 'setup'. If accounts exist, default to 'login'.
  const [authMode, setAuthMode] = useState<'setup' | 'login'>(
    accounts.length === 0 ? 'setup' : 'login'
  );

  // Setup / Sign Up Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('');
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(15);
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState(120);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState('');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState(accounts[0]?.email || '');
  const [loginPassword, setLoginPassword] = useState('');

  // Error feedback
  const [errorMessage, setErrorMessage] = useState('');

  const commonSubjectSuggestions = [
    'Science',
    'Mathematics',
    'Social Studies',
    'English',
    'Computer Science',
    'Environment Science',
    'Health & Physical Ed',
    'Nepali',
    'Moral Education',
  ];

  const handleAddSubject = (subjectToAdd: string) => {
    const trimmed = subjectToAdd.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects([...subjects, trimmed]);
    }
    setSubjectInput('');
  };

  const handleRemoveSubject = (sub: string) => {
    setSubjects(subjects.filter((s) => s !== sub));
  };

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your student email address.');
      return;
    }
    if (subjects.length === 0) {
      setErrorMessage('Please add at least one subject or course.');
      return;
    }

    const res = onRegister({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      grade: grade.trim() || 'General Student',
      weeklyGoalHours: Number(weeklyGoalHours) || 15,
      dailyTargetMinutes: Number(dailyTargetMinutes) || 120,
      subjects,
    });

    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your email.');
      return;
    }

    const res = onLogin(loginEmail.trim(), loginPassword.trim());
    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-md shadow-indigo-200">
          SP
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          StudyPulse
        </h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          AI Socratic Tutor, personalized revision materials, and academic schedule manager.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200 rounded-3xl space-y-6">
          {/* Top Toggle if accounts exist */}
          {accounts.length > 0 && (
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('setup');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  authMode === 'setup'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Set Up New Account
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {errorMessage}
            </div>
          )}

          {/* MODE 1: FIRST-TIME SETUP / SIGN UP */}
          {authMode === 'setup' && (
            <form onSubmit={handleSetupSubmit} className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900">
                  {accounts.length === 0 ? 'First-Time Setup: Create Your Profile' : 'Student Account Setup'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your details to configure your weekly study targets and courses.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Hayes"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. jordan@school.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Grade / Academic Level
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grade 8, Grade 9"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-slate-400">Quick select:</span>
                    <button
                      type="button"
                      onClick={() => setGrade('Grade 8')}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                        grade === 'Grade 8'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Grade 8
                    </button>
                    <button
                      type="button"
                      onClick={() => setGrade('Grade 9')}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                        grade === 'Grade 9'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Grade 9
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password / PIN (Optional)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      placeholder="Choose a password or leave blank"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Study Targets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Weekly Study Goal (Hours)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={60}
                    value={weeklyGoalHours}
                    onChange={(e) => setWeeklyGoalHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Visualized on your dashboard against real study sessions.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Daily Focus Target (Minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={360}
                    value={dailyTargetMinutes}
                    onChange={(e) => setDailyTargetMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Tracked daily when you run the Pomodoro/focus timer.
                  </p>
                </div>
              </div>

              {/* Subjects / Courses Setup */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700">
                  Your Subjects / Courses *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a subject (e.g. AP Biology, Calculus)"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubject(subjectInput);
                      }
                    }}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSubject(subjectInput)}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Selected Subjects Tag Chips */}
                {subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {subjects.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg text-xs font-medium"
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(sub)}
                          className="text-indigo-400 hover:text-indigo-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick suggestions */}
                <div className="pt-1">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    Quick suggestions (click to add):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {commonSubjectSuggestions
                      .filter((s) => !subjects.includes(s))
                      .slice(0, 6)
                      .map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleAddSubject(s)}
                          className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
                        >
                          + {s}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Submit Setup */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Complete Setup & Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: RETURNING STUDENT LOGIN */}
          {authMode === 'login' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900">Sign In to Your Account</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Welcome back! Select a saved account or enter your email.
                </p>
              </div>

              {/* Saved accounts on this device */}
              {accounts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Accounts on this device
                  </span>
                  <div className="space-y-2">
                    {accounts.map((acc) => (
                      <div
                        key={acc.id}
                        onClick={() => {
                          onLogin(acc.email, acc.password);
                        }}
                        className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 bg-white transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={acc.avatar}
                            alt={acc.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {acc.name}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {acc.email} · {acc.grade}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-semibold text-indigo-600 group-hover:underline">
                          Log In →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your-email@school.edu"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password / PIN (if set)
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password or leave blank"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('setup');
                    setErrorMessage('');
                  }}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  Create another student profile →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
