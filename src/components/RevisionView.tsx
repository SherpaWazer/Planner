import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { RevisionTopic, SubjectType } from '../types';
import {
  Layers,
  Sparkles,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  Flame,
  Brain,
  HelpCircle,
  Eye,
  Sliders,
  ChevronRight
} from 'lucide-react';

const LEITNER_BOXES = [
  { box: 1, name: 'Box 1: Daily', interval: '1 Day', description: 'Fresh or challenging concepts reviewed daily', color: 'border-rose-500/40 bg-rose-950/20 text-rose-400' },
  { box: 2, name: 'Box 2: 3-Day', interval: '3 Days', description: 'Concepts with baseline grasp', color: 'border-amber-500/40 bg-amber-950/20 text-amber-400' },
  { box: 3, name: 'Box 3: Weekly', interval: '7 Days', description: 'Solid retention, spaced reinforcement', color: 'border-blue-500/40 bg-blue-950/20 text-blue-400' },
  { box: 4, name: 'Box 4: Bi-Weekly', interval: '14 Days', description: 'High confidence, pre-exam lock in', color: 'border-indigo-500/40 bg-indigo-950/20 text-indigo-400' },
  { box: 5, name: 'Box 5: Mastered', interval: '30 Days', description: 'Long-term synaptic consolidation', color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400' },
] as const;

export const RevisionView: React.FC = () => {
  const {
    revisionTopics,
    updateTopicBox,
    markTopicReviewed,
    addRevisionTopic,
    applyAIRevisionPlan,
    exams
  } = useStudy();

  // Active recall testing modal
  const [activeRecallTopic, setActiveRecallTopic] = useState<RevisionTopic | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // AI Revision Generator state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSubject, setAiSubject] = useState<SubjectType>('Computer Science');
  const [aiExamDate, setAiExamDate] = useState('2026-10-05');
  const [aiTopicsInput, setAiTopicsInput] = useState(
    'Dynamic Programming proofs, Bellman-Ford & Dijkstra, NP-Completeness Reductions, Maximum Flow & Minimum Cut'
  );
  const [aiHours, setAiHours] = useState(2.5);
  const [aiTargetGrade, setAiTargetGrade] = useState('A+');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);

  // Quick manual add topic modal
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicSubject, setNewTopicSubject] = useState<SubjectType>('Computer Science');
  const [newTopicQuestion, setNewTopicQuestion] = useState('');
  const [newTopicAnswer, setNewTopicAnswer] = useState('');

  // Stats
  const totalTopics = revisionTopics.length;
  const now = Date.now();
  const dueTopics = revisionTopics.filter(
    (t) => new Date(t.nextReviewDate).getTime() <= now + 24 * 3600 * 1000
  );
  const avgMastery = totalTopics > 0
    ? Math.round(revisionTopics.reduce((acc, t) => acc + t.masteryLevel, 0) / totalTopics)
    : 0;

  const handleLaunchAIPlanner = async () => {
    setIsGeneratingAi(true);
    try {
      const topicList = aiTopicsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/ai/generate-revision-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: aiSubject,
          examDate: aiExamDate,
          topics: topicList,
          dailyHours: aiHours,
          targetGrade: aiTargetGrade
        })
      });

      if (!res.ok) throw new Error('AI Planner request failed');
      const data = await res.json();
      setGeneratedPlan(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleApplyGeneratedPlan = () => {
    if (generatedPlan && generatedPlan.scheduleItems) {
      applyAIRevisionPlan(generatedPlan.scheduleItems);
      setIsAiModalOpen(false);
      setGeneratedPlan(null);
    }
  };

  const handleSaveManualTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName) return;

    addRevisionTopic({
      subject: newTopicSubject,
      topicName: newTopicName,
      leitnerBox: 1,
      lastReviewedDate: new Date().toISOString(),
      nextReviewDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      masteryLevel: 25,
      keyRecallQuestion: newTopicQuestion || `Core concept check for ${newTopicName}`,
      answerSummary: newTopicAnswer || 'Key summary and definition.',
      retentionStreak: 1,
      priority: 'High'
    });

    setNewTopicName('');
    setNewTopicQuestion('');
    setNewTopicAnswer('');
    setIsAddTopicOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Leitner Methodology & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">
                Spaced Repetition & Leitner Boxes
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="text-xs text-slate-400">Ebbinghaus Retention Protocol</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">
              Active Recall & Revision Hub
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Topics systematically advance from Box 1 to Box 5 as your cognitive recall solidifies.
              Intervals expand dynamically to counter memory decay right before the forgetting curve triggers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-lg shadow-indigo-600/20 hover:opacity-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Spaced-Repetition Blueprint</span>
            </button>

            <button
              onClick={() => setIsAddTopicOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Topic</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Total Active Topics</div>
              <div className="text-base font-bold text-white">{totalTopics} Topics</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Due for Review Today</div>
              <div className="text-base font-bold text-rose-400">
                {dueTopics.length} Topics Ready
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Average Syllabus Mastery</div>
              <div className="text-base font-bold text-emerald-400">{avgMastery}% Retained</div>
            </div>
          </div>
        </div>
      </div>

      {/* Leitner Boxes Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
        {LEITNER_BOXES.map(({ box, name, interval, description, color }) => {
          const topicsInBox = revisionTopics.filter((t) => t.leitnerBox === box);

          return (
            <div
              key={box}
              className="bg-slate-900/50 rounded-2xl border border-slate-800/80 p-3.5 flex flex-col min-h-[460px]"
            >
              {/* Box Header */}
              <div className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded border font-semibold ${color}`}>
                    {interval}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {topicsInBox.length}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 mt-2">{name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {description}
                </p>
              </div>

              {/* Topics Cards */}
              <div className="space-y-2.5 mt-3 flex-1 overflow-y-auto max-h-[520px] pr-1">
                {topicsInBox.map((topic) => {
                  const isDue = new Date(topic.nextReviewDate).getTime() <= now + 24 * 3600 * 1000;
                  return (
                    <div
                      key={topic.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isDue
                          ? 'bg-slate-900 border-indigo-500/40 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] font-medium text-slate-400 font-mono">
                          {topic.subject}
                        </span>
                        {isDue && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            DUE
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-white mt-1 leading-snug">
                        {topic.topicName}
                      </h4>

                      {/* Mastery Bar */}
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                          <span>Mastery</span>
                          <span className="font-semibold text-slate-200">{topic.masteryLevel}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              topic.masteryLevel > 80
                                ? 'bg-emerald-400'
                                : topic.masteryLevel > 50
                                ? 'bg-indigo-400'
                                : 'bg-amber-400'
                            }`}
                            style={{ width: `${topic.masteryLevel}%` }}
                          />
                        </div>
                      </div>

                      {/* Active Recall Action Button */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                          <Flame className="w-3 h-3 text-amber-500" />
                          <span>{topic.retentionStreak}x</span>
                        </div>

                        <button
                          onClick={() => {
                            setActiveRecallTopic(topic);
                            setShowAnswer(false);
                          }}
                          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <span>Review</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {topicsInBox.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-center text-slate-600 text-xs border border-dashed border-slate-800 rounded-xl p-3">
                    <span>No topics in this box</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Recall Flashcard Testing Drawer / Modal */}
      {activeRecallTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                  Box {activeRecallTopic.leitnerBox}
                </span>
                <span className="text-xs text-slate-400">{activeRecallTopic.subject}</span>
              </div>
              <button
                onClick={() => setActiveRecallTopic(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Active Recall Prompt
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {activeRecallTopic.topicName}
              </h3>

              <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 leading-relaxed min-h-[90px] flex items-center">
                <p>"{activeRecallTopic.keyRecallQuestion}"</p>
              </div>

              {/* Reveal Answer Section */}
              {showAnswer ? (
                <div className="mt-4 p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed">
                  <div className="font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Model Synthesis & Key Facts:</span>
                  </div>
                  <p>{activeRecallTopic.answerSummary}</p>
                </div>
              ) : (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="mt-4 w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Reveal Key Model Answer</span>
                </button>
              )}
            </div>

            {/* Leitner Box Rating Actions */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="text-[11px] text-slate-400 text-center mb-2.5">
                How accurately could you explain this from memory?
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    markTopicReviewed(activeRecallTopic.id, -20);
                    setActiveRecallTopic(null);
                  }}
                  className="py-2 px-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
                >
                  Hard (Reset Box 1)
                </button>
                <button
                  onClick={() => {
                    markTopicReviewed(activeRecallTopic.id, 10);
                    setActiveRecallTopic(null);
                  }}
                  className="py-2 px-2 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
                >
                  Good (+1 Box)
                </button>
                <button
                  onClick={() => {
                    markTopicReviewed(activeRecallTopic.id, 25);
                    setActiveRecallTopic(null);
                  }}
                  className="py-2 px-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                >
                  Easy (Advance +2)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Spaced-Repetition Blueprint Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    AI Spaced-Repetition Blueprint Generator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculates Ebbinghaus forgetting curve intervals leading directly to exam date
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {!generatedPlan ? (
              <div className="space-y-4 mt-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Subject
                    </label>
                    <select
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value as SubjectType)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Exam Target Date
                    </label>
                    <input
                      type="date"
                      value={aiExamDate}
                      onChange={(e) => setAiExamDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Target Grade
                    </label>
                    <select
                      value={aiTargetGrade}
                      onChange={(e) => setAiTargetGrade(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="A+">A+ (97-100%) - Comprehensive</option>
                      <option value="A">A (93-96%) - Mastery</option>
                      <option value="B+">B+ (87-92%) - Accelerated</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Study Capacity: {aiHours} hrs/day
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="0.5"
                      value={aiHours}
                      onChange={(e) => setAiHours(Number(e.target.value))}
                      className="w-full accent-indigo-500 mt-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Syllabus Topics (comma-separated)
                  </label>
                  <textarea
                    rows={3}
                    value={aiTopicsInput}
                    onChange={(e) => setAiTopicsInput(e.target.value)}
                    placeholder="e.g. Dynamic Programming, Graph Flow, Dijkstra Proofs"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() => setIsAiModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLaunchAIPlanner}
                    disabled={isGeneratingAi}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-all shadow-md shadow-indigo-600/20"
                  >
                    {isGeneratingAi ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Spaced Schedule...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Spaced Plan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Generated Plan Preview */
              <div className="space-y-4 mt-4">
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
                  <h4 className="text-sm font-bold text-white">
                    {generatedPlan.planTitle}
                  </h4>
                  <p className="text-xs text-indigo-300 mt-1">
                    {generatedPlan.confidenceProjection} · {generatedPlan.dailyWorkloadAverage}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 italic">
                    "{generatedPlan.prepAdvice}"
                  </p>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {generatedPlan.scheduleItems?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{item.topic}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.phase} · {item.recallTechnique}
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px]">
                          Day +{item.recommendedDayOffset} ({item.spacedRepetitionInterval})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <button
                    onClick={() => setGeneratedPlan(null)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    ← Edit Inputs
                  </button>
                  <button
                    onClick={handleApplyGeneratedPlan}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply Plan to Revision Hub</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Topic Add Modal */}
      {isAddTopicOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSaveManualTopic}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Add Revision Topic</h3>
              <button
                type="button"
                onClick={() => setIsAddTopicOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Subject
              </label>
              <select
                value={newTopicSubject}
                onChange={(e) => setNewTopicSubject(e.target.value as SubjectType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Topic Title
              </label>
              <input
                type="text"
                required
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="e.g. Fourier Transform Properties"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Active Recall Prompt / Question
              </label>
              <input
                type="text"
                value={newTopicQuestion}
                onChange={(e) => setNewTopicQuestion(e.target.value)}
                placeholder="e.g. What is the duality property of continuous Fourier transforms?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Key Answer Summary
              </label>
              <textarea
                rows={2}
                value={newTopicAnswer}
                onChange={(e) => setNewTopicAnswer(e.target.value)}
                placeholder="Summary or formula for self-verification"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddTopicOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Save Topic
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
