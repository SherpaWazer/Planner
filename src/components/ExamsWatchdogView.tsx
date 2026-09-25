import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { ExamDeadline, SubjectType } from '../types';
import {
  Clock,
  AlertTriangle,
  Bell,
  Volume2,
  CheckCircle2,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  ShieldAlert,
  Flame,
  ChevronRight,
  MapPin,
  Percent
} from 'lucide-react';

export const ExamsWatchdogView: React.FC<{ openAddModal: () => void }> = ({ openAddModal }) => {
  const {
    exams,
    deleteExam,
    updateExam,
    browserNotificationsEnabled,
    requestNotificationPermission,
    testNotificationChime
  } = useStudy();

  // Current timestamp tick for smooth live countdown
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateTimeRemaining = (dateString: string) => {
    const target = new Date(dateString).getTime();
    const diff = target - currentTime;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0, isPast: true };
    }

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const totalHours = diff / (1000 * 60 * 60);

    return { days, hours, minutes, seconds, totalHours, isPast: false };
  };

  const getUrgencyConfig = (totalHours: number, isPast: boolean) => {
    if (isPast) {
      return {
        label: 'COMPLETED / PAST',
        badge: 'bg-slate-800 text-slate-400 border-slate-700',
        border: 'border-slate-800',
        bg: 'bg-slate-900/40',
        glow: '',
        pulse: false
      };
    }
    if (totalHours <= 72) {
      return {
        label: 'CRITICAL COUNTDOWN',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        border: 'border-rose-500/50',
        bg: 'bg-rose-950/20',
        glow: 'shadow-lg shadow-rose-950/40',
        pulse: true
      };
    }
    if (totalHours <= 168) {
      return {
        label: 'APPROACHING ( < 7 DAYS )',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        border: 'border-amber-500/40',
        bg: 'bg-amber-950/15',
        glow: 'shadow-sm',
        pulse: false
      };
    }
    return {
      label: 'SCHEDULED ON TRACK',
      badge: 'bg-slate-800 text-slate-300 border-slate-700',
      border: 'border-slate-800',
      bg: 'bg-slate-900/50',
      glow: '',
      pulse: false
    };
  };

  return (
    <div className="space-y-6">
      {/* Automated Watchdog Hero & Notification Center Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold">
                Autonomous Exam Watchdog
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs text-slate-400">Continuous Deadline Monitor</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">
              Active Exam Countdowns & Smart Alerts
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Automatic alert triggers fire at 72h, 48h, 24h, and 2h milestones with Web Audio chimes
              and system notifications to ensure zero revision gaps.
            </p>
          </div>

          {/* Notification Controls Strip */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={testNotificationChime}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Test web audio synthesize chime"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Test Audio Chime</span>
            </button>

            {!browserNotificationsEnabled ? (
              <button
                onClick={requestNotificationPermission}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-all"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Enable Desktop Alerts</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Desktop Alerts Active</span>
              </div>
            )}

            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New Exam</span>
            </button>
          </div>
        </div>
      </div>

      {/* Exam Deadlines Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {exams.map((exam) => {
          const { days, hours, minutes, seconds, totalHours, isPast } = calculateTimeRemaining(exam.examDate);
          const urgency = getUrgencyConfig(totalHours, isPast);
          const examFormattedDate = new Date(exam.examDate).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div
              key={exam.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                urgency.bg
              } ${urgency.border} ${urgency.glow}`}
            >
              {/* Card Header & Urgency Badge */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold tracking-wider ${urgency.badge}`}>
                      {urgency.label}
                    </span>
                    {urgency.pulse && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400 font-mono">
                      Weight: <strong className="text-white">{exam.weightPercentage}%</strong>
                    </span>
                    <button
                      onClick={() => deleteExam(exam.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Delete exam"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-2.5">
                  <h3 className="text-base font-bold text-white leading-snug">
                    {exam.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1 font-mono">
                    <div className="flex items-center gap-1 text-indigo-300">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{examFormattedDate}</span>
                    </div>
                    {exam.room && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{exam.room}</span>
                      </div>
                    )}
                    <div className="text-emerald-400 font-semibold">
                      Target: {exam.targetGrade}
                    </div>
                  </div>
                </div>

                {/* Real-time Countdown Digits Display */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="grid grid-cols-4 gap-2 text-center font-mono">
                    <div className="bg-slate-900/90 rounded-lg py-2 px-1 border border-slate-800">
                      <div className="text-xl sm:text-2xl font-black text-white">
                        {days.toString().padStart(2, '0')}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                        Days
                      </div>
                    </div>
                    <div className="bg-slate-900/90 rounded-lg py-2 px-1 border border-slate-800">
                      <div className="text-xl sm:text-2xl font-black text-white">
                        {hours.toString().padStart(2, '0')}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                        Hours
                      </div>
                    </div>
                    <div className="bg-slate-900/90 rounded-lg py-2 px-1 border border-slate-800">
                      <div className="text-xl sm:text-2xl font-black text-white">
                        {minutes.toString().padStart(2, '0')}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                        Mins
                      </div>
                    </div>
                    <div className="bg-slate-900/90 rounded-lg py-2 px-1 border border-slate-800">
                      <div className="text-xl sm:text-2xl font-black text-rose-400">
                        {seconds.toString().padStart(2, '0')}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                        Secs
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bar and topics preview */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
                    <span>Preparation Mastery</span>
                    <span className="font-semibold text-white">{exam.preparationProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        exam.preparationProgress >= 70
                          ? 'bg-emerald-400'
                          : exam.preparationProgress >= 40
                          ? 'bg-indigo-400'
                          : 'bg-rose-400'
                      }`}
                      style={{ width: `${exam.preparationProgress}%` }}
                    />
                  </div>
                </div>

                {/* Topics Pills */}
                {exam.topics && exam.topics.length > 0 && (
                  <div className="mt-3.5">
                    <div className="text-[11px] font-mono text-slate-400 mb-1.5">
                      Key Syllabus Focus:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {exam.topics.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-mono">
                  Alerts: {exam.notificationHoursBefore.map((h) => `${h}h`).join(', ')}
                </div>

                <button
                  onClick={() => {
                    const newProgress = Math.min(100, exam.preparationProgress + 10);
                    updateExam(exam.id, { preparationProgress: newProgress });
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>+10% Topic Checkoff</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
