/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CameraView } from '../components/CameraView';
import { SignDetectionBadge } from '../components/SignDetectionBadge';
import { SequenceBar } from '../components/SequenceBar';
import { SentenceCard } from '../components/SentenceCard';
import { 
  PredictionResult, 
  SequenceItem, 
  AppSettings, 
  AppView 
} from '../types';
import { SIGN_DICTIONARY_MAP } from '../data/signs';
import { 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Languages, 
  GraduationCap, 
  Info,
  CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  onPrediction: (result: PredictionResult) => void;
  latestPrediction: PredictionResult | null;
  sequence: SequenceItem[];
  generatedSentence: string;
  stabilityProgress: number;
  settings: AppSettings;
  isSpeaking: boolean;
  onSpeak: () => void;
  onStopSpeak: () => void;
  onUndoSign: () => void;
  onClearSequence: () => void;
  onRemoveSignIndex: (idx: number) => void;
  onAddManualSign: (sign: string) => void;
  onSpeedChange: (speed: number) => void;
  onNavigate: (view: AppView) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onPrediction,
  latestPrediction,
  sequence,
  generatedSentence,
  stabilityProgress,
  settings,
  isSpeaking,
  onSpeak,
  onStopSpeak,
  onUndoSign,
  onClearSequence,
  onRemoveSignIndex,
  onAddManualSign,
  onSpeedChange,
  onNavigate
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner / Pipeline Visualizer */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Real-Time Neural Vision Pipeline</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                Active
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Camera → 21 Landmarks (MediaPipe) → Feature Vector (63D) → ML Classifier → NLP → Speech
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center space-x-2 self-stretch md:self-auto">
          <button
            onClick={() => onNavigate('translate')}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/60 transition"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kiosk Mode</span>
          </button>
          <button
            onClick={() => onNavigate('coach')}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 text-xs font-semibold border border-indigo-800/60 transition"
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sign Coach</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Camera, Right Inference & Speech */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera Feed */}
        <div className="lg:col-span-7 space-y-4">
          <CameraView
            onPrediction={onPrediction}
            settings={settings}
          />

          {/* Tips under camera */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Tip:</strong> Keep your hand clearly visible within the frame. Hold each sign steady for ~300ms to register it into the sequence buffer.
            </p>
          </div>
        </div>

        {/* Right Column: Sign Detection Badge, Sequence, Sentence */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Real-Time Detection Badge */}
          <SignDetectionBadge
            prediction={latestPrediction}
            stabilityProgress={stabilityProgress}
          />

          {/* Continuous Sequence Buffer */}
          <SequenceBar
            sequence={sequence}
            onUndo={onUndoSign}
            onClear={onClearSequence}
            onRemoveItem={onRemoveSignIndex}
            onAddManualSign={onAddManualSign}
          />

          {/* Formatted Natural English Sentence & Speech */}
          <SentenceCard
            sentence={generatedSentence}
            isSpeaking={isSpeaking}
            onSpeak={onSpeak}
            onStopSpeak={onStopSpeak}
            speed={settings.speechRate}
            onSpeedChange={onSpeedChange}
          />
        </div>
      </div>
    </div>
  );
};
