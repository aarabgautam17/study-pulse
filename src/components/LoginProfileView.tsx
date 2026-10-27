import React, { useState } from 'react';
import {
  User,
  Users,
  Settings,
  Shield,
  CheckCircle2,
  Flame,
  Award,
  Sparkles,
  ArrowRight,
  Plus,
  LogOut,
  UserPlus,
} from 'lucide-react';
import { StudentProfile } from '../types';

interface LoginProfileViewProps {
  profile: StudentProfile;
  allProfiles: StudentProfile[];
  onSwitchProfile: (id: string) => void;
  onUpdateProfile: (updates: Partial<StudentProfile>) => void;
  onLogout: () => void;
  onOpenCreateAccount: () => void;
}

export const LoginProfileView: React.FC<LoginProfileViewProps> = ({
  profile,
  allProfiles,
  onSwitchProfile,
  onUpdateProfile,
  onLogout,
  onOpenCreateAccount,
}) => {
  const [name, setName] = useState(profile.name);
  const [grade, setGrade] = useState(profile.grade);
  const [weeklyGoal, setWeeklyGoal] = useState(profile.weeklyGoalHours);
  const [dailyTarget, setDailyTarget] = useState(profile.dailyTargetMinutes);
  const [newSubject, setNewSubject] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      grade,
      weeklyGoalHours: Number(weeklyGoal),
      dailyTargetMinutes: Number(dailyTarget),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    if (!profile.subjects.includes(newSubject.trim())) {
      onUpdateProfile({
        subjects: [...profile.subjects, newSubject.trim()],
      });
    }
    setNewSubject('');
  };

  const handleRemoveSubject = (subjectToRemove: string) => {
    onUpdateProfile({
      subjects: profile.subjects.filter((s) => s !== subjectToRemove),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Account Info & Switcher Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Student Profile & Account</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Signed in as <strong className="text-slate-900">{profile.email}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCreateAccount}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Account</span>
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {allProfiles.length > 1 && (
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Switch Student Account
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {allProfiles.map((p) => {
                const isActive = p.id === profile.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSwitchProfile(p.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{p.grade}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-600">
                      <span className="flex items-center gap-1 text-amber-600 font-semibold">
                        <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {p.streakDays}d
                      </span>
                      <span className="font-mono tabular-nums text-indigo-600 font-semibold">
                        {p.xp} XP
                      </span>
                      {isActive ? (
                        <span className="text-indigo-600 font-bold text-[11px]">Active</span>
                      ) : (
                        <span className="text-slate-400 text-[11px] hover:text-slate-600">Switch</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile & Academic Preferences Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Academic Goals & Preferences</h3>
            <p className="text-xs text-slate-500 mt-0.5">Customize your weekly targets and active course list</p>
          </div>
          {isSaved && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved successfully!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Grade / Academic Level
              </label>
              <input
                type="text"
                required
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Weekly Study Target (Hours)
              </label>
              <input
                type="number"
                min={2}
                max={60}
                required
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                className="w-full text-sm font-mono tabular-nums p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Visualized on your dashboard against real study sessions.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Daily Focus Target (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={360}
                required
                value={dailyTarget}
                onChange={(e) => setDailyTarget(Number(e.target.value))}
                className="w-full text-sm font-mono tabular-nums p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Recommended: 120-180 minutes of focused Pomodoro work.
              </p>
            </div>
          </div>

          {/* Subjects List Manager */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700">
              Active Courses / Study Subjects
            </label>
            <div className="flex flex-wrap gap-2">
              {profile.subjects.map((sub) => (
                <span
                  key={sub}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-900 rounded-lg text-xs font-medium border border-indigo-200"
                >
                  <span>{sub}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(sub)}
                    className="text-indigo-400 hover:text-rose-600 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add subject (e.g. Psychology)"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg flex-1 text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddSubject}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-95"
            >
              Save Goals & Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
