/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AppSettings } from '../types';
import { ttsService, TTSVoiceOption } from '../services/ttsService';
import { X, Sliders, Volume2, ShieldCheck, Eye, RotateCcw, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetDefaults
}) => {
  const [voices, setVoices] = useState<TTSVoiceOption[]>([]);

  useEffect(() => {
    const unsub = ttsService.onVoicesLoaded((v) => {
      setVoices(v);
    });
    setVoices(ttsService.getVoices());
    return unsub;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF7F2] border-2 border-[#E4DACB] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#1C1917]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#C5A059]/30 bg-[#6B1D2F] text-[#FAF7F2]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-[#541524] text-[#C5A059] border border-[#C5A059]/40 shadow-sm">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#FAF7F2]">Pipeline &amp; Voice Settings</h3>
              <p className="text-xs text-[#FAF7F2]/80">Configure recognition sensitivity, accessibility, and voice</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#FAF7F2]/70 hover:text-white hover:bg-[#541524] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* 1. Computer Vision & Classifier */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B1D2F] flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
              <span>Vision &amp; Detection Parameters</span>
            </h4>

            {/* Confidence Threshold */}
            <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#E4DACB] space-y-1.5 shadow-sm">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#1C1917]">Confidence Threshold</span>
                <span className="text-[#6B1D2F] font-mono">{Math.round(settings.confidenceThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.9"
                step="0.05"
                value={settings.confidenceThreshold}
                onChange={(e) => onUpdateSettings({ confidenceThreshold: parseFloat(e.target.value) })}
                className="w-full accent-[#6B1D2F] bg-[#E4DACB] h-2 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-[#78716C]">
                Lower values accept looser handshapes; higher values require strict landmark alignment.
              </p>
            </div>

            {/* Stability Frames */}
            <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#E4DACB] space-y-1.5 shadow-sm">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#1C1917]">Sequence Stability Window</span>
                <span className="text-[#8C6B28] font-mono">{settings.stabilityFrames} frames (~{Math.round(settings.stabilityFrames * 33)}ms)</span>
              </div>
              <input
                type="range"
                min="4"
                max="18"
                step="1"
                value={settings.stabilityFrames}
                onChange={(e) => onUpdateSettings({ stabilityFrames: parseInt(e.target.value) })}
                className="w-full accent-[#6B1D2F] bg-[#E4DACB] h-2 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-[#78716C]">
                Duration a sign must be held continuously before automatically appending to the sentence.
              </p>
            </div>

            {/* Skeleton Overlay Style */}
            <div className="flex items-center justify-between p-3.5 bg-[#FFFFFF] rounded-2xl border border-[#E4DACB]">
              <div>
                <span className="text-xs font-bold text-[#1C1917] block">Landmark Skeleton Style</span>
                <span className="text-[11px] text-[#78716C]">Visual style for hand tracking bones</span>
              </div>
              <select
                value={settings.skeletonStyle}
                onChange={(e) => onUpdateSettings({ skeletonStyle: e.target.value as any })}
                className="bg-[#FAF7F2] border border-[#E4DACB] text-[#1C1917] text-xs font-bold rounded-xl px-3 py-1.5 outline-none"
              >
                <option value="neon">Burgundy &amp; Gold Glow</option>
                <option value="soft">Clean Ivory Contrast</option>
                <option value="minimal">Minimalist Thin</option>
              </select>
            </div>
          </div>

          <hr className="border-[#E4DACB]" />

          {/* 2. Text-to-Speech Settings */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B1D2F] flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-[#C5A059]" />
              <span>Voice &amp; Speech Synthesis</span>
            </h4>

            {/* Voice selector */}
            <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#E4DACB] space-y-2 shadow-sm">
              <span className="text-xs font-bold text-[#1C1917] block">
                Speech Output Voice
              </span>
              <select
                value={settings.speechVoice}
                onChange={(e) => onUpdateSettings({ speechVoice: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#E4DACB] text-[#1C1917] text-xs font-medium rounded-xl p-2.5 outline-none"
              >
                <option value="">System Default Voice</option>
                {voices.map(v => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Auto speak */}
            <div className="flex items-center justify-between p-3.5 bg-[#FFFFFF] rounded-2xl border border-[#E4DACB]">
              <div>
                <span className="text-xs font-bold text-[#1C1917] block">Auto-Speak Committed Sentences</span>
                <span className="text-[11px] text-[#78716C]">Automatically vocalize when sign sequence completes</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSpeak}
                onChange={(e) => onUpdateSettings({ autoSpeak: e.target.checked })}
                className="w-4 h-4 accent-[#6B1D2F] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4.5 border-t border-[#E4DACB] bg-[#F7F2EB] flex items-center justify-between">
          <button
            onClick={onResetDefaults}
            className="flex items-center space-x-1.5 text-xs text-[#78716C] hover:text-[#1C1917] font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-[#6B1D2F] hover:bg-[#541524] text-[#FAF7F2] font-black text-xs transition shadow-md shadow-[#6B1D2F]/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
