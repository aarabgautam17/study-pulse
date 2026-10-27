import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  CheckCircle2,
  Coffee,
  Settings,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { soundEffects } from '../utils/audio';
import { LofiPlayerWidget } from './LofiPlayerWidget';

interface StudyTimerViewProps {
  profile: StudentProfile;
  initialSubject?: string;
  initialMinutes?: number;
  onLogSession: (subject: string, minutes: number, type: 'pomodoro' | 'custom', notes?: string) => void;
}

export const StudyTimerView: React.FC<StudyTimerViewProps> = ({
  profile,
  initialSubject,
  initialMinutes,
  onLogSession,
}) => {
  const [timerMode, setTimerMode] = useState<'study' | 'shortBreak' | 'longBreak'>('study');
  const [selectedSubject, setSelectedSubject] = useState(
    initialSubject || profile.subjects[0] || 'General'
  );
  const [sessionNotes, setSessionNotes] = useState('');

  // Durations in minutes
  const [studyDuration, setStudyDuration] = useState(initialMinutes || 25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Current timer state in seconds
  const [secondsRemaining, setSecondsRemaining] = useState(studyDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial props
  useEffect(() => {
    if (initialMinutes) {
      setStudyDuration(initialMinutes);
      setSecondsRemaining(initialMinutes * 60);
      setIsRunning(false);
    }
  }, [initialMinutes]);

  useEffect(() => {
    if (initialSubject) {
      setSelectedSubject(initialSubject);
    }
  }, [initialSubject]);

  // Main countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timerMode]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    if (timerMode === 'study') {
      if (soundEnabled) soundEffects.playFocusComplete();
      onLogSession(selectedSubject, studyDuration, 'pomodoro', sessionNotes);

      // Auto-switch to short break
      setTimerMode('shortBreak');
      setSecondsRemaining(shortBreakDuration * 60);
    } else {
      if (soundEnabled) soundEffects.playBreakChime();
      // Break over -> ready to study
      setTimerMode('study');
      setSecondsRemaining(studyDuration * 60);
    }
  };

  const handleToggleRunning = () => {
    if (soundEnabled) soundEffects.playClick();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    if (soundEnabled) soundEffects.playClick();
    setIsRunning(false);
    if (timerMode === 'study') {
      setSecondsRemaining(studyDuration * 60);
    } else if (timerMode === 'shortBreak') {
      setSecondsRemaining(shortBreakDuration * 60);
    } else {
      setSecondsRemaining(longBreakDuration * 60);
    }
  };

  const switchMode = (mode: 'study' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setTimerMode(mode);
    if (mode === 'study') setSecondsRemaining(studyDuration * 60);
    if (mode === 'shortBreak') setSecondsRemaining(shortBreakDuration * 60);
    if (mode === 'longBreak') setSecondsRemaining(longBreakDuration * 60);
  };

  const currentTotalSeconds =
    timerMode === 'study'
      ? studyDuration * 60
      : timerMode === 'shortBreak'
      ? shortBreakDuration * 60
      : longBreakDuration * 60;

  const progress = Math.max(0, Math.min(1, 1 - secondsRemaining / currentTotalSeconds));

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Timer Container Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 text-center relative overflow-hidden">
        {/* Top Mode Segmented Control */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl max-w-md mx-auto">
          <button
            onClick={() => switchMode('study')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              timerMode === 'study'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Study Focus
          </button>
          <button
            onClick={() => switchMode('shortBreak')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              timerMode === 'shortBreak'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Short Break
          </button>
          <button
            onClick={() => switchMode('longBreak')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              timerMode === 'longBreak'
                ? 'bg-white text-amber-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Long Break
          </button>
        </div>

        {/* Circular Countdown Gauge */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-slate-100"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress ring */}
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className={`transition-all duration-500 ease-linear ${
                timerMode === 'study'
                  ? 'stroke-indigo-600'
                  : timerMode === 'shortBreak'
                  ? 'stroke-emerald-500'
                  : 'stroke-amber-500'
              }`}
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 126}`}
              strokeDashoffset={`${2 * Math.PI * 126 * (1 - progress)}`}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            <span className="text-5xl sm:text-6xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
              {formatTime(secondsRemaining)}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {timerMode === 'study' ? selectedSubject : 'Recharge Time'}
            </span>
          </div>
        </div>

        {/* Controls: Play/Pause, Reset, Settings, Sound */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            title="Reset timer"
            className="p-3 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggleRunning}
            className={`px-8 py-3.5 rounded-2xl text-white font-bold text-base shadow-sm transition-transform active:scale-95 flex items-center gap-2 ${
              timerMode === 'study'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute sound chimes' : 'Enable sound chimes'}
            className="p-3 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            title="Timer interval settings"
            className="p-3 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Focus Subject & Notes Input */}
        {timerMode === 'study' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Study Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {profile.subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Session Focus / Goal
              </label>
              <input
                type="text"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="e.g. Solve 5 calculus problems"
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Custom Duration Settings Popover */}
        {isSettingsOpen && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Custom Intervals (Minutes)
              </h4>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-xs text-indigo-600 font-semibold"
              >
                Done
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Study Duration</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={studyDuration}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStudyDuration(val);
                    if (timerMode === 'study' && !isRunning) setSecondsRemaining(val * 60);
                  }}
                  className="w-full text-xs font-mono tabular-nums p-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Short Break</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={shortBreakDuration}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setShortBreakDuration(val);
                    if (timerMode === 'shortBreak' && !isRunning) setSecondsRemaining(val * 60);
                  }}
                  className="w-full text-xs font-mono tabular-nums p-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Long Break</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={longBreakDuration}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setLongBreakDuration(val);
                    if (timerMode === 'longBreak' && !isRunning) setSecondsRemaining(val * 60);
                  }}
                  className="w-full text-xs font-mono tabular-nums p-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400">Presets:</span>
              <button
                onClick={() => {
                  setStudyDuration(25);
                  setShortBreakDuration(5);
                  setSecondsRemaining(25 * 60);
                }}
                className="text-[11px] px-2 py-0.5 bg-white border border-slate-200 rounded hover:border-indigo-400"
              >
                Classic 25/5
              </button>
              <button
                onClick={() => {
                  setStudyDuration(50);
                  setShortBreakDuration(10);
                  setSecondsRemaining(50 * 60);
                }}
                className="text-[11px] px-2 py-0.5 bg-white border border-slate-200 rounded hover:border-indigo-400"
              >
                Deep Work 50/10
              </button>
              <button
                onClick={() => {
                  setStudyDuration(15);
                  setShortBreakDuration(3);
                  setSecondsRemaining(15 * 60);
                }}
                className="text-[11px] px-2 py-0.5 bg-white border border-slate-200 rounded hover:border-indigo-400"
              >
                Quick Sprint 15/3
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lo-fi Study Music Player Widget */}
      <LofiPlayerWidget />
    </div>
  );
};
