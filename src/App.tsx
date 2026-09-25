/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudyProvider } from './context/StudyContext';
import { Header } from './components/Header';
import { ScheduleView } from './components/ScheduleView';
import { RevisionView } from './components/RevisionView';
import { ExamsWatchdogView } from './components/ExamsWatchdogView';
import { AIInsightsView } from './components/AIInsightsView';
import { PeerDashboardView } from './components/PeerDashboardView';
import { NotificationModal } from './components/NotificationModal';
import { PricingModal } from './components/PricingModal';
import { AddExamModal } from './components/AddExamModal';
import { PomodoroWidget } from './components/PomodoroWidget';
import {
  Sparkles,
  Calendar,
  Layers,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  Heart
} from 'lucide-react';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'revision' | 'exams' | 'ai-insights' | 'peers'>('schedule');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openNotificationDrawer={() => setIsNotifOpen(true)}
        openPricingModal={() => setIsPricingOpen(true)}
        openAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'schedule' && (
          <ScheduleView openAddModal={() => setIsAddModalOpen(true)} />
        )}
        {activeTab === 'revision' && <RevisionView />}
        {activeTab === 'exams' && (
          <ExamsWatchdogView openAddModal={() => setIsAddModalOpen(true)} />
        )}
        {activeTab === 'ai-insights' && <AIInsightsView />}
        {activeTab === 'peers' && <PeerDashboardView />}
      </main>

      {/* Floating Pomodoro Focus Engine */}
      <PomodoroWidget />

      {/* Global Modals */}
      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />
      <AddExamModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Micro-SaaS Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B0F17] py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">SynapsePlan</span>
            <span>·</span>
            <span>AI Student Study Planner & Peer OS</span>
            <span>·</span>
            <span className="text-emerald-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> All systems operational
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPricingOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Subscription Plans
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('ai-insights')}
              className="hover:text-indigo-400 transition-colors"
            >
              Cognitive Chronotype
            </button>
            <span>·</span>
            <span className="text-slate-600">v2.4.0 SaaS Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <StudyProvider>
      <MainContent />
    </StudyProvider>
  );
}
