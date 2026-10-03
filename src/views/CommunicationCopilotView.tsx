/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppSettings, SupportedLanguage } from '../types';
import { SignAvatar } from '../components/SignAvatar';
import { ttsService } from '../services/ttsService';
import { translateSentence } from '../services/multilingual';
import { 
  Sparkles, 
  Brain, 
  MessageSquare, 
  Volume2, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  HelpCircle,
  Cpu
} from 'lucide-react';

interface CommunicationCopilotViewProps {
  settings: AppSettings;
  outputLanguage: SupportedLanguage;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

export const CommunicationCopilotView: React.FC<CommunicationCopilotViewProps> = ({
  settings,
  outputLanguage,
  onUpdateSettings
}) => {
  const [activeAvatarPrompt, setActiveAvatarPrompt] = useState('Nice to meet you.');
  const [repairState, setRepairState] = useState<{
    isActive: boolean;
    unclearSign: string;
    options: string[];
  }>({
    isActive: true,
    unclearSign: 'MY ??? IS',
    options: ['NAME (82%)', 'FRIEND (11%)', 'STUDENT (7%)']
  });

  const handleSelectResponse = (reply: string) => {
    setActiveAvatarPrompt(reply);
    const translated = translateSentence(reply, outputLanguage);
    ttsService.speak(translated, {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      voiceURI: settings.speechVoice
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#101726] border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/25">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
              <span>COMMUNICATION COPILOT</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800 font-mono">
                Contextual Intelligence
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Dialogue memory, intent classification, intelligent suggested responses, and conversation repair
            </p>
          </div>
        </div>

        {/* Conversation Memory Switch (Section 12) */}
        <div className="flex items-center space-x-2.5 bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-800">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-200 block">Conversation Memory</span>
            <span className="text-[10px] font-mono text-cyan-400">
              {settings.contextActive ? '● Context Active' : '○ Context Off'}
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.contextActive}
            onChange={(e) => onUpdateSettings({ contextActive: e.target.checked })}
            className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Intent & Suggestions */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Intent Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <Brain className="w-4 h-4 text-violet-400" />
                <span>Detected Conversational Intent</span>
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                96% Confidence
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                  Current Intent Category
                </span>
                <span className="text-base font-black text-white">Introduction</span>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                  Contextual State
                </span>
                <span className="text-xs font-semibold text-cyan-300">
                  The signer is introducing themselves.
                </span>
              </div>
            </div>

            {/* Smart Suggested Responses (Section 5 & 13) */}
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2.5">
                Copilot Suggested Responses (Tap to speak & sign):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  'Nice to meet you.',
                  'How can I help you?',
                  'What is your name?'
                ].map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleSelectResponse(reply)}
                    className="p-3 rounded-2xl bg-gradient-to-br from-slate-950 to-violet-950/30 hover:border-violet-500 border border-slate-800 text-slate-200 text-xs font-bold transition text-left flex flex-col justify-between"
                  >
                    <span>&ldquo;{reply}&rdquo;</span>
                    <span className="text-[10px] text-cyan-400 mt-2 font-mono flex items-center space-x-1">
                      <Volume2 className="w-3 h-3" />
                      <span>Speak &amp; Sign</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 8: Conversation Repair AI */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Conversation Repair AI
              </span>
            </div>

            <p className="text-xs text-slate-300">
              &ldquo;I may have misunderstood the last sign in sequence: <strong>{repairState.unclearSign}</strong>.&rdquo;
            </p>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                Choose Most Likely Interpretation:
              </span>
              <div className="flex flex-wrap gap-2">
                {repairState.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      handleSelectResponse(`Hello, my name is confirmed.`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500 text-slate-200 text-xs font-semibold transition"
                  >
                    + {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Sign Avatar Preview */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <SignAvatar
            currentText={activeAvatarPrompt}
            className="shadow-2xl"
          />

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-300 block">Copilot Status:</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              The Copilot maintains a running dialogue state vector to disambiguate pronouns, resolve elliptical responses like &ldquo;YES&rdquo;, and generate immediate hearing-conversant replies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
