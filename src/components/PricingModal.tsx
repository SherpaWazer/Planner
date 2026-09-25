import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { Check, Flame, Sparkles, Shield, Zap } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { userTier, setUserTier } = useStudy();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  if (!isOpen) return null;

  const tiers = [
    {
      id: 'free',
      name: 'Free Student',
      price: '$0',
      period: 'forever',
      description: 'Foundational study timetable and basic exam countdowns.',
      features: [
        'Up to 3 Exam Deadlines',
        'Standard Timetable Grid',
        'Basic Pomodoro Timer',
        'In-App Notification Alerts',
        'Community Forum Access'
      ],
      cta: 'Current Free Tier',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro Scholar',
      price: billingCycle === 'annual' ? '$4.99' : '$7.99',
      period: '/ month',
      description: 'The full AI productivity suite for high-achieving university students.',
      features: [
        'Unlimited Exam Deadlines & Watchdog',
        'Full 5-Box Leitner Spaced Repetition',
        'AI Chronotype Focus Curve (Gemini 3.8)',
        'AI Spaced Repetition Blueprints',
        'Automated Desktop & Web Audio Alerts',
        'Export to Apple & Google Calendar (.ics)',
        'Priority AI Token Allocation'
      ],
      cta: userTier === 'pro' ? 'Current Active Tier' : 'Upgrade to Pro Scholar',
      popular: true
    },
    {
      id: 'campus',
      name: 'Campus Cohort',
      price: billingCycle === 'annual' ? '$14.99' : '$19.99',
      period: '/ month',
      description: 'Shared focus rooms, group synced timers, and collaborative notes for study groups.',
      features: [
        'Everything in Pro Scholar',
        'Unlimited Peer Group Focus Rooms',
        'Synchronized Group Pomodoro Sprints',
        'Shared Exam Mnemonics & Notes Wall',
        'Cohort Milestone Tracking & Leaderboards',
        'Dedicated Study Room Link'
      ],
      cta: userTier === 'campus' ? 'Current Active Tier' : 'Upgrade to Campus Cohort',
      popular: false
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                Micro-SaaS Subscriptions
              </span>
              <span className="text-xs text-slate-400">Cancel or switch anytime</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Elevate Your Study Architecture
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Billing Switcher */}
        <div className="flex justify-center mt-6">
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                billingCycle === 'monthly'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium ${
                billingCycle === 'annual'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">
                Save 35%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          {tiers.map((tier) => {
            const isCurrent = userTier === tier.id;
            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl p-5 flex flex-col justify-between border transition-all ${
                  tier.popular
                    ? 'bg-slate-950/90 border-indigo-500 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  <h3 className="text-base font-bold text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">
                    {tier.description}
                  </p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{tier.price}</span>
                    <span className="text-xs text-slate-400 font-mono">{tier.period}</span>
                  </div>

                  <div className="mt-5 space-y-2.5">
                    {tier.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setUserTier(tier.id as any);
                      onClose();
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      isCurrent
                        ? 'bg-slate-800 text-slate-300 cursor-default'
                        : tier.popular
                        ? 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:opacity-95 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {isCurrent ? 'Current Tier Active' : `Select ${tier.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
          Student discount: Instant 20% cashback when verifying with an active .edu email address.
        </div>
      </div>
    </div>
  );
};
