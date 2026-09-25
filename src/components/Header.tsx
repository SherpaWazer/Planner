import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { exportToICS } from '../utils/calendarExport';
import {
  Calendar,
  Layers,
  Bell,
  Sparkles,
  Users,
  Clock,
  Download,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Volume2,
  Flame,
  CreditCard
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'schedule' | 'revision' | 'exams' | 'ai-insights' | 'peers';
  setActiveTab: (tab: 'schedule' | 'revision' | 'exams' | 'ai-insights' | 'peers') => void;
  openNotificationDrawer: () => void;
  openPricingModal: () => void;
  openAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openNotificationDrawer,
  openPricingModal,
  openAddModal
}) => {
  const {
    exams,
    scheduleBlocks,
    unreadCount,
    userTier,
    currentSemester,
    setCurrentSemester,
    pomodoro,
    startPomodoro,
    pausePomodoro
  } = useStudy();

  const [semesterDropdown, setSemesterDropdown] = useState(false);

  const semesters = [
    'Fall 2026 Semester',
    'Spring 2027 Honors Track',
    'Pre-Med Board Review',
    'Graduate GRE / MCAT Sprint'
  ];

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand & Semester */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('schedule')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-[1px] shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-[#0F172A] rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">SynapsePlan</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                    SaaS OS
                  </span>
                </div>
              </div>
            </div>

            {/* Semester Switcher Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setSemesterDropdown(!semesterDropdown)}
                className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <span>{currentSemester}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {semesterDropdown && (
                <div className="absolute left-0 mt-1.5 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-500 border-b border-slate-800/60">
                    Switch Academic Term
                  </div>
                  {semesters.map((sem) => (
                    <button
                      key={sem}
                      onClick={() => {
                        setCurrentSemester(sem);
                        setSemesterDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                        currentSemester === sem
                          ? 'text-indigo-400 bg-indigo-500/10 font-medium'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <span>{sem}</span>
                      {currentSemester === sem && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/70 p-1 rounded-xl border border-slate-800/80 text-xs font-medium">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'schedule'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Planner</span>
            </button>

            <button
              onClick={() => setActiveTab('revision')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'revision'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Revision Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('exams')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all relative ${
                activeTab === 'exams'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Exam Watchdog</span>
              {exams.some((e) => {
                const diff = (new Date(e.examDate).getTime() - Date.now()) / (1000 * 3600);
                return diff > 0 && diff < 72;
              }) && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('ai-insights')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'ai-insights'
                  ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-300" />
              <span>AI Insights</span>
            </button>

            <button
              onClick={() => setActiveTab('peers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'peers'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Peer Lounge</span>
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* Quick Mini Pomodoro Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-medium text-slate-200">
                  {formatTimer(pomodoro.timeLeft)}
                </span>
              </div>
              <button
                onClick={pomodoro.isRunning ? pausePomodoro : startPomodoro}
                className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors"
              >
                {pomodoro.isRunning ? 'Pause' : 'Focus'}
              </button>
            </div>

            {/* Export Schedule to iCal / Calendar */}
            <button
              onClick={() => exportToICS(exams, scheduleBlocks)}
              title="Export schedule to Apple/Google Calendar (.ics)"
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={openNotificationDrawer}
              className="relative p-2 text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
              title="Notifications & Exam Reminders"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* SaaS Tier / Upgrade Badge */}
            <button
              onClick={openPricingModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-orange-500/10 text-amber-300 border border-amber-500/30 hover:border-amber-400/50 transition-all"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{userTier === 'pro' ? 'Pro Scholar' : userTier === 'campus' ? 'Campus Team' : 'Free Tier'}</span>
            </button>

            {/* Quick Add Button */}
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all"
            >
              <span>+ Add Task</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-slate-800/60 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-2.5 py-1 rounded-md ${activeTab === 'schedule' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            Planner
          </button>
          <button
            onClick={() => setActiveTab('revision')}
            className={`px-2.5 py-1 rounded-md ${activeTab === 'revision' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            Revision
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-2.5 py-1 rounded-md relative ${activeTab === 'exams' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            Exams
            {exams.some((e) => {
              const diff = (new Date(e.examDate).getTime() - Date.now()) / (1000 * 3600);
              return diff > 0 && diff < 72;
            }) && <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 ml-1" />}
          </button>
          <button
            onClick={() => setActiveTab('ai-insights')}
            className={`px-2.5 py-1 rounded-md ${activeTab === 'ai-insights' ? 'text-sky-400 font-semibold' : 'text-slate-400'}`}
          >
            AI Insights
          </button>
          <button
            onClick={() => setActiveTab('peers')}
            className={`px-2.5 py-1 rounded-md ${activeTab === 'peers' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            Peer Lounge
          </button>
        </div>
      </div>
    </header>
  );
};
