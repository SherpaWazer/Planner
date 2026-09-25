import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import { SubjectType } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronUp,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';

export const PomodoroWidget: React.FC = () => {
  const {
    pomodoro,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    switchPomodoroMode,
    setPomodoroTask
  } = useStudy();

  const [isExpanded, setIsExpanded] = useState(false);
  const [ambientAudioOn, setAmbientAudioOn] = useState(false);
  const audioNoiseNode = useRef<AudioNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Background white/pink noise generator via Web Audio API
  useEffect(() => {
    if (ambientAudioOn && pomodoro.isRunning) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioCtx();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        // Create buffer with subtle brown/pink noise
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02; // Soft brownian noise
          lastOut = data[i];
          data[i] *= 0.12; // gentle volume
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.15;

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        noise.start();
        audioNoiseNode.current = noise;
      } catch (e) {
        console.warn('Ambient noise error:', e);
      }
    } else {
      if (audioNoiseNode.current) {
        try {
          (audioNoiseNode.current as any).stop();
          audioNoiseNode.current.disconnect();
        } catch (e) {}
        audioNoiseNode.current = null;
      }
    }

    return () => {
      if (audioNoiseNode.current) {
        try {
          (audioNoiseNode.current as any).stop();
          audioNoiseNode.current.disconnect();
        } catch (e) {}
        audioNoiseNode.current = null;
      }
    };
  }, [ambientAudioOn, pomodoro.isRunning]);

  const totalSeconds =
    pomodoro.mode === 'focus' ? 25 * 60 : pomodoro.mode === 'short_break' ? 5 * 60 : 15 * 60;
  const progressPercent = Math.round(((totalSeconds - pomodoro.timeLeft) / totalSeconds) * 100);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 w-80 sm:w-96">
        {/* Collapsed Bar / Header */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                pomodoro.isRunning
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-indigo-400'
              }`}
            />
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                {pomodoro.mode === 'focus' ? 'Focus Sprint' : 'Rest Break'}
              </div>
              <div className="text-xs font-bold text-white truncate max-w-[160px]">
                {pomodoro.activeTask}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold text-white">
              {formatTimer(pomodoro.timeLeft)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                pomodoro.isRunning ? pausePomodoro() : startPomodoro();
              }}
              className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors shadow-sm"
            >
              {pomodoro.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>
            <div className="text-slate-400">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Progress Line */}
        <div className="w-full h-1 bg-slate-950">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Expanded Controls Panel */}
        {isExpanded && (
          <div className="p-4 border-t border-slate-800/80 space-y-3.5">
            {/* Mode Selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-semibold">
              <button
                onClick={() => switchPomodoroMode('focus')}
                className={`py-1 rounded-lg transition-colors ${
                  pomodoro.mode === 'focus'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                25m Focus
              </button>
              <button
                onClick={() => switchPomodoroMode('short_break')}
                className={`py-1 rounded-lg transition-colors ${
                  pomodoro.mode === 'short_break'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                5m Break
              </button>
              <button
                onClick={() => switchPomodoroMode('long_break')}
                className={`py-1 rounded-lg transition-colors ${
                  pomodoro.mode === 'long_break'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                15m Break
              </button>
            </div>

            {/* Current Focus Task Input */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                Target Objective
              </label>
              <input
                type="text"
                value={pomodoro.activeTask}
                onChange={(e) => setPomodoroTask(e.target.value, pomodoro.selectedSubject)}
                placeholder="e.g. Master Reaction Mechanisms"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>

            {/* Timer Actions & Ambient Audio Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setAmbientAudioOn(!ambientAudioOn)}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                    ambientAudioOn
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Subtle Brownian Focus Noise"
                >
                  {ambientAudioOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">Lo-Fi Brown Noise</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetPomodoro}
                  className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={pomodoro.isRunning ? pausePomodoro : startPomodoro}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  {pomodoro.isRunning ? 'Pause' : 'Start Focus'}
                </button>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono text-center pt-1 border-t border-slate-800/60 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{pomodoro.completedCycles} Sprints Completed Today (75 mins)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
