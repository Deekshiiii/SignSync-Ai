/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CameraView } from '../components/CameraView';
import { 
  PredictionResult, 
  SequenceItem, 
  AppSettings, 
  TranslationHistoryItem 
} from '../types';
import { 
  Languages, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  AlertCircle, 
  Send,
  MessageSquareQuote,
  Clock
} from 'lucide-react';

interface TranslateViewProps {
  onPrediction: (result: PredictionResult) => void;
  latestPrediction: PredictionResult | null;
  sequence: SequenceItem[];
  generatedSentence: string;
  settings: AppSettings;
  isSpeaking: boolean;
  onSpeak: (text?: string) => void;
  onStopSpeak: () => void;
  onClearSequence: () => void;
  onAddManualSign: (sign: string) => void;
  onCommitToHistory: () => void;
  history: TranslationHistoryItem[];
}

export const TranslateView: React.FC<TranslateViewProps> = ({
  onPrediction,
  latestPrediction,
  sequence,
  generatedSentence,
  settings,
  isSpeaking,
  onSpeak,
  onStopSpeak,
  onClearSequence,
  onAddManualSign,
  onCommitToHistory,
  history
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'kiosk' | 'transcript'>('kiosk');

  const emergencyPhrases = [
    { label: 'Need Medical Help', signs: ['I', 'HELP'] },
    { label: 'Water Please', signs: ['WATER', 'PLEASE'] },
    { label: 'Food / Hungry', signs: ['I', 'WANT', 'FOOD'] },
    { label: 'Thank You', signs: ['THANK YOU'] },
    { label: 'Please Stop', signs: ['PLEASE', 'STOP'] },
    { label: 'I am Deaf', signs: ['I', 'NO'] }
  ];

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto' : ''}`}>
      {/* Top Kiosk Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
              <span>Real-Time Conversation Kiosk</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                Two-Way Translation
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              High-contrast accessibility interface for signer and listener
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Kiosk'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Compact Feed, Right Big Live Subtitle Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera Feed & Sequence */}
        <div className="lg:col-span-5 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <CameraView
              onPrediction={onPrediction}
              settings={settings}
            />
          </div>

          {/* Real-time sign sequence badge */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-x-auto py-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold flex-shrink-0">
                Live Signs:
              </span>
              {sequence.length === 0 ? (
                <span className="text-xs text-slate-500 italic">None active</span>
              ) : (
                sequence.map(s => (
                  <span
                    key={s.id}
                    className="text-xs px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold whitespace-nowrap"
                  >
                    {s.sign}
                  </span>
                ))
              )}
            </div>

            <button
              onClick={onClearSequence}
              disabled={sequence.length === 0}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 disabled:opacity-30 transition ml-2"
              title="Clear current phrase"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Essential Communication Buttons */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Quick Essential Phrases:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {emergencyPhrases.map(p => (
                <button
                  key={p.label}
                  onClick={() => {
                    p.signs.forEach(s => onAddManualSign(s));
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-950/60 hover:border-cyan-700 text-slate-300 hover:text-cyan-200 text-xs font-semibold border border-slate-700/60 transition text-left truncate"
                >
                  ⚡ {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: High-Contrast Live Subtitles & Conversation Transcript */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Subtitle Display Screen */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl min-h-[300px]">
            {/* Live Subtitle Tag */}
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span>Live Subtitles (Listener Screen)</span>
              </span>

              {generatedSentence && (
                <button
                  onClick={onCommitToHistory}
                  className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold transition"
                >
                  <Send className="w-3 h-3" />
                  <span>Log Sentence</span>
                </button>
              )}
            </div>

            {/* Huge Readable Translated Text */}
            <div className="my-auto py-4">
              {generatedSentence ? (
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                  &ldquo;{generatedSentence}&rdquo;
                </h1>
              ) : (
                <div className="text-slate-500 text-lg sm:text-2xl font-medium italic">
                  Sign in front of camera to display live translated voice & subtitles...
                </div>
              )}
            </div>

            {/* Bottom Big Speak Button */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={isSpeaking ? onStopSpeak : () => onSpeak()}
                disabled={!generatedSentence}
                className={`flex items-center space-x-2.5 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-150 shadow-lg ${
                  isSpeaking
                    ? 'bg-rose-500 text-white animate-pulse'
                    : generatedSentence
                    ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 shadow-cyan-500/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-5 h-5" />
                    <span>Stop Speech</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 text-slate-950" />
                    <span>🔊 Speak Aloud</span>
                  </>
                )}
              </button>

              <span className="text-xs font-mono text-slate-400">
                {generatedSentence ? `${generatedSentence.split(' ').length} words` : 'Standby'}
              </span>
            </div>
          </div>

          {/* Live Conversation Transcript Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <MessageSquareQuote className="w-4 h-4 text-cyan-400" />
                <span>Session Transcript History</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {history.length} Entries
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {history.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">
                  Confirmed sentences will be logged here for ongoing dialogue.
                </p>
              ) : (
                history.slice(0, 8).map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <div className="flex gap-1">
                          {item.signs.map((s, i) => (
                            <span key={i} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-mono">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="font-bold text-slate-100 text-sm">
                        &ldquo;{item.generatedSentence}&rdquo;
                      </p>
                    </div>

                    <button
                      onClick={() => onSpeak(item.generatedSentence)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-400 transition"
                      title="Replay speech"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
