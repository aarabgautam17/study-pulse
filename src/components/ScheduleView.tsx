import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowRight,
  ListTodo,
} from 'lucide-react';
import { ExamDeadline, ScheduledTask, StudentProfile } from '../types';

interface ScheduleViewProps {
  profile: StudentProfile;
  exams: ExamDeadline[];
  tasks: ScheduledTask[];
  onAddExam: (exam: Omit<ExamDeadline, 'id' | 'userId' | 'completedTopics'>) => void;
  onToggleExamTopic: (examId: string, topic: string) => void;
  onDeleteExam: (examId: string) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask?: (task: { title: string; subject: string; durationMinutes: number; dueDate: string; priority: 'high' | 'medium' | 'low'; completed: boolean }) => void;
  onStartTimer: (subject: string, minutes: number) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  profile,
  exams,
  tasks,
  onAddExam,
  onToggleExamTopic,
  onDeleteExam,
  onToggleTask,
  onAddTask,
  onStartTimer,
}) => {
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [newSubject, setNewSubject] = useState(profile.subjects[0] || 'General');
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newTopics, setNewTopics] = useState('');

  // Task form state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState(profile.subjects[0] || 'General');
  const [taskDuration, setTaskDuration] = useState(30);
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    const topicsArray = newTopics
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onAddExam({
      subject: newSubject,
      title: newTitle,
      examDate: new Date(newDate).toISOString(),
      location: newLocation.trim() || undefined,
      topicsToReview: topicsArray.length > 0 ? topicsArray : ['Core chapter review'],
    });

    setNewTitle('');
    setNewDate('');
    setNewLocation('');
    setNewTopics('');
    setIsAddExamOpen(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !onAddTask) return;

    onAddTask({
      title: taskTitle.trim(),
      subject: taskSubject,
      durationMinutes: Number(taskDuration) || 30,
      dueDate: taskDueDate,
      priority: 'medium',
      completed: false,
    });

    setTaskTitle('');
    setIsAddTaskOpen(false);
  };

  const getUrgencyText = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Finished';
    if (days === 0) return 'Today!';
    if (days === 1) return 'Tomorrow';
    return `${days} days left`;
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Academic Schedule & Exam Deadlines
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Organize revision topics by exam date and maintain focused daily checkpoints
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Study Task</span>
          </button>

          <button
            onClick={() => setIsAddExamOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Exam Deadline</span>
          </button>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <div className="p-6 rounded-2xl bg-white border border-indigo-200 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Add Study Action Task</h3>
            <button
              onClick={() => setIsAddTaskOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateTask} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Task Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Practice 5 integration problems"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Course / Subject
              </label>
              <select
                value={taskSubject}
                onChange={(e) => setTaskSubject(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              >
                {profile.subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Exam Modal */}
      {isAddExamOpen && (
        <div className="p-6 rounded-2xl bg-white border border-indigo-200 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Add Upcoming Exam</h3>
            <button
              onClick={() => setIsAddExamOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateExam} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject
                </label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                >
                  {profile.subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exam Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm: Cellular Genetics"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exam Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room 304 or Science Hall"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Topics to Review (one per line)
              </label>
              <textarea
                rows={3}
                placeholder="Topic 1: DNA Replication&#10;Topic 2: Transcription factors&#10;Topic 3: Translation codons"
                value={newTopics}
                onChange={(e) => setNewTopics(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddExamOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
              >
                Save Exam
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exam Deadlines Grid */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Upcoming Exams ({exams.length})
        </h3>
        {exams.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-white space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No exams registered yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your upcoming test dates to track days remaining, room locations, and topic mastery checklists.
            </p>
            <button
              onClick={() => setIsAddExamOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Exam</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const totalTopics = exam.topicsToReview.length;
              const completedCount = exam.completedTopics.length;
              const percent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
              const urgencyBadge = getUrgencyText(exam.examDate);

              return (
                <div
                  key={exam.id}
                  className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                        {exam.subject}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {urgencyBadge}
                        </span>
                        <button
                          onClick={() => onDeleteExam(exam.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          title="Delete exam"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {exam.title}
                    </h3>

                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(exam.examDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {exam.location && (
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                          <span>{exam.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Topics to master checklist */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex justify-between text-xs text-slate-600 font-medium">
                        <span>Topics ({completedCount}/{totalTopics})</span>
                        <span className="font-mono tabular-nums">{percent}%</span>
                      </div>

                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {exam.topicsToReview.map((topic, i) => {
                          const isDone = exam.completedTopics.includes(topic);
                          return (
                            <div
                              key={i}
                              onClick={() => onToggleExamTopic(exam.id, topic)}
                              className={`text-xs p-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
                                isDone
                                  ? 'bg-emerald-50 text-emerald-800 line-through'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              <CheckCircle2
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isDone ? 'text-emerald-600' : 'text-slate-300'
                                }`}
                              />
                              <span className="truncate">{topic}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onStartTimer(exam.subject, 30)}
                      className="w-full py-2 text-xs font-semibold text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Start 30m Exam Review</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scheduled Study Tasks */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Study Action Tasks</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Check off tasks as you finish them to log XP and keep your study momentum
            </p>
          </div>
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
            <ListTodo className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">No study tasks created yet</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Add small actionable study tasks for today to build consistency.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                  task.completed
                    ? 'bg-slate-50/70 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-indigo-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    className={`w-5 h-5 shrink-0 ${
                      task.completed ? 'text-emerald-500 fill-emerald-50' : 'text-slate-300'
                    }`}
                  />
                  <div>
                    <h4
                      className={`text-sm font-semibold ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{task.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{task.durationMinutes} mins</span>
                      <span aria-hidden="true">·</span>
                      <span>Due {task.dueDate}</span>
                    </div>
                  </div>
                </div>

                {!task.completed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartTimer(task.subject, task.durationMinutes);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Start Focus
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
