/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppView } from '../types';
import { 
  Sparkles, 
  Camera, 
  Languages, 
  GraduationCap, 
  History, 
  Database, 
  Settings, 
  Volume2, 
  VolumeX,
  Radio
} from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  cameraActive: boolean;
  onToggleCamera: () => void;
  onOpenSettings: () => void;
  isSpeaking: boolean;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  cameraActive,
  onToggleCamera,
  onOpenSettings,
  isSpeaking,
  autoSpeak,
  onToggleAutoSpeak
}) => {
  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: <Camera className="w-4 h-4" /> },
    { id: 'translate', label: 'Translate Kiosk', icon: <Languages className="w-4 h-4" /> },
    { id: 'conversation', label: 'Connect', icon: <Radio className="w-4 h-4" />, badge: 'Two-Way' },
    { id: 'coach', label: 'Sign Coach', icon: <GraduationCap className="w-4 h-4" />, badge: 'Practice' },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
    { id: 'insights', label: 'Insights & Lab', icon: <Database className="w-4 h-4" /> }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20">
              <span className="text-xl font-black tracking-tight">🤟</span>
              {cameraActive && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                  SIGNSYNC AI
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  MVP v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Camera → MediaPipe → Classifier → Sequence → TTS
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            {navItems.map(item => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] px-1 rounded uppercase tracking-wider ${
                      active ? 'bg-slate-950/20 text-slate-950' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2">
            {/* Auto-speak toggle */}
            <button
              onClick={onToggleAutoSpeak}
              title={autoSpeak ? 'Auto-speak enabled' : 'Auto-speak disabled'}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                autoSpeak
                  ? 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden lg:inline text-[11px]">Auto TTS</span>
            </button>

            {/* Camera Quick Toggle */}
            <button
              onClick={onToggleCamera}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                cameraActive
                  ? 'bg-emerald-950/50 border-emerald-600/70 text-emerald-300 shadow-sm shadow-emerald-500/10'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${cameraActive ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}`} />
              <span>{cameraActive ? 'Camera ON' : 'Camera OFF'}</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Pipeline & Detection Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto space-x-1 py-2 border-t border-slate-900 text-xs">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center space-x-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg font-medium ${
                currentView === item.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
