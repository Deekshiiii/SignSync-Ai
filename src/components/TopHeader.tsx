/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupportedLanguage, AppView } from '../types';
import { SUPPORTED_LANGUAGES } from '../services/multilingual';
import { 
  Menu, 
  Bell, 
  User, 
  Sparkles, 
  Globe2, 
  Check, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Radio
} from 'lucide-react';

interface TopHeaderProps {
  onToggleMobileSidebar: () => void;
  outputLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleMobileSidebar,
  outputLanguage,
  onLanguageChange,
  currentView,
  onViewChange
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: 1, title: 'Sign recognized', desc: 'Gesture "HELP" confirmed at 96% confidence', time: 'Just now', type: 'success' },
    { id: 2, title: 'Translation completed', desc: 'Synthesized English to Tamil speech output', time: '2m ago', type: 'info' },
    { id: 3, title: 'Privacy mode active', desc: 'Zero camera frames stored to cloud', time: '10m ago', type: 'shield' }
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E4DACB] px-4 sm:px-6 flex items-center justify-between text-[#1C1917]">
      {/* Left side: Hamburger on mobile + Active View Pill */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl text-[#57534E] hover:text-[#1C1917] hover:bg-[#F3ECE1] lg:hidden transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2">
          {/* Core Modes Switcher */}
          <div className="flex items-center bg-[#F3ECE1] p-1 rounded-2xl border border-[#E4DACB] text-xs font-bold">
            <button
              onClick={() => onViewChange('home')}
              className={`px-3 py-1.5 rounded-xl transition ${
                currentView === 'home'
                  ? 'bg-[#6B1D2F] text-[#FAF7F2] shadow-sm'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Workspace
            </button>
            <button
              onClick={() => onViewChange('identify')}
              className={`px-3 py-1.5 rounded-xl transition ${
                currentView === 'identify'
                  ? 'bg-[#6B1D2F] text-[#FAF7F2] shadow-sm'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              🔍 Identify Sign
            </button>
            <button
              onClick={() => onViewChange('conversation')}
              className={`px-3 py-1.5 rounded-xl transition ${
                currentView === 'conversation'
                  ? 'bg-[#6B1D2F] text-[#FAF7F2] shadow-sm'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Live Conversation
            </button>
            <button
              onClick={() => onViewChange('coach')}
              className={`px-3 py-1.5 rounded-xl transition ${
                currentView === 'coach'
                  ? 'bg-[#6B1D2F] text-[#FAF7F2] shadow-sm'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Learning Mode
            </button>
          </div>
        </div>
      </div>

      {/* Center: Online Status Indicator */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E4DACB] text-xs font-mono font-bold text-[#1C1917] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span>AI ONLINE</span>
        </div>
      </div>

      {/* Right side: Language Picker, Notifications, Profile */}
      <div className="flex items-center space-x-2.5">
        {/* Multilingual Selector */}
        <div className="relative">
          <select
            value={outputLanguage}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            className="bg-[#FFFFFF] border border-[#E4DACB] hover:border-[#6B1D2F] text-[#1C1917] text-xs font-bold rounded-xl px-2.5 py-1.5 outline-none cursor-pointer font-mono transition shadow-sm"
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="p-2 rounded-xl bg-[#FFFFFF] border border-[#E4DACB] text-[#57534E] hover:text-[#1C1917] hover:bg-[#F3ECE1] transition relative shadow-sm"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#6B1D2F] rounded-full" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#FFFFFF] border border-[#E4DACB] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in duration-150 text-[#1C1917]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E4DACB]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  Notification Center
                </span>
                <span className="text-[10px] font-mono text-[#6B1D2F] font-bold">3 New</span>
              </div>
              <div className="space-y-2 text-xs">
                {notifications.map(n => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E4DACB]">
                    <div className="flex justify-between font-semibold text-[#1C1917]">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-[#78716C] font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#57534E] mt-0.5">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2 p-1.5 rounded-xl bg-[#FFFFFF] border border-[#E4DACB] text-[#1C1917] hover:bg-[#F3ECE1] transition shadow-sm"
          >
            <div className="w-7 h-7 rounded-lg bg-[#6B1D2F] flex items-center justify-center text-[#C5A059] font-black text-xs">
              D
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 bg-[#FFFFFF] border border-[#E4DACB] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in duration-150 text-xs text-[#1C1917]">
              <div className="flex items-center space-x-3 pb-3 mb-3 border-b border-[#E4DACB]">
                <div className="w-10 h-10 rounded-xl bg-[#6B1D2F] flex items-center justify-center text-[#C5A059] font-black text-sm">
                  D
                </div>
                <div>
                  <span className="font-bold text-[#1C1917] block">Deekshitha</span>
                  <span className="text-[11px] text-[#6B1D2F] font-mono font-semibold">Signer Profile</span>
                </div>
              </div>
              <div className="space-y-1.5 text-[#57534E] text-[11px]">
                <div className="flex justify-between">
                  <span>Communication Style:</span>
                  <span className="text-[#1C1917] font-semibold">ASL Primary</span>
                </div>
                <div className="flex justify-between">
                  <span>Recognition Accuracy:</span>
                  <span className="text-[#16A34A] font-mono font-bold">96%</span>
                </div>
                <div className="flex justify-between">
                  <span>Output Audio:</span>
                  <span className="text-[#1C1917] font-semibold">Enabled</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
