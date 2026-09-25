import React from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Sparkles,
  RotateCw,
  Sun,
  Moon,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Zap,
  ShieldCheck,
  ArrowRight,
  Flame,
  Brain
} from 'lucide-react';

export const AIInsightsView: React.FC = () => {
  const {
    aiInsights,
    loadingInsights,
    fetchAIProductivityInsights,
    applyRecommendation,
    studyLogs
  } = useStudy();

  const totalLoggedMinutes = studyLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const totalLoggedHours = (totalLoggedMinutes / 60).toFixed(1);
  const avgFocusOverall = (
    studyLogs.reduce((acc, log) => acc + log.focusScore, 0) / Math.max(1, studyLogs.length)
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                Gemini 3.8 Flash Cognitive Analytics
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-xs text-slate-400">Circadian Chronotype Engine</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              AI Productivity & Chronotype Insights
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Synthesizing your logged focus ratings, session durations, and exam countdowns to map
              your biological peak focus windows and eliminate study fatigue.
            </p>
          </div>

          <button
            onClick={() => fetchAIProductivityInsights()}
            disabled={loadingInsights}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-sky-600 text-white hover:opacity-95 disabled:opacity-50 shadow-lg shadow-indigo-600/20 transition-all self-start md:self-auto"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loadingInsights ? 'animate-spin' : ''}`} />
            <span>{loadingInsights ? 'Analyzing Session Logs...' : 'Re-Analyze with Gemini'}</span>
          </button>
        </div>

        {/* Chronotype Identity Card */}
        {aiInsights && (
          <div className="mt-5 p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-mono text-indigo-300 uppercase tracking-wider">
                  Identified Biological Chronotype
                </div>
                <div className="text-base font-bold text-white">
                  {aiInsights.chronotype}
                </div>
              </div>
            </div>
            <p className="text-xs text-indigo-200 max-w-lg leading-relaxed">
              {aiInsights.peakSummary}
            </p>
          </div>
        )}
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase">Analyzed Sessions</div>
            <div className="text-2xl font-bold text-white mt-0.5">{studyLogs.length} Blocks</div>
            <div className="text-xs text-indigo-400 mt-1">{totalLoggedHours} Total Study Hours</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase">Average Focus Score</div>
            <div className="text-2xl font-bold text-emerald-400 mt-0.5">
              {avgFocusOverall} <span className="text-slate-500 text-sm font-normal">/ 10</span>
            </div>
            <div className="text-xs text-emerald-300/80 mt-1">High retention efficiency</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase">Burnout Risk Index</div>
            <div className="text-2xl font-bold text-sky-400 mt-0.5">
              {aiInsights?.burnoutRisk?.level || 'Low-Moderate'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Score: {aiInsights?.burnoutRisk?.score || 28}/100
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
          </div>
        </div>
      </div>

      {/* Hourly Productivity Curve & Heatmap */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">
              24-Hour Cognitive Stamina & Focus Curve
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical focus rating (1-10) and cognitive efficiency across daily time slots
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-slate-300">Peak Window (&gt;9.0)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span className="text-slate-400">Baseline Focus</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="space-y-3.5">
          {aiInsights?.optimalHours?.map((slot, idx) => {
            const barWidth = `${slot.efficiency}%`;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-200 w-28">
                      {slot.hourSlot}
                    </span>
                    {slot.peak && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                        PEAK ZONE
                      </span>
                    )}
                    <span className="text-slate-400 text-[11px] hidden md:inline">
                      Ideal for: {slot.optimalFor}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-400 text-[11px]">
                      {slot.sessionsCount} sessions
                    </span>
                    <span className="font-bold text-white w-12 text-right">
                      {slot.avgFocus}/10
                    </span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-[1px]">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      slot.peak
                        ? 'bg-gradient-to-r from-indigo-500 to-sky-400 shadow-sm'
                        : slot.efficiency > 70
                        ? 'bg-indigo-600/70'
                        : 'bg-slate-700'
                    }`}
                    style={{ width: barWidth }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Key Empirical Observations & Smart AI Schedule Fixes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Key Observations */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Data-Backed Study Observations
            </h3>
          </div>

          <div className="space-y-3">
            {aiInsights?.keyObservations?.map((obs, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{obs}</p>
              </div>
            ))}
          </div>

          {/* Burnout Indicator Note */}
          {aiInsights?.burnoutRisk && (
            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">Stamina Diagnostic: </strong>
                {aiInsights.burnoutRisk.indicator}
              </div>
            </div>
          )}
        </div>

        {/* Smart Recommendations with 1-Click Apply */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Targeted Schedule Optimizations
            </h3>
          </div>

          <div className="space-y-3">
            {aiInsights?.smartRecommendations?.map((rec, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                  <button
                    onClick={() => applyRecommendation(rec.title)}
                    className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors shrink-0"
                  >
                    <span>Apply Fix</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-snug">{rec.action}</p>
                <div className="mt-2 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{rec.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
