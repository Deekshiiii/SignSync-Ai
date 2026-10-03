/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppView } from '../types';
import { 
  Home, 
  Search,
  Languages as TranslateIcon, 
  MessageSquare, 
  GraduationCap, 
  Sparkles, 
  BookMarked, 
  Globe2, 
  Eye, 
  AlertOctagon, 
  BarChart3, 
  History, 
  ShieldCheck, 
  Settings, 
  Cpu
} from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onOpenEmergency: () => void;
  onToggleDemoMode: () => void;
  isDemoMode: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onOpenEmergency,
  onToggleDemoMode,
  isDemoMode,
  isOpenMobile,
  onCloseMobile
}) => {
  const mainNavItems: { id: AppView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Home Workspace', icon: <Home className="w-4 h-4" /> },
    { id: 'identify', label: 'Identify a Sign', icon: <Search className="w-4 h-4" />, badge: 'Instant' },
    { id: 'translate', label: 'Live Translate', icon: <TranslateIcon className="w-4 h-4" /> },
    { id: 'conversation', label: 'Conversation (Two-Way)', icon: <MessageSquare className="w-4 h-4" />, badge: 'Live' },
    { id: 'coach', label: 'AI Sign Coach', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'copilot', label: 'Communication Copilot', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'mysigns', label: 'My Sign Dictionary', icon: <BookMarked className="w-4 h-4" />, badge: 'Preview' },
    { id: 'languages', label: 'Languages (Multilingual)', icon: <Globe2 className="w-4 h-4" /> },
    { id: 'scene', label: 'Scene Understanding', icon: <Eye className="w-4 h-4" /> },
    { id: 'insights', label: 'Insights & AI Lab', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'history', label: 'Conversation History', icon: <History className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy Center', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings & Accessibility', icon: <Settings className="w-4 h-4" /> }
  ];

  const handleItemClick = (id: AppView) => {
    onViewChange(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#1C1917]/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#FAF7F2] border-r border-[#E4DACB] flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand & Logo */}
        <div className="p-5 border-b border-[#E4DACB] bg-[#F5EFEB]/60">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-[#6B1D2F] text-[#FAF7F2] shadow-md shadow-[#6B1D2F]/25 border border-[#C5A059]/40">
              <span className="text-xl font-black">🤟</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A059] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C5A059]"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-[#1C1917]">
                  SIGNSYNC AI
                </span>
              </div>
              <p className="text-[10px] text-[#6B1D2F] font-mono tracking-wider font-bold">
                Understand. Translate. Connect.
              </p>
            </div>
          </div>

          {/* Demo Mode Switcher Banner */}
          <div className="mt-3.5 pt-3 border-t border-[#E4DACB] flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#57534E]">
              Perception Feed:
            </span>
            <button
              onClick={onToggleDemoMode}
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition font-mono ${
                isDemoMode
                  ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#8C6B28]'
                  : 'bg-[#6B1D2F]/10 border-[#6B1D2F]/40 text-[#6B1D2F]'
              }`}
            >
              {isDemoMode ? '● DEMO MODE' : '● LIVE CAMERA'}
            </button>
          </div>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-1">
          {mainNavItems.map(item => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                  active
                    ? 'bg-[#6B1D2F] text-[#FAF7F2] shadow-sm shadow-[#6B1D2F]/20'
                    : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#F3ECE1]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={active ? 'text-[#C5A059]' : 'text-[#78716C]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold border ${
                    active 
                      ? 'bg-[#541524] text-[#C5A059] border-[#C5A059]/40' 
                      : 'bg-[#C5A059]/15 text-[#8C6B28] border-[#C5A059]/40'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Emergency Button in Sidebar */}
          <div className="pt-2">
            <button
              onClick={() => {
                onOpenEmergency();
                onCloseMobile();
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-[#6B1D2F]/10 hover:bg-[#6B1D2F] text-[#6B1D2F] hover:text-[#FAF7F2] border border-[#6B1D2F]/30 text-xs font-bold transition shadow-sm group"
            >
              <AlertOctagon className="w-4 h-4 text-[#6B1D2F] group-hover:text-[#FAF7F2] animate-pulse" />
              <span>🚨 Emergency Mode</span>
            </button>
          </div>
        </div>

        {/* Bottom AI Status Center (Section 21) */}
        <div className="p-3.5 m-3 rounded-2xl bg-[#FFFFFF] border border-[#E4DACB] text-[11px] font-mono shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[#1C1917] flex items-center space-x-1.5 text-[10px] uppercase">
              <Cpu className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>AI System Status</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#16A34A]/10 text-[#16A34A] font-bold border border-[#16A34A]/30">
              ONLINE
            </span>
          </div>

          <div className="space-y-1 text-[10px] text-[#57534E]">
            <div className="flex justify-between">
              <span>Vision AI (MediaPipe)</span>
              <span className="text-[#16A34A] font-bold">● Ready</span>
            </div>
            <div className="flex justify-between">
              <span>Temporal Sign AI</span>
              <span className="text-[#16A34A] font-bold">● Ready</span>
            </div>
            <div className="flex justify-between">
              <span>Context &amp; Copilot</span>
              <span className="text-[#16A34A] font-bold">● Ready</span>
            </div>
            <div className="flex justify-between">
              <span>Speech Recognition</span>
              <span className="text-[#16A34A] font-bold">● Ready</span>
            </div>
            <div className="flex justify-between">
              <span>Multilingual TTS</span>
              <span className="text-[#16A34A] font-bold">● Ready</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
