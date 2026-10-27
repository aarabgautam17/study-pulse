export type ActiveTab = 'dashboard' | 'tutor' | 'timer' | 'schedule' | 'progress' | 'login';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  grade: string;
  avatar: string;
  weeklyGoalHours: number;
  dailyTargetMinutes: number;
  xp: number;
  level: number;
  streakDays: number;
  lastStudyDate: string; // YYYY-MM-DD
  subjects: string[];
}

export interface ExamDeadline {
  id: string;
  userId: string;
  subject: string;
  title: string;
  examDate: string; // YYYY-MM-DDTHH:mm
  location?: string;
  topicsToReview: string[];
  completedTopics: string[];
}

export interface StudySession {
  id: string;
  userId: string;
  subject: string;
  durationMinutes: number;
  timestamp: string; // ISO date
  type: 'pomodoro' | 'custom' | 'quiz' | 'tutor' | 'flashcards';
  notes?: string;
  xpEarned: number;
}

export interface Flashcard {
  id: string;
  userId: string;
  subject: string;
  question: string;
  conceptHint: string;
  detailedExplanation: string;
  mastered: boolean;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  userId: string;
  subject?: string;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
  userAnswer?: number;
}

export interface SummaryNote {
  id: string;
  userId: string;
  title: string;
  subject: string;
  keyPoints: string[];
  examTips: string[];
  createdAt: string;
}

export interface MilestoneBadge {
  id: string;
  name: string;
  description: string;
  category: 'streak' | 'sessions' | 'quiz' | 'tutor' | 'goals';
  icon: string;
  unlockedAt?: string;
  progress: number; // 0 to 100
  target: number;
  current: number;
}

export interface ScheduledTask {
  id: string;
  userId: string;
  title: string;
  subject: string;
  dueDate: string; // YYYY-MM-DD
  durationMinutes: number;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}
