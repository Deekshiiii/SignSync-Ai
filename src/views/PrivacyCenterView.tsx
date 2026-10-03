/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppSettings } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Trash2, 
  Download, 
  Server, 
  HardDrive, 
  CheckCircle2, 
  Info,
  Radio
} from 'lucide-react';

interface PrivacyCenterViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onClearAllData: () => void;
}

export const PrivacyCenterView: React.FC<PrivacyCenterViewProps> = ({
  settings,
  onUpdateSettings,
  onClearAllData
}) => {
  const [dataDeleted, setDataDeleted] = useState(false);

  const handleDeleteAll = () => {
    onClearAllData();
    setDataDeleted(true);
    setTimeout(() => setDataDeleted(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#101726] border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
              <span>Privacy &amp; Security Center</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                Zero Cloud Video Storage
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              On-device perception, zero unauthorized cloud transmission, user-sovereign conversation logs
            </p>
          </div>
        </div>
      </div>

      {/* Main Privacy Status Cards (Section 20) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Camera Processing</span>
          <div className="flex items-center space-x-2 text-base font-black text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Local Stream</span>
          </div>
          <span className="text-[11px] text-slate-500">Processed frame-by-frame in RAM</span>
        </div>

        <div className="p-4.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Video Footage Storage</span>
          <div className="flex items-center space-x-2 text-base font-black text-emerald-400">
            <Lock className="w-4 h-4" />
            <span>Never Stored</span>
          </div>
          <span className="text-[11px] text-slate-500">Zero disk caching of camera feeds</span>
        </div>

        <div className="p-4.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Processing Mode</span>
          <div className="flex items-center space-x-2 text-base font-black text-cyan-400">
            <HardDrive className="w-4 h-4" />
            <span>On-Device (WebGL)</span>
          </div>
          <span className="text-[11px] text-slate-500">MediaPipe runs client-side</span>
        </div>

        <div className="p-4.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Conversation History</span>
          <div className="flex items-center space-x-2 text-base font-black text-slate-200">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>User Sovereign</span>
          </div>
          <span className="text-[11px] text-slate-500">Stored exclusively in your browser</span>
        </div>
      </div>

      {/* Toggles & Data Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Security Preferences */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Privacy Preferences &amp; Processing Controls:
          </span>

          <div className="space-y-4 text-xs">
            {/* Local Processing Only */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200 block">Strict Local On-Device AI Mode</span>
                <span className="text-slate-400 text-[11px]">
                  Bypasses all remote NLP models; relies 100% on browser WASM &amp; rule engines.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.localProcessingOnly}
                onChange={(e) => onUpdateSettings({ localProcessingOnly: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            {/* Conversation Memory Retention */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200 block">Episodic Conversation Memory</span>
                <span className="text-slate-400 text-[11px]">
                  Allows the Copilot to link previous questions to answers (e.g. YES refers to previous offer).
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.contextActive}
                onChange={(e) => onUpdateSettings({ contextActive: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right: Data Purge & Export */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Data Deletion &amp; Export:
          </span>

          <p className="text-xs text-slate-400 leading-relaxed">
            All registered custom signs, translation histories, and audio settings are kept on this device. You can purge them at any time.
          </p>

          <div className="pt-2 space-y-2.5">
            <button
              onClick={handleDeleteAll}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 font-bold text-xs transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>{dataDeleted ? 'Data Cleared!' : 'Purge All Local Data & Logs'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
