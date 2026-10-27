import React from 'react';
import { ActiveTab, StudentProfile } from '../types';
import { Play, Sparkles, Flame, Clock } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  profile: StudentProfile;
  onOpenQuickTimer: () => void;
  onLogout: () => void;
  onOpenShowcase?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  onOpenQuickTimer,
  onLogout,
  onOpenShowcase,
}) => {
  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tutor', label: 'AI Tutor & Revision' },
    { id: 'timer', label: 'Study Timer' },
    { id: 'schedule', label: 'Schedule & Exams' },
    { id: 'progress', label: 'Progress & Rank' },
    { id: 'login', label: 'Student Profile' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand wordmark (single text element, no badges) */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left group transition-transform active:scale-95 shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
              SP
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                StudyPulse
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (clean single-line text links with active indicator) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Quick Stats & Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Streak & XP pill-free counter */}
            <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-slate-600 border-r border-slate-200 pr-3">
              <span className="flex items-center gap-1 text-amber-600 font-semibold tabular-nums">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                {profile.streakDays}d Streak
              </span>
              <span className="text-slate-300">·</span>
              <span className="tabular-nums font-mono text-indigo-600 font-semibold">
                {profile.xp.toLocaleString()} XP
              </span>
            </div>

            {/* Competition Showcase Button */}
            {onOpenShowcase && (
              <button
                onClick={onOpenShowcase}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors whitespace-nowrap"
                title="School Innovation Challenge Showcase Card"
              >
                <span>🏆 School Showcase</span>
              </button>
            )}

            {/* Quick Timer Button */}
            <button
              onClick={onOpenQuickTimer}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Quick Focus</span>
            </button>

            {/* Profile Avatar Trigger */}
            <button
              onClick={() => setActiveTab('login')}
              title={`Switch profile or view ${profile.name}`}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <img
                src={profile.avatar}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-200 ring-2 ring-transparent hover:ring-indigo-400 transition-all"
              />
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Scroll */}
        <div className="flex md:hidden items-center gap-1 py-2 overflow-x-auto no-scrollbar border-t border-slate-100">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
