import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Clock, ExternalLink } from 'lucide-react';
import { StudentProfile } from '../types';
import { soundEffects } from '../utils/audio';

interface QuickTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onOpenFullTimer: () => void;
  onLogSession: (subject: string, minutes: number, type: 'pomodoro' | 'custom') => void;
}

export const QuickTimerModal: React.FC<QuickTimerModalProps> = ({
  isOpen,
  onClose,
  profile,
  onOpenFullTimer,
  onLogSession,
}) => {
  const [selectedSubject, setSelectedSubject] = useState(profile.subjects[0] || 'General');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleComplete();
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
  }, [isRunning]);

  const handleComplete = () => {
    setIsRunning(false);
    soundEffects.playFocusComplete();
    onLogSession(selectedSubject, durationMinutes, 'pomodoro');
    setSecondsRemaining(durationMinutes * 60);
  };

  if (!isOpen) return null;

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Quick Study Timer</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Time Display */}
        <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
          <div className="text-4xl font-mono tabular-nums font-bold text-slate-900">
            {timeFormatted}
          </div>
          <p className="text-xs text-slate-500 font-medium">{selectedSubject}</p>
        </div>

        {/* Subject & Duration Selector */}
        {!isRunning && (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                {profile.subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Minutes
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => {
                  const m = Number(e.target.value);
                  setDurationMinutes(m);
                  setSecondsRemaining(m * 60);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono tabular-nums"
              >
                <option value={15}>15 mins</option>
                <option value={25}>25 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
              </select>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsRunning(!isRunning);
            }}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setIsRunning(false);
              setSecondsRemaining(durationMinutes * 60);
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center pt-1 border-t border-slate-100">
          <button
            onClick={() => {
              onClose();
              onOpenFullTimer();
            }}
            className="text-[11px] text-indigo-600 hover:underline font-semibold flex items-center justify-center gap-1 mx-auto"
          >
            <span>Open Full Study Studio</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
