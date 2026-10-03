/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, Sparkles, MessageSquare, RefreshCw } from 'lucide-react';
import { ttsService } from '../services/ttsService';

interface SentenceCardProps {
  sentence: string;
  isSpeaking: boolean;
  onSpeak: () => void;
  onStopSpeak: () => void;
  onRegenerate?: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  isAiEnhanced?: boolean;
  onToggleAiEnhanced?: () => void;
}

export const SentenceCard: React.FC<SentenceCardProps> = ({
  sentence,
  isSpeaking,
  onSpeak,
  onStopSpeak,
  onRegenerate,
  speed,
  onSpeedChange,
  isAiEnhanced,
  onToggleAiEnhanced
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!sentence) return;
    navigator.clipboard.writeText(sentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speedOptions = [0.8, 1.0, 1.2];

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-slate-950/40 flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span className="font-bold uppercase tracking-wider text-slate-300">
            Translated Spoken English
          </span>
        </div>

        {/* AI Polish toggle */}
        {onToggleAiEnhanced && (
          <button
            onClick={onToggleAiEnhanced}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              isAiEnhanced
                ? 'bg-indigo-950/70 border-indigo-600/80 text-indigo-300'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Polish</span>
          </button>
        )}
      </div>

      {/* Main Sentence Output */}
      <div className="my-2 min-h-[70px] flex items-center">
        {sentence ? (
          <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug drop-shadow-sm">
            &ldquo;{sentence}&rdquo;
          </p>
        ) : (
          <p className="text-base text-slate-500 italic">
            Waiting for recognized signs to construct natural sentence...
          </p>
        )}
      </div>

      {/* Waveform indicator when speaking */}
      {isSpeaking && (
        <div className="flex items-center space-x-1.5 py-1">
          <div className="flex items-center space-x-1 h-5">
            {[40, 80, 60, 100, 50, 75, 90, 45].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-cyan-400 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 120}ms`,
                  animationDuration: '600ms'
                }}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-cyan-400 font-semibold ml-2">
            Speaking audio output...
          </span>
        </div>
      )}

      {/* Footer controls: Speak, Speed, Copy */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          {/* Main Speak button */}
          <button
            onClick={isSpeaking ? onStopSpeak : onSpeak}
            disabled={!sentence}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-150 shadow-md ${
              isSpeaking
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25 animate-pulse'
                : sentence
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black shadow-cyan-500/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Stop Voice</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-slate-950" />
                <span>🔊 SPEAK</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!sentence}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition border border-slate-700/60"
            title="Copy sentence to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 px-2 font-bold">
            Speed:
          </span>
          {speedOptions.map(s => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition ${
                speed === s
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
