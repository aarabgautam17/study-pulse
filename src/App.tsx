import React, { useState } from 'react';
import { ActiveTab } from './types';
import { useStudentStore } from './hooks/useStudentStore';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SocraticTutorView } from './components/SocraticTutorView';
import { StudyTimerView } from './components/StudyTimerView';
import { ScheduleView } from './components/ScheduleView';
import { ProgressView } from './components/ProgressView';
import { LoginProfileView } from './components/LoginProfileView';
import { QuickTimerModal } from './components/QuickTimerModal';
import { ShowcaseModal } from './components/ShowcaseModal';

export default function App() {
  const store = useStudentStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isQuickTimerOpen, setIsQuickTimerOpen] = useState(false);
  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false);
  const [prefilledTimerSubject, setPrefilledTimerSubject] = useState<string | undefined>();
  const [prefilledTimerMinutes, setPrefilledTimerMinutes] = useState<number | undefined>();

  // If no student is currently logged in, show the AuthScreen (First-Time Setup or Login)
  if (!store.profile) {
    return (
      <AuthScreen
        accounts={store.accounts}
        onRegister={(data) => {
          const res = store.registerAccount(data);
          if (res.success) {
            setActiveTab('dashboard');
          }
          return res;
        }}
        onLogin={(email, password) => {
          const res = store.login(email, password);
          if (res.success) {
            setActiveTab('dashboard');
          }
          return res;
        }}
      />
    );
  }

  const handleStartTimerFromOtherView = (subject: string, minutes: number) => {
    setPrefilledTimerSubject(subject);
    setPrefilledTimerMinutes(minutes);
    setActiveTab('timer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={store.profile}
        onOpenQuickTimer={() => setIsQuickTimerOpen(true)}
        onLogout={store.logout}
        onOpenShowcase={() => setIsShowcaseOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={store.profile}
            totalWeeklyHours={store.totalWeeklyHours}
            weeklyGoalPercentage={store.weeklyGoalPercentage}
            dailyHoursMap={store.dailyHoursMap}
            exams={store.exams}
            tasks={store.tasks}
            onToggleTask={store.toggleTask}
            onNavigateTab={setActiveTab}
            onStartTimer={handleStartTimerFromOtherView}
          />
        )}

        {activeTab === 'tutor' && (
          <SocraticTutorView
            profile={store.profile}
            flashcards={store.flashcards}
            onToggleFlashcard={store.toggleFlashcardMastery}
            onAddFlashcards={store.addFlashcards}
            onAwardXP={store.awardXP}
          />
        )}

        {activeTab === 'timer' && (
          <StudyTimerView
            profile={store.profile}
            initialSubject={prefilledTimerSubject}
            initialMinutes={prefilledTimerMinutes}
            onLogSession={store.logStudySession}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            profile={store.profile}
            exams={store.exams}
            tasks={store.tasks}
            onAddExam={store.addExam}
            onToggleExamTopic={store.toggleExamTopic}
            onDeleteExam={store.deleteExam}
            onToggleTask={store.toggleTask}
            onAddTask={store.addTask}
            onStartTimer={handleStartTimerFromOtherView}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressView
            profile={store.profile}
            accounts={store.accounts}
            sessions={store.sessions}
            badges={store.badges}
            totalWeeklyHours={store.totalWeeklyHours}
            weeklyGoalPercentage={store.weeklyGoalPercentage}
            dailyHoursMap={store.dailyHoursMap}
          />
        )}

        {activeTab === 'login' && (
          <LoginProfileView
            profile={store.profile}
            allProfiles={store.accounts}
            onSwitchProfile={(id) => {
              const target = store.accounts.find((a) => a.id === id);
              if (target) store.login(target.email, target.password);
            }}
            onUpdateProfile={store.updateProfile}
            onLogout={store.logout}
            onOpenCreateAccount={store.logout}
          />
        )}
      </main>

      {/* Floating Quick Timer Modal */}
      <QuickTimerModal
        isOpen={isQuickTimerOpen}
        onClose={() => setIsQuickTimerOpen(false)}
        profile={store.profile}
        onOpenFullTimer={() => {
          setIsQuickTimerOpen(false);
          setActiveTab('timer');
        }}
        onLogSession={store.logStudySession}
      />

      {/* School Innovation Challenge Showcase Modal */}
      <ShowcaseModal
        isOpen={isShowcaseOpen}
        onClose={() => setIsShowcaseOpen(false)}
        profile={store.profile}
      />

      {/* Clean, quiet footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>StudyPulse Academic Companion · Guided Socratic Learning</span>
          <div className="flex items-center gap-4 text-slate-600">
            <button onClick={() => setActiveTab('dashboard')} className="hover:underline">Dashboard</button>
            <button onClick={() => setActiveTab('tutor')} className="hover:underline">Socratic Tutor</button>
            <button onClick={() => setActiveTab('timer')} className="hover:underline">Focus Timer</button>
            <button onClick={() => setActiveTab('progress')} className="hover:underline">Progress</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
