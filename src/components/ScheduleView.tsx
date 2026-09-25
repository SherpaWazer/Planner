import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { SubjectType, ScheduleBlock } from '../types';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Flame,
  Zap,
  BookOpen,
  Filter
} from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const ScheduleView: React.FC<{ openAddModal: () => void }> = ({ openAddModal }) => {
  const {
    scheduleBlocks,
    toggleBlockComplete,
    deleteScheduleBlock,
    autoOptimizeSchedule,
    exams,
    studyLogs
  } = useStudy();

  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('weekly');

  const subjects: ('All' | SubjectType)[] = [
    'All',
    'Computer Science',
    'Mathematics',
    'Chemistry',
    'Biology'
  ];

  const getSubjectColor = (subject: SubjectType) => {
    switch (subject) {
      case 'Computer Science':
        return {
          bg: 'bg-indigo-950/40 hover:bg-indigo-950/60',
          border: 'border-indigo-500/40',
          badge: 'text-indigo-400 bg-indigo-500/10',
          dot: 'bg-indigo-400'
        };
      case 'Mathematics':
        return {
          bg: 'bg-blue-950/40 hover:bg-blue-950/60',
          border: 'border-blue-500/40',
          badge: 'text-blue-400 bg-blue-500/10',
          dot: 'bg-blue-400'
        };
      case 'Chemistry':
        return {
          bg: 'bg-emerald-950/40 hover:bg-emerald-950/60',
          border: 'border-emerald-500/40',
          badge: 'text-emerald-400 bg-emerald-500/10',
          dot: 'bg-emerald-400'
        };
      case 'Biology':
        return {
          bg: 'bg-rose-950/40 hover:bg-rose-950/60',
          border: 'border-rose-500/40',
          badge: 'text-rose-400 bg-rose-500/10',
          dot: 'bg-rose-400'
        };
      default:
        return {
          bg: 'bg-slate-900/60 hover:bg-slate-900/90',
          border: 'border-slate-700/60',
          badge: 'text-slate-400 bg-slate-800',
          dot: 'bg-slate-400'
        };
    }
  };

  const filteredBlocks = scheduleBlocks.filter((block) => {
    if (selectedSubjectFilter !== 'All' && block.subject !== selectedSubjectFilter) {
      return false;
    }
    if (viewMode === 'daily' && block.dayOfWeek !== selectedDay) {
      return false;
    }
    return true;
  });

  // Calculate today stats
  const todayBlocks = scheduleBlocks.filter((b) => b.dayOfWeek === new Date().getDay());
  const todayCompleted = todayBlocks.filter((b) => b.completed).length;
  const todayProgress = todayBlocks.length > 0 ? Math.round((todayCompleted / todayBlocks.length) * 100) : 0;

  const totalWeeklyHoursScheduled = scheduleBlocks.reduce((acc, b) => {
    const [startH, startM] = b.startTime.split(':').map(Number);
    const [endH, endM] = b.endTime.split(':').map(Number);
    const duration = (endH + endM / 60) - (startH + startM / 60);
    return acc + Math.max(0.5, duration);
  }, 0);

  const completedHours = scheduleBlocks
    .filter((b) => b.completed)
    .reduce((acc, b) => {
      const [startH, startM] = b.startTime.split(':').map(Number);
      const [endH, endM] = b.endTime.split(':').map(Number);
      return acc + Math.max(0.5, (endH + endM / 60) - (startH + startM / 60));
    }, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Today's Focus</div>
            <div className="text-2xl font-bold text-white mt-1">
              {todayCompleted} <span className="text-slate-500 text-sm font-normal">/ {todayBlocks.length} blocks</span>
            </div>
            <div className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
              <span>{todayProgress}% completed</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-indigo-400" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Weekly Commitment</div>
            <div className="text-2xl font-bold text-white mt-1">
              {completedHours.toFixed(1)} <span className="text-slate-500 text-sm font-normal">/ {totalWeeklyHoursScheduled.toFixed(1)} hrs</span>
            </div>
            <div className="text-xs text-sky-400 mt-1">
              Target: 25.0 hrs / week
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-sky-400" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Study Streak</div>
            <div className="text-2xl font-bold text-amber-400 mt-1 flex items-center gap-1.5">
              <span>14</span>
              <span className="text-slate-400 text-sm font-normal">Days</span>
            </div>
            <div className="text-xs text-amber-300/80 mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Personal best! +3d</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Flame className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Upcoming Exam Pressure</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">
              3.1 <span className="text-slate-400 text-sm font-normal">Days</span>
            </div>
            <div className="text-xs text-rose-300/80 mt-1 truncate max-w-[170px]">
              Algorithms & Complexity (CS)
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Control Bar: View Switcher, Subject Filters, AI Auto-Optimizer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          {/* Daily / Weekly toggle */}
          <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                viewMode === 'weekly'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Weekly Timetable
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                viewMode === 'daily'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Day Detail
            </button>
          </div>

          {/* Subject Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubjectFilter(sub)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors whitespace-nowrap ${
                  selectedSubjectFilter === sub
                    ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={autoOptimizeSchedule}
            title="Auto-align revision blocks to cognitive peak hours"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Auto-Optimize</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Session</span>
          </button>
        </div>
      </div>

      {/* Daily Day Selector if in Daily Mode */}
      {viewMode === 'daily' && (
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((dayName, idx) => {
            const isToday = idx === new Date().getDay();
            const isSelected = idx === selectedDay;
            const dayBlocksCount = scheduleBlocks.filter((b) => b.dayOfWeek === idx).length;

            return (
              <button
                key={dayName}
                onClick={() => setSelectedDay(idx)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-mono">{dayName}</div>
                <div className="text-sm font-bold mt-0.5">
                  {dayBlocksCount} {dayBlocksCount === 1 ? 'task' : 'tasks'}
                </div>
                {isToday && (
                  <div className="text-[10px] text-indigo-400 font-semibold mt-1">Today</div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Weekly Grid View */}
      {viewMode === 'weekly' ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {DAYS.map((dayName, dayIndex) => {
            const isToday = dayIndex === new Date().getDay();
            const blocksForDay = scheduleBlocks
              .filter((b) => b.dayOfWeek === dayIndex)
              .filter((b) => selectedSubjectFilter === 'All' || b.subject === selectedSubjectFilter)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div
                key={dayName}
                className={`bg-slate-900/40 rounded-2xl border p-3 flex flex-col min-h-[380px] ${
                  isToday
                    ? 'border-indigo-500/50 bg-indigo-950/10 shadow-lg shadow-indigo-950/30'
                    : 'border-slate-800/80'
                }`}
              >
                {/* Column Day Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-200">{dayName}</span>
                    {isToday && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        NOW
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {blocksForDay.length}
                  </span>
                </div>

                {/* Blocks for this Day */}
                <div className="space-y-2.5 flex-1">
                  {blocksForDay.map((block) => {
                    const colors = getSubjectColor(block.subject);
                    return (
                      <div
                        key={block.id}
                        className={`group relative p-2.5 rounded-xl border transition-all ${
                          colors.bg
                        } ${colors.border} ${
                          block.completed ? 'opacity-60 saturate-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <button
                            onClick={() => toggleBlockComplete(block.id)}
                            className="mt-0.5 text-slate-400 hover:text-indigo-400 transition-colors"
                          >
                            {block.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-500 hover:text-indigo-400" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-xs font-semibold text-white leading-tight truncate ${
                                block.completed ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {block.title}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>
                                {block.startTime} - {block.endTime}
                              </span>
                            </div>
                            <div className="mt-1.5 flex items-center justify-between text-[10px]">
                              <span className={`px-1.5 py-0.5 rounded font-medium ${colors.badge}`}>
                                {block.subject}
                              </span>
                              <span className="text-slate-500 font-mono">{block.type}</span>
                            </div>
                          </div>
                        </div>

                        {/* Delete action on hover */}
                        <button
                          onClick={() => deleteScheduleBlock(block.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-500 hover:text-rose-400"
                          title="Delete session"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}

                  {blocksForDay.length === 0 && (
                    <div className="h-28 flex flex-col items-center justify-center text-center text-slate-600 text-xs border border-dashed border-slate-800/60 rounded-xl p-2">
                      <span>Rest or flexible block</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Daily Detail View */
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">
                {FULL_DAYS[selectedDay]} Schedule Overview
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Focus blocks tailored to your cognitive stamina curve
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Block for {DAYS[selectedDay]}</span>
            </button>
          </div>

          <div className="space-y-3">
            {filteredBlocks.map((block) => {
              const colors = getSubjectColor(block.subject);
              return (
                <div
                  key={block.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
                    colors.bg
                  } ${colors.border} ${block.completed ? 'opacity-65' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleBlockComplete(block.id)}
                      className="text-slate-400 hover:text-indigo-400 transition-colors"
                    >
                      {block.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold text-white ${block.completed ? 'line-through text-slate-400' : ''}`}>
                          {block.title}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${colors.badge}`}>
                          {block.subject}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 bg-slate-800/60 rounded border border-slate-700/60">
                          {block.type}
                        </span>
                      </div>
                      {block.notes && (
                        <p className="text-xs text-slate-400 mt-1 max-w-xl">
                          {block.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{block.startTime} – {block.endTime}</span>
                    </div>

                    <button
                      onClick={() => deleteScheduleBlock(block.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Remove session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredBlocks.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <CalendarIcon className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-medium">No sessions scheduled for this day</p>
                <button
                  onClick={openAddModal}
                  className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  + Add study block
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
