import React from 'react';
import {
  ActiveTab,
  StudentProfile,
  ExamDeadline,
  ScheduledTask,
} from '../types';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Award,
} from 'lucide-react';

interface DashboardViewProps {
  profile: StudentProfile;
  totalWeeklyHours: number;
  weeklyGoalPercentage: number;
  dailyHoursMap: Record<string, number>;
  exams: ExamDeadline[];
  tasks: ScheduledTask[];
  onToggleTask: (taskId: string) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onStartTimer: (subject: string, minutes: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  totalWeeklyHours,
  weeklyGoalPercentage,
  dailyHoursMap,
  exams,
  tasks,
  onToggleTask,
  onNavigateTab,
  onStartTimer,
}) => {
  // Sort exams by closest deadline
  const sortedExams = [...exams].sort(
    (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  );

  const formatCountdown = (dateString: string) => {
    const diff = new Date(dateString).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Passed';
    if (days === 0) return 'Today!';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  const getUrgencyColor = (dateString: string) => {
    const diff = new Date(dateString).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 3) return 'text-rose-600 bg-rose-50 border-rose-200';
    if (days <= 7) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-slate-600 bg-slate-100 border-slate-200';
  };

  const todayTasks = tasks.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner with Desk Setup Visual */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="p-6 sm:p-8 lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>{profile.grade}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {profile.streakDays}-Day Streak Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {profile.name.split(' ')[0]}!
            </h1>

            <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
              Your weekly target is <strong className="text-slate-900">{profile.weeklyGoalHours} hours</strong>. You have completed <strong className="text-indigo-600 tabular-nums">{totalWeeklyHours} hours ({weeklyGoalPercentage}%)</strong> so far. Keep your study streak going strong!
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigateTab('tutor')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask Socratic Tutor</span>
              </button>

              <button
                onClick={() => onNavigateTab('timer')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Start Focus Timer</span>
              </button>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-5 h-full min-h-[220px] relative">
            <img
              src="/src/assets/images/study_dashboard_hero_1792985526117.jpg"
              alt="Organized study workspace with tablet and study notes"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-r-2xl border-l border-slate-100"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Grid: Weekly Goals Visualizer & Upcoming Exam Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Weekly Study Goals Visualization (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Weekly Study Goal</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target: {profile.weeklyGoalHours} hours · Measured Monday to Sunday
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold tabular-nums font-mono text-indigo-600">
                  {totalWeeklyHours}
                </span>
                <span className="text-xs text-slate-500 ml-1">/ {profile.weeklyGoalHours}h</span>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-1"
                  style={{ width: `${Math.min(100, Math.max(5, weeklyGoalPercentage))}%` }}
                >
                  {weeklyGoalPercentage >= 20 && (
                    <span className="text-[10px] font-bold text-white leading-none">
                      {weeklyGoalPercentage}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>0 hrs</span>
                <span>{Math.round(profile.weeklyGoalHours / 2)} hrs</span>
                <span>{profile.weeklyGoalHours} hrs Goal</span>
              </div>
            </div>

            {/* Daily Distribution Chart */}
            <div className="pt-2">
              <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                Daily Study Distribution (Hours)
              </h3>
              <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-36 pt-4 border-b border-slate-100">
                {Object.entries(dailyHoursMap).map(([day, hours]) => {
                  const maxHours = Math.max(3.5, ...Object.values(dailyHoursMap));
                  const heightPercent = Math.min(100, Math.round((hours / maxHours) * 100));
                  const isToday =
                    day ===
                    new Date().toLocaleDateString('en-US', { weekday: 'short' });

                  return (
                    <div key={day} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[11px] font-mono tabular-nums text-slate-500 group-hover:text-indigo-600 font-medium transition-colors">
                        {hours}h
                      </span>
                      <div className="w-full max-w-[2.25rem] bg-slate-100 rounded-t-md relative flex items-end h-24 overflow-hidden">
                        <div
                          className={`w-full transition-all duration-300 rounded-t-md ${
                            isToday
                              ? 'bg-indigo-600'
                              : 'bg-indigo-300 group-hover:bg-indigo-500'
                          }`}
                          style={{ height: `${Math.max(8, heightPercent)}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isToday ? 'text-indigo-600 font-bold' : 'text-slate-600'
                        }`}
                      >
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick stats footer */}
            <div className="grid grid-cols-3 gap-4 pt-2 text-center border-t border-slate-100">
              <div>
                <span className="text-xs text-slate-500 block">Current Level</span>
                <span className="text-sm font-bold text-slate-900">Level {profile.level} Scholar</span>
              </div>
              <div className="border-x border-slate-100">
                <span className="text-xs text-slate-500 block">Total XP</span>
                <span className="text-sm font-bold text-indigo-600 font-mono tabular-nums">
                  {profile.xp.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Daily Target</span>
                <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                  {profile.dailyTargetMinutes} mins
                </span>
              </div>
            </div>
          </div>

          {/* Today's Study Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Today's Schedule & Action Items</h2>
              <button
                onClick={() => onNavigateTab('schedule')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {todayTasks.length === 0 ? (
                <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No study tasks added yet</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Plan your day by adding targeted study tasks or revision goals in your schedule.
                  </p>
                  <button
                    onClick={() => onNavigateTab('schedule')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 pt-1"
                  >
                    <span>+ Add Task in Schedule</span>
                  </button>
                </div>
              ) : (
                todayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onToggleTask(task.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      task.completed
                        ? 'bg-slate-50/80 border-slate-200 text-slate-400'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs text-slate-800'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <CheckCircle2
                        className={`w-5 h-5 ${
                          task.completed ? 'text-emerald-500 fill-emerald-50' : 'text-slate-300'
                        }`}
                      />
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span>{task.subject}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{task.durationMinutes} mins</span>
                      </div>
                    </div>

                    {!task.completed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartTimer(task.subject, task.durationMinutes);
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors whitespace-nowrap shrink-0"
                      >
                        Start
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Exam Deadlines (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Upcoming Exam Deadlines</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prioritized by remaining study days
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('schedule')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Add Exam</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {sortedExams.length === 0 ? (
                <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No exam deadlines scheduled yet</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Add your upcoming midterms, quizzes, or finals to get countdowns and topic trackers.
                  </p>
                  <button
                    onClick={() => onNavigateTab('schedule')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>+ Add Your First Exam</span>
                  </button>
                </div>
              ) : (
                sortedExams.map((exam) => {
                  const totalTopics = exam.topicsToReview.length;
                  const completedCount = exam.completedTopics.length;
                  const progressPct =
                    totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
                  const countdown = formatCountdown(exam.examDate);
                  const urgencyStyle = getUrgencyColor(exam.examDate);

                  return (
                    <div
                      key={exam.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                            {exam.subject}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                            {exam.title}
                          </h4>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border shrink-0 whitespace-nowrap ${urgencyStyle}`}
                        >
                          {countdown}
                        </span>
                      </div>

                      {exam.location && (
                        <p className="text-xs text-slate-500">
                          Location: {exam.location}
                        </p>
                      )}

                      {/* Topic Review Progress */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-100">
                        <div className="flex justify-between text-xs text-slate-600 font-medium">
                          <span>Topics Mastered</span>
                          <span className="tabular-nums font-mono">
                            {completedCount} / {totalTopics} ({progressPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => onNavigateTab('tutor')}
                          className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          <span>Socratic Review Topics</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => onStartTimer(exam.subject, 30)}
                          className="text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors"
                        >
                          Revise Now
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Revision Toolkit launcher */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white space-y-3 shadow-md">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-300" />
              <h3 className="text-base font-bold text-white">Socratic Anti-Cheating Tutor</h3>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Stuck on a tricky problem? The AI Tutor guides you step-by-step with simple analogies and questions, ensuring you actually understand concepts instead of copying answers.
            </p>
            <button
              onClick={() => onNavigateTab('tutor')}
              className="w-full mt-2 py-2 px-4 bg-white text-indigo-900 hover:bg-indigo-50 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Open AI Tutor & Generate Flashcards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
