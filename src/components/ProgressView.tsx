import React from 'react';
import {
  Award,
  Flame,
  TrendingUp,
  Clock,
  BookOpen,
  CheckCircle2,
  Users,
  Trophy,
  ShieldCheck,
  Star,
} from 'lucide-react';
import {
  StudentProfile,
  StudySession,
  MilestoneBadge,
} from '../types';

interface ProgressViewProps {
  profile: StudentProfile;
  accounts: StudentProfile[];
  sessions: StudySession[];
  badges: MilestoneBadge[];
  totalWeeklyHours: number;
  weeklyGoalPercentage: number;
  dailyHoursMap: Record<string, number>;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  profile,
  accounts,
  sessions,
  badges,
  totalWeeklyHours,
  weeklyGoalPercentage,
  dailyHoursMap,
}) => {
  // Sort accounts by XP to form real leaderboard
  const sortedAccounts = [...accounts].sort((a, b) => b.xp - a.xp);

  // Subject breakdown from real user sessions
  const subjectHoursMap: Record<string, number> = {};
  sessions.forEach((s) => {
    subjectHoursMap[s.subject] = (subjectHoursMap[s.subject] || 0) + s.durationMinutes / 60;
  });

  const totalSubjectHours = Object.values(subjectHoursMap).reduce((a, b) => a + b, 0) || 1;

  // XP for next level calculation (350 XP per level)
  const currentLevelFloor = (profile.level - 1) * 350;
  const nextLevelCeil = profile.level * 350;
  const levelXPProgress = Math.min(
    100,
    Math.max(0, Math.round(((profile.xp - currentLevelFloor) / 350) * 100))
  );

  return (
    <div className="space-y-8">
      {/* Top Level & XP Header Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-500/30 border border-indigo-400/40 rounded-lg text-xs font-semibold text-indigo-200">
                Level {profile.level} Scholar
              </span>
              <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                {profile.streakDays}-Day Streak
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {profile.name}'s Academic Progress
            </h2>

            {/* Level XP Progress Bar */}
            <div className="space-y-1.5 max-w-lg">
              <div className="flex justify-between text-xs text-indigo-200">
                <span>
                  Level {profile.level} ({profile.xp} XP)
                </span>
                <span>
                  Level {profile.level + 1} ({nextLevelCeil} XP)
                </span>
              </div>
              <div className="w-full bg-indigo-950/80 rounded-full h-3 p-0.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${levelXPProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-4 grid grid-cols-2 gap-3 text-center">
            <div className="p-3.5 bg-white/10 rounded-xl backdrop-blur-xs">
              <span className="text-[11px] text-indigo-200 block">Weekly Study</span>
              <span className="text-xl font-bold font-mono tabular-nums text-white">
                {totalWeeklyHours}h
              </span>
            </div>
            <div className="p-3.5 bg-white/10 rounded-xl backdrop-blur-xs">
              <span className="text-[11px] text-indigo-200 block">Goal Reached</span>
              <span className="text-xl font-bold font-mono tabular-nums text-amber-400">
                {weeklyGoalPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics: Weekly Hours & Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly Goals Visualizer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Goal Breakdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Target: {profile.weeklyGoalHours} hours · Measured Mon-Sun
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              {weeklyGoalPercentage}% of Goal
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4 border-b border-slate-100">
            {Object.entries(dailyHoursMap).map(([day, hours]) => {
              const maxHours = Math.max(3.5, ...Object.values(dailyHoursMap));
              const heightPercent = Math.min(100, Math.round((hours / maxHours) * 100));

              return (
                <div key={day} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[11px] font-mono tabular-nums text-slate-500 font-medium">
                    {hours}h
                  </span>
                  <div className="w-full max-w-[2rem] bg-slate-100 rounded-t-md relative flex items-end h-24 overflow-hidden">
                    <div
                      className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-t-md transition-all duration-300"
                      style={{ height: `${Math.max(8, heightPercent)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600">{day}</span>
                </div>
              );
            })}
          </div>

          {/* Subject Mastery Distribution */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Time Studied by Subject
            </h4>
            {Object.keys(subjectHoursMap).length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center border border-dashed border-slate-100 rounded-lg">
                No subject study sessions recorded yet. Start a study timer to track your subject distribution!
              </p>
            ) : (
              <div className="space-y-2">
                {Object.entries(subjectHoursMap).map(([sub, hours]) => {
                  const percent = Math.round((hours / totalSubjectHours) * 100);
                  return (
                    <div key={sub} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-700">
                        <span>{sub}</span>
                        <span className="font-mono tabular-nums text-slate-500">
                          {hours.toFixed(1)} hrs ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Real Student Leaderboard (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Student Rankings</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ranks determined by earned study XP
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {sortedAccounts.map((user, rank) => {
              const isCurrentUser = user.id === profile.id;
              const isFirst = rank === 0;
              const isSecond = rank === 1;
              const isThird = rank === 2;

              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isCurrentUser
                      ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-medium shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isFirst
                          ? 'bg-amber-100 text-amber-800'
                          : isSecond
                          ? 'bg-slate-200 text-slate-700'
                          : isThird
                          ? 'bg-amber-50 text-amber-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {rank + 1}
                    </span>

                    <img
                      src={user.avatar}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />

                    <div>
                      <h4 className="text-xs font-bold leading-tight">
                        {user.name} {isCurrentUser && '(You)'}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span>{user.grade}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                          <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {user.streakDays}d
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-mono tabular-nums text-indigo-600 font-bold block">
                      {user.xp.toLocaleString()} XP
                    </span>
                    <span className="text-[10px] text-slate-400">Level {user.level}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Milestone Badges Showcase */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <span>Milestone Badges & Achievements</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Progress tracked automatically as you complete study timers, flashcards, and quizzes
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const isUnlocked = badge.progress >= 100;

            return (
              <div
                key={badge.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  isUnlocked
                    ? 'bg-white border-indigo-200 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  {isUnlocked ? (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-500">
                      In Progress
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{badge.name}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-500">
                    <span>
                      {badge.current} / {badge.target}
                    </span>
                    <span>{badge.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isUnlocked ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, badge.progress)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Focus Session Log History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Study Sessions Log</h3>
        {sessions.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">No study sessions recorded yet</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Start a Pomodoro or custom focus session to automatically record your study time here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sessions.slice(0, 10).map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="font-bold text-slate-900">{s.subject}</span>
                    {s.notes && (
                      <p className="text-slate-500 text-[11px] mt-0.5">{s.notes}</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold font-mono tabular-nums text-slate-800 block">
                    {s.durationMinutes} mins
                  </span>
                  <span className="font-mono tabular-nums text-indigo-600 font-semibold">
                    +{s.xpEarned} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
