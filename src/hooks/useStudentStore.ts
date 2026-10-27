import { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  StudentProfile,
  ExamDeadline,
  StudySession,
  Flashcard,
  QuizQuestion,
  SummaryNote,
  MilestoneBadge,
  ScheduledTask,
} from '../types';

export function useStudentStore() {
  // All stored accounts in this browser
  const [accounts, setAccounts] = useState<StudentProfile[]>(() => {
    try {
      const saved = localStorage.getItem('studypulse_accounts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Current active user ID
  const [activeUserId, setActiveUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('studypulse_active_user_id') || null;
    } catch {
      return null;
    }
  });

  // Storage for all user entities (scoped by userId)
  const [allExams, setAllExams] = useState<ExamDeadline[]>(() => {
    try {
      const saved = localStorage.getItem('studypulse_exams');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [allSessions, setAllSessions] = useState<StudySession[]>(() => {
    try {
      const saved = localStorage.getItem('studypulse_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [allTasks, setAllTasks] = useState<ScheduledTask[]>(() => {
    try {
      const saved = localStorage.getItem('studypulse_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem('studypulse_flashcards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [allQuizzes, setAllQuizzes] = useState<QuizQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('studypulse_quizzes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [allNotes, setAllNotes] = useState<SummaryNote[]>(() => {
    try {
      const saved = localStorage.getItem('studypulse_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('studypulse_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (activeUserId) {
      localStorage.setItem('studypulse_active_user_id', activeUserId);
    } else {
      localStorage.removeItem('studypulse_active_user_id');
    }
  }, [activeUserId]);

  useEffect(() => {
    localStorage.setItem('studypulse_exams', JSON.stringify(allExams));
  }, [allExams]);

  useEffect(() => {
    localStorage.setItem('studypulse_sessions', JSON.stringify(allSessions));
  }, [allSessions]);

  useEffect(() => {
    localStorage.setItem('studypulse_tasks', JSON.stringify(allTasks));
  }, [allTasks]);

  useEffect(() => {
    localStorage.setItem('studypulse_flashcards', JSON.stringify(allFlashcards));
  }, [allFlashcards]);

  useEffect(() => {
    localStorage.setItem('studypulse_quizzes', JSON.stringify(allQuizzes));
  }, [allQuizzes]);

  useEffect(() => {
    localStorage.setItem('studypulse_notes', JSON.stringify(allNotes));
  }, [allNotes]);

  // Current active profile
  const profile: StudentProfile | null = useMemo(() => {
    if (!activeUserId) return null;
    return accounts.find((a) => a.id === activeUserId) || null;
  }, [accounts, activeUserId]);

  // Entities scoped to the current user
  const exams = useMemo(() => {
    if (!activeUserId) return [];
    return allExams.filter((e) => e.userId === activeUserId);
  }, [allExams, activeUserId]);

  const sessions = useMemo(() => {
    if (!activeUserId) return [];
    return allSessions.filter((s) => s.userId === activeUserId);
  }, [allSessions, activeUserId]);

  const tasks = useMemo(() => {
    if (!activeUserId) return [];
    return allTasks.filter((t) => t.userId === activeUserId);
  }, [allTasks, activeUserId]);

  const flashcards = useMemo(() => {
    if (!activeUserId) return [];
    return allFlashcards.filter((f) => f.userId === activeUserId);
  }, [allFlashcards, activeUserId]);

  const quizzes = useMemo(() => {
    if (!activeUserId) return [];
    return allQuizzes.filter((q) => q.userId === activeUserId);
  }, [allQuizzes, activeUserId]);

  const notes = useMemo(() => {
    if (!activeUserId) return [];
    return allNotes.filter((n) => n.userId === activeUserId);
  }, [allNotes, activeUserId]);

  // Authentication Methods
  const registerAccount = (data: {
    name: string;
    email: string;
    password?: string;
    grade: string;
    weeklyGoalHours: number;
    dailyTargetMinutes: number;
    subjects: string[];
    avatar?: string;
  }): { success: boolean; error?: string } => {
    const trimmedEmail = data.email.trim().toLowerCase();
    const existing = accounts.find((a) => a.email.toLowerCase() === trimmedEmail);
    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const newId = `user-${Date.now()}`;
    const newProfile: StudentProfile = {
      id: newId,
      name: data.name.trim(),
      email: trimmedEmail,
      password: data.password || '',
      grade: data.grade.trim() || 'General Student',
      avatar:
        data.avatar ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250`,
      weeklyGoalHours: Math.max(1, data.weeklyGoalHours || 15),
      dailyTargetMinutes: Math.max(15, data.dailyTargetMinutes || 120),
      xp: 50, // Welcome XP bonus
      level: 1,
      streakDays: 1,
      lastStudyDate: new Date().toISOString().split('T')[0],
      subjects: data.subjects.length > 0 ? data.subjects : ['General Studies'],
    };

    setAccounts((prev) => [...prev, newProfile]);
    setActiveUserId(newId);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    return { success: true };
  };

  const login = (email: string, password?: string): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    const found = accounts.find((a) => a.email.toLowerCase() === trimmedEmail);

    if (!found) {
      return { success: false, error: 'Account not found. Please create an account.' };
    }

    if (found.password && password && found.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    setActiveUserId(found.id);
    return { success: true };
  };

  const logout = () => {
    setActiveUserId(null);
  };

  const updateProfile = (updates: Partial<StudentProfile>) => {
    if (!activeUserId) return;
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === activeUserId ? { ...acc, ...updates } : acc))
    );
  };

  // XP & Level calculations
  const awardXP = (amount: number, reason?: string) => {
    if (!activeUserId || !profile) return;
    const nextXP = profile.xp + amount;
    const nextLevel = Math.floor(nextXP / 350) + 1;
    const levelUp = nextLevel > profile.level;

    if (levelUp) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    updateProfile({
      xp: nextXP,
      level: nextLevel,
    });
  };

  // Log study session
  const logStudySession = (
    subject: string,
    durationMinutes: number,
    type: StudySession['type'],
    notesText?: string
  ) => {
    if (!activeUserId) return;
    const xp = Math.max(15, Math.round(durationMinutes * 1.5));
    const newSession: StudySession = {
      id: `sess-${Date.now()}`,
      userId: activeUserId,
      subject,
      durationMinutes,
      timestamp: new Date().toISOString(),
      type,
      notes: notesText,
      xpEarned: xp,
    };

    setAllSessions((prev) => [newSession, ...prev]);

    // Check and update streak
    if (profile) {
      const today = new Date().toISOString().split('T')[0];
      let newStreak = profile.streakDays;
      if (profile.lastStudyDate !== today) {
        const lastDate = new Date(profile.lastStudyDate);
        const currentDate = new Date(today);
        const diffDays = Math.round(
          (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      }
      updateProfile({
        lastStudyDate: today,
        streakDays: newStreak,
      });
    }

    awardXP(xp, `Completed ${durationMinutes}m focus on ${subject}`);
  };

  // Exam Methods
  const addExam = (exam: Omit<ExamDeadline, 'id' | 'userId' | 'completedTopics'>) => {
    if (!activeUserId) return;
    const newExam: ExamDeadline = {
      ...exam,
      id: `exam-${Date.now()}`,
      userId: activeUserId,
      completedTopics: [],
    };
    setAllExams((prev) => [...prev, newExam]);
    awardXP(25, 'Created exam preparation target');
  };

  const toggleExamTopic = (examId: string, topic: string) => {
    setAllExams((prev) =>
      prev.map((e) => {
        if (e.id === examId) {
          const isDone = e.completedTopics.includes(topic);
          const nextCompleted = isDone
            ? e.completedTopics.filter((t) => t !== topic)
            : [...e.completedTopics, topic];

          if (!isDone) awardXP(15, `Reviewed topic: ${topic}`);

          return { ...e, completedTopics: nextCompleted };
        }
        return e;
      })
    );
  };

  const deleteExam = (examId: string) => {
    setAllExams((prev) => prev.filter((e) => e.id !== examId));
  };

  // Task Methods
  const addTask = (task: Omit<ScheduledTask, 'id' | 'userId'>) => {
    if (!activeUserId) return;
    const newTask: ScheduledTask = {
      ...task,
      id: `task-${Date.now()}`,
      userId: activeUserId,
    };
    setAllTasks((prev) => [newTask, ...prev]);
    awardXP(10, 'Created study task');
  };

  const toggleTask = (taskId: string) => {
    setAllTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const next = !t.completed;
          if (next) awardXP(20, 'Completed study task');
          return { ...t, completed: next };
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setAllTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Flashcard Methods
  const addFlashcards = (cards: Omit<Flashcard, 'userId' | 'createdAt'>[]) => {
    if (!activeUserId) return;
    const now = new Date().toISOString();
    const newCards: Flashcard[] = cards.map((c, i) => ({
      ...c,
      id: c.id || `fc-${Date.now()}-${i}`,
      userId: activeUserId,
      createdAt: now,
    }));
    setAllFlashcards((prev) => [...newCards, ...prev]);
    awardXP(30, 'Generated personalized study flashcards');
  };

  const toggleFlashcardMastery = (cardId: string) => {
    setAllFlashcards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          const next = !c.mastered;
          if (next) awardXP(10, 'Mastered flashcard');
          return { ...c, mastered: next };
        }
        return c;
      })
    );
  };

  const deleteFlashcard = (cardId: string) => {
    setAllFlashcards((prev) => prev.filter((c) => c.id !== cardId));
  };

  // Quizzes & Notes
  const saveQuizzes = (newQuizzes: Omit<QuizQuestion, 'userId'>[]) => {
    if (!activeUserId) return;
    const items: QuizQuestion[] = newQuizzes.map((q, i) => ({
      ...q,
      id: q.id || `quiz-${Date.now()}-${i}`,
      userId: activeUserId,
    }));
    setAllQuizzes((prev) => [...items, ...prev]);
  };

  const saveNotes = (newNotes: Omit<SummaryNote, 'userId'>[]) => {
    if (!activeUserId) return;
    const items: SummaryNote[] = newNotes.map((n, i) => ({
      ...n,
      id: `note-${Date.now()}-${i}`,
      userId: activeUserId,
    }));
    setAllNotes((prev) => [...items, ...prev]);
  };

  // Real Weekly Stats from User's Actual Sessions
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentSessions = sessions.filter(
    (s) => new Date(s.timestamp).getTime() >= oneWeekAgo
  );

  const totalWeeklyMinutes = recentSessions.reduce(
    (acc, s) => acc + s.durationMinutes,
    0
  );
  const totalWeeklyHours = parseFloat((totalWeeklyMinutes / 60).toFixed(1));
  const weeklyTarget = profile?.weeklyGoalHours || 15;
  const weeklyGoalPercentage = Math.min(
    100,
    Math.round((totalWeeklyHours / weeklyTarget) * 100)
  );

  // Daily hours breakdown (Mon - Sun) computed from ACTUAL user sessions
  const dailyHoursMap: Record<string, number> = {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0,
  };

  recentSessions.forEach((s) => {
    const day = new Date(s.timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
    });
    if (dailyHoursMap[day] !== undefined) {
      dailyHoursMap[day] = parseFloat(
        (dailyHoursMap[day] + s.durationMinutes / 60).toFixed(1)
      );
    }
  });

  // Dynamic Badges calculated from actual activity
  const completedFocusSessionsCount = sessions.filter((s) => s.type === 'pomodoro' || s.type === 'custom').length;
  const masteredCardsCount = flashcards.filter((f) => f.mastered).length;
  const streak = profile?.streakDays || 0;
  const totalStudyMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const badges: MilestoneBadge[] = [
    {
      id: 'b-first-step',
      name: 'First Step',
      description: 'Complete your first focused study session',
      category: 'sessions',
      icon: 'Compass',
      progress: Math.min(100, Math.round((completedFocusSessionsCount / 1) * 100)),
      target: 1,
      current: completedFocusSessionsCount,
      unlockedAt: completedFocusSessionsCount >= 1 ? 'Unlocked' : undefined,
    },
    {
      id: 'b-focus-pro',
      name: 'Focus Dedicated',
      description: 'Complete 5 focused study timer blocks',
      category: 'sessions',
      icon: 'Timer',
      progress: Math.min(100, Math.round((completedFocusSessionsCount / 5) * 100)),
      target: 5,
      current: completedFocusSessionsCount,
      unlockedAt: completedFocusSessionsCount >= 5 ? 'Unlocked' : undefined,
    },
    {
      id: 'b-streak-week',
      name: '3-Day Consistency',
      description: 'Maintain a 3-day consecutive study streak',
      category: 'streak',
      icon: 'Flame',
      progress: Math.min(100, Math.round((streak / 3) * 100)),
      target: 3,
      current: streak,
      unlockedAt: streak >= 3 ? 'Unlocked' : undefined,
    },
    {
      id: 'b-card-master',
      name: 'Memory Builder',
      description: 'Master 5 personalized concept flashcards',
      category: 'quiz',
      icon: 'Award',
      progress: Math.min(100, Math.round((masteredCardsCount / 5) * 100)),
      target: 5,
      current: masteredCardsCount,
      unlockedAt: masteredCardsCount >= 5 ? 'Unlocked' : undefined,
    },
    {
      id: 'b-century-club',
      name: 'Century Scholar',
      description: 'Accumulate 100 total study minutes',
      category: 'goals',
      icon: 'TrendingUp',
      progress: Math.min(100, Math.round((totalStudyMinutes / 100) * 100)),
      target: 100,
      current: totalStudyMinutes,
      unlockedAt: totalStudyMinutes >= 100 ? 'Unlocked' : undefined,
    },
  ];

  return {
    accounts,
    activeUserId,
    profile,
    exams,
    sessions,
    tasks,
    flashcards,
    quizzes,
    notes,
    badges,
    totalWeeklyHours,
    weeklyGoalPercentage,
    dailyHoursMap,
    registerAccount,
    login,
    logout,
    updateProfile,
    awardXP,
    logStudySession,
    addExam,
    toggleExamTopic,
    deleteExam,
    addTask,
    toggleTask,
    deleteTask,
    addFlashcards,
    toggleFlashcardMastery,
    deleteFlashcard,
    saveQuizzes,
    saveNotes,
  };
}
