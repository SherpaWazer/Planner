import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { SubjectType } from '../types';
import {
  Users,
  Flame,
  Clock,
  Sparkles,
  Send,
  MessageSquare,
  Pin,
  CheckCircle2,
  Volume2,
  Radio,
  Trophy,
  Activity,
  Heart
} from 'lucide-react';

export const PeerDashboardView: React.FC = () => {
  const {
    peers,
    peerMessages,
    sendPeerMessage,
    groupCohortGoalHours,
    cohortCompletedHours,
    pomodoro,
    startPomodoro,
    pausePomodoro,
    myStatus,
    updateMyStatus
  } = useStudy();

  const [messageInput, setMessageInput] = useState('');
  const [isPinningNote, setIsPinningNote] = useState(false);
  const [customTaskInput, setCustomTaskInput] = useState(myStatus.task);

  const cohortPercentage = Math.min(
    100,
    Math.round((cohortCompletedHours / groupCohortGoalHours) * 100)
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    sendPeerMessage(messageInput.trim(), isPinningNote);
    setMessageInput('');
    setIsPinningNote(false);
  };

  const handleUpdateStatus = (newStatus: 'focusing' | 'break' | 'idle') => {
    updateMyStatus(newStatus, customTaskInput || 'Deep Work Sprint');
  };

  return (
    <div className="space-y-6">
      {/* Cohort Header & Shared Milestone Target */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                Cohort Room #402
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-mono">4 Peers Live Now</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">
              Late Night STEM & Honors Study Lounge
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Shared accountability circle. Work side-by-side in synchronized Pomodoros, exchange
              high-yield exam mnemonics, and maintain group streaks.
            </p>
          </div>

          {/* Group Sprint Control */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-3">
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">
                  Cohort Synced Timer
                </div>
                <div className="text-base font-mono font-bold text-white">
                  {Math.floor(pomodoro.timeLeft / 60)}:{(pomodoro.timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
              <button
                onClick={pomodoro.isRunning ? pausePomodoro : startPomodoro}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                {pomodoro.isRunning ? 'Pause' : 'Join Sprint'}
              </button>
            </div>
          </div>
        </div>

        {/* Group Weekly Milestone Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-300 font-mono mb-2">
            <span>Weekly Cohort Goal: 100 Hours</span>
            <span className="text-indigo-400 font-bold">
              {cohortCompletedHours} / {groupCohortGoalHours} hrs ({cohortPercentage}%)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${cohortPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Live Peer Lobby (Left) + Collaborative Board & Chat (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Peer Presence & Accountability */}
        <div className="lg:col-span-1 space-y-4">
          {/* User's Own Status Card */}
          <div className="bg-slate-900/60 border border-indigo-500/40 rounded-2xl p-4">
            <div className="text-xs font-mono uppercase text-indigo-400 font-semibold mb-2">
              Your Live Status In Room
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={customTaskInput}
                onChange={(e) => setCustomTaskInput(e.target.value)}
                placeholder="What are you currently tackling?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleUpdateStatus('focusing')}
                  className={`py-1 text-xs rounded-lg font-medium transition-colors ${
                    myStatus.status === 'focusing'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'bg-slate-800/50 text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Focus
                </button>
                <button
                  onClick={() => handleUpdateStatus('break')}
                  className={`py-1 text-xs rounded-lg font-medium transition-colors ${
                    myStatus.status === 'break'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'bg-slate-800/50 text-slate-400 hover:text-white'
                  }`}
                >
                  ☕ Break
                </button>
                <button
                  onClick={() => handleUpdateStatus('idle')}
                  className={`py-1 text-xs rounded-lg font-medium transition-colors ${
                    myStatus.status === 'idle'
                      ? 'bg-slate-700 text-white font-bold'
                      : 'bg-slate-800/50 text-slate-400 hover:text-white'
                  }`}
                >
                  💤 Idle
                </button>
              </div>
            </div>
          </div>

          {/* Peer List */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Active Peers ({peers.filter((p) => p.isOnline).length})</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Live Status</span>
            </div>

            <div className="space-y-3">
              {peers.map((peer) => (
                <div
                  key={peer.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="relative">
                      <img
                        src={peer.avatar}
                        alt={peer.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                          peer.status === 'focusing'
                            ? 'bg-emerald-400 animate-pulse'
                            : peer.status === 'break'
                            ? 'bg-amber-400'
                            : 'bg-slate-600'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{peer.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {peer.currentSubject}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                        {peer.currentTask}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                        <span className="text-amber-400 flex items-center gap-0.5">
                          <Flame className="w-3 h-3" />
                          {peer.streakDays}d streak
                        </span>
                        <span>·</span>
                        <span>{peer.totalStudyHours} hrs</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold ${
                      peer.status === 'focusing'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : peer.status === 'break'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {peer.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Friendly Cohort Leaderboard */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800 mb-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Weekly Honor Leaderboard
              </h3>
            </div>
            <div className="space-y-2">
              {[...peers]
                .sort((a, b) => b.totalStudyHours - a.totalStudyHours)
                .slice(0, 3)
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-950/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-400 font-bold text-[11px]">
                        #{idx + 1}
                      </span>
                      <span className="text-slate-200">{p.name}</span>
                    </div>
                    <span className="font-mono text-slate-400">{p.totalStudyHours} hrs</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column: Shared Notes & Peer Chat Board */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[560px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  Shared Peer Notes & Study Feed
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Pin formulas, active recall mnemonics, or cheer peers
              </span>
            </div>

            {/* Messages Feed */}
            <div className="space-y-3 mt-4 max-h-[420px] overflow-y-auto pr-1">
              {peerMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    msg.isNote
                      ? 'bg-amber-950/15 border-amber-500/30'
                      : 'bg-slate-950/70 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={msg.avatar}
                        alt={msg.senderName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-slate-200">
                        {msg.senderName}
                      </span>
                      {msg.isNote && (
                        <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                          <Pin className="w-2.5 h-2.5" />
                          PINNED STUDY NOTE
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Message / Mnemonic Input Form */}
          <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setIsPinningNote(!isPinningNote)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1 transition-colors ${
                  isPinningNote
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <Pin className="w-3 h-3" />
                <span>Pin as Exam Mnemonic / Note</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={
                  isPinningNote
                    ? 'Write high-yield mnemonic or formula to pin for your group...'
                    : 'Cheer peers or ask a study question...'
                }
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
