/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { CustomSign, AppSettings } from '../types';
import { SignVideoPreviewModal } from '../components/SignVideoPreviewModal';
import { 
  BookMarked, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Award, 
  SlidersHorizontal,
  Clock,
  Play,
  Eye,
  Check,
  RotateCcw,
  Video
} from 'lucide-react';

interface MySignsViewProps {
  settings: AppSettings;
}

export const MySignsView: React.FC<MySignsViewProps> = ({ settings }) => {
  const [customSigns, setCustomSigns] = useState<CustomSign[]>([
    {
      id: 'cs-1',
      name: 'DEEKSHITHA',
      meaning: 'My personal name sign (D-handshape tapping near cheek)',
      language: 'ASL',
      sampleCount: 140,
      recordedAt: Date.now() - 86400000 * 3,
      accuracy: 0.96,
      category: 'Names'
    },
    {
      id: 'cs-2',
      name: 'CAMPUS LAB',
      meaning: 'Engineering lab building sign',
      language: 'ASL',
      sampleCount: 85,
      recordedAt: Date.now() - 86400000 * 7,
      accuracy: 0.93,
      category: 'Locations'
    },
    {
      id: 'cs-3',
      name: 'FAVORITE COFFEE',
      meaning: 'Oat milk latte gesture shortcut',
      language: 'ASL',
      sampleCount: 62,
      recordedAt: Date.now() - 86400000 * 12,
      accuracy: 0.91,
      category: 'Food'
    }
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [activePreviewSign, setActivePreviewSign] = useState<CustomSign | null>(null);
  const [verifiedSigns, setVerifiedSigns] = useState<Set<string>>(new Set(['cs-1', 'cs-2']));
  const hoverTimerRef = useRef<any>(null);

  const handleMouseEnterCard = (sign: CustomSign) => {
    // Trigger video preview on hover with smooth 350ms intent delay
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setActivePreviewSign(sign);
    }, 380);
  };

  const handleMouseLeaveCard = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
  };

  const handleManualPreviewClick = (sign: CustomSign, e: React.MouseEvent) => {
    e.stopPropagation();
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setActivePreviewSign(sign);
  };

  const handleSaveSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newSign: CustomSign = {
      id: `cs-${Date.now()}`,
      name: newName.trim().toUpperCase(),
      meaning: newMeaning.trim() || 'Custom personal gesture',
      language: 'ASL',
      sampleCount: 40,
      recordedAt: Date.now(),
      accuracy: 0.94,
      category: newCategory
    };

    setCustomSigns([newSign, ...customSigns]);
    setNewName('');
    setNewMeaning('');
    setIsAdding(false);
    // Prompt preview for immediate verification
    setActivePreviewSign(newSign);
  };

  const handleDelete = (id: string) => {
    setCustomSigns(customSigns.filter(s => s.id !== id));
    if (activePreviewSign?.id === id) {
      setActivePreviewSign(null);
    }
  };

  const handleVerify = (id: string) => {
    setVerifiedSigns(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6 text-[#1C1917]">
      {/* Header with Cream background, Burgundy & Muted Gold */}
      <div className="bg-[#FFFFFF] border border-[#E4DACB] rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md shadow-[#1C1917]/5">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6B1D2F] to-[#8B263E] flex items-center justify-center text-[#C5A059] shadow-md shadow-[#6B1D2F]/20">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#1C1917] tracking-tight flex items-center space-x-2">
              <span>Personal Sign Dictionary &amp; Profile</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A059]/20 text-[#8C6B28] border border-[#C5A059]/40 font-mono font-bold">
                Hover to Preview
              </span>
            </h2>
            <p className="text-xs text-[#57534E]">
              Hover over custom sign cards to verify gesture kinematics with video preview before saving or deleting
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 px-4.5 py-2.5 rounded-2xl bg-[#6B1D2F] hover:bg-[#541524] text-[#FAF7F2] font-black text-xs transition shadow-md shadow-[#6B1D2F]/25"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>{isAdding ? 'Cancel' : '+ Record New Sign'}</span>
        </button>
      </div>

      {/* Model Accuracy Growth Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E4DACB] rounded-2xl p-4.5 shadow-sm">
          <span className="text-[#78716C] text-[10px] font-mono uppercase block mb-1">
            Baseline Generic Model Accuracy
          </span>
          <span className="text-2xl font-black font-mono text-[#57534E]">82.4%</span>
          <span className="text-[11px] text-[#78716C] block mt-1">Pre-trained canonical weights</span>
        </div>

        <div className="bg-[#F3ECE1] border border-[#C5A059]/60 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[#6B1D2F] text-[10px] font-mono uppercase font-bold block mb-1">
              Personalized Model Verification
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          </div>
          <span className="text-2xl font-black font-mono text-[#6B1D2F]">95.8%</span>
          <span className="text-[11px] text-[#8C6B28] block mt-1 font-medium">Fine-tuned to your custom hand kinematics</span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E4DACB] rounded-2xl p-4.5 shadow-sm">
          <span className="text-[#78716C] text-[10px] font-mono uppercase block mb-1">
            Registered Gesture Library
          </span>
          <span className="text-2xl font-black font-mono text-[#1C1917]">
            {customSigns.length} Custom Signs
          </span>
          <span className="text-[11px] text-[#16A34A] block mt-1 font-semibold">
            {verifiedSigns.size} Verified with Video Preview
          </span>
        </div>
      </div>

      {/* Add Custom Sign Form with Verification Step */}
      {isAdding && (
        <form onSubmit={handleSaveSign} className="bg-[#FFFFFF] border-2 border-[#C5A059]/60 rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#6B1D2F] flex items-center space-x-2">
              <Video className="w-4 h-4 text-[#C5A059]" />
              <span>Record &amp; Register Custom Sign</span>
            </h3>
            <span className="text-xs text-[#78716C] font-mono">Step 1 of 2: Record &amp; Verify</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[#1C1917] block mb-1">
                Sign Name (e.g. DEEKSHITHA)
              </label>
              <input
                type="text"
                required
                placeholder="Enter sign name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E4DACB] rounded-xl p-2.5 text-xs text-[#1C1917] outline-none focus:border-[#6B1D2F] font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1C1917] block mb-1">
                Meaning / English Translation
              </label>
              <input
                type="text"
                placeholder="What does this sign communicate?"
                value={newMeaning}
                onChange={(e) => setNewMeaning(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E4DACB] rounded-xl p-2.5 text-xs text-[#1C1917] outline-none focus:border-[#6B1D2F]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1C1917] block mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E4DACB] rounded-xl p-2.5 text-xs text-[#1C1917] outline-none"
              >
                <option value="Names">Names</option>
                <option value="Locations">Locations</option>
                <option value="Medical">Medical</option>
                <option value="Technical">Technical</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F3ECE1] border border-[#E4DACB] text-xs text-[#57534E] flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
              <span>After clicking save, the video preview modal will open automatically so you can verify the recorded gesture.</span>
            </span>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#E4DACB] text-[#57534E] text-xs font-semibold hover:bg-[#F3ECE1]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#6B1D2F] hover:bg-[#541524] text-[#FAF7F2] text-xs font-black uppercase tracking-wider shadow-md shadow-[#6B1D2F]/20"
            >
              Save &amp; Preview Gesture
            </button>
          </div>
        </form>
      )}

      {/* Custom Recorded Sign Cards with Hover Preview */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold uppercase tracking-wider text-[#6B1D2F] flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Hover Card to Trigger Video Preview:</span>
          </span>
          <span className="text-[#78716C] font-mono text-[11px]">
            Hover or click &ldquo;Preview Video&rdquo; to verify gesture
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {customSigns.map(sign => {
            const isVerified = verifiedSigns.has(sign.id);
            return (
              <div
                key={sign.id}
                onMouseEnter={() => handleMouseEnterCard(sign)}
                onMouseLeave={handleMouseLeaveCard}
                className="group relative bg-[#FFFFFF] border-2 border-[#E4DACB] hover:border-[#6B1D2F] rounded-3xl p-5 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-xl hover:shadow-[#6B1D2F]/10 cursor-pointer"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F3ECE1] text-[#6B1D2F] border border-[#E4DACB] font-bold">
                      {sign.category}
                    </span>

                    <div className="flex items-center space-x-1">
                      {isVerified ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30 font-bold flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#C5A059]/20 text-[#8C6B28] border border-[#C5A059]/40 font-bold">
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sign Name */}
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-xl font-black text-[#1C1917] tracking-tight group-hover:text-[#6B1D2F] transition-colors">
                      {sign.name}
                    </h4>
                    <span className="text-xs font-mono font-bold text-[#8C6B28]">
                      {Math.round(sign.accuracy * 100)}% match
                    </span>
                  </div>

                  <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                    {sign.meaning}
                  </p>
                </div>

                {/* Hover Video Preview Hint Overlay */}
                <div className="p-3 bg-[#FAF7F2] group-hover:bg-[#F3ECE1] rounded-2xl border border-[#E4DACB] flex items-center justify-between text-xs transition-colors">
                  <div className="flex items-center space-x-2 text-[#57534E]">
                    <Video className="w-4 h-4 text-[#C5A059]" />
                    <span className="text-[11px] font-mono">{sign.sampleCount} frames recorded</span>
                  </div>
                  <button
                    onClick={(e) => handleManualPreviewClick(sign, e)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#6B1D2F] hover:bg-[#541524] text-[#FAF7F2] text-[11px] font-bold transition shadow-sm"
                  >
                    <Play className="w-3 h-3 text-[#C5A059]" />
                    <span>Preview Video</span>
                  </button>
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-[#E4DACB] flex items-center justify-between text-xs text-[#78716C]">
                  <span className="text-[10px] font-mono">
                    Updated {new Date(sign.recordedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleManualPreviewClick(sign, e);
                      }}
                      className="text-[#6B1D2F] hover:underline font-bold text-[11px]"
                    >
                      Verify
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(sign.id);
                      }}
                      className="text-[#78716C] hover:text-[#6B1D2F] transition p-1"
                      title="Delete recorded sign"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Preview Modal triggered on hover or preview click */}
      {activePreviewSign && (
        <SignVideoPreviewModal
          sign={activePreviewSign}
          isOpen={activePreviewSign !== null}
          onClose={() => setActivePreviewSign(null)}
          onVerify={handleVerify}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
