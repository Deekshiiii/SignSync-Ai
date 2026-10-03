/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExplainableAIResult } from '../types';
import { X, CheckCircle2, ShieldCheck, Sparkles, HelpCircle, Layers, Cpu } from 'lucide-react';

interface ExplainableAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ExplainableAIResult | null;
}

export const ExplainableAIModal: React.FC<ExplainableAIModalProps> = ({
  isOpen,
  onClose,
  result
}) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF7F2] border-2 border-[#E4DACB] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-[#1C1917]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#C5A059]/30 bg-[#6B1D2F] text-[#FAF7F2]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-[#541524] text-[#C5A059] border border-[#C5A059]/40 shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#FAF7F2]">Why This Interpretation?</h3>
              <p className="text-xs text-[#FAF7F2]/80">Explainable AI Perception Breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#FAF7F2]/70 hover:text-white hover:bg-[#541524] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Sign & Confidence */}
          <div className="p-4 rounded-2xl bg-[#F3ECE1] border border-[#C5A059]/50 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#78716C] font-bold block">
                Primary Recognized Sign
              </span>
              <span className="text-2xl font-black text-[#6B1D2F]">{result.sign}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-[#78716C] font-bold block">
                Perception Match
              </span>
              <span className="text-2xl font-mono font-black text-[#8C6B28]">
                {Math.round(result.confidence * 100)}%
              </span>
            </div>
          </div>

          {/* Biomechanical match criteria */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B1D2F] block">
              Multi-Layer Perception Verification:
            </span>

            <div className="p-3 rounded-2xl bg-[#FFFFFF] border border-[#E4DACB] flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#1C1917]">Hand Shape &amp; Joint Angles</span>
                <p className="text-[#57534E] text-[11px] mt-0.5">{result.handShapeMatch}</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFFFFF] border border-[#E4DACB] flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#1C1917]">Palm &amp; Body Normal Orientation</span>
                <p className="text-[#57534E] text-[11px] mt-0.5">{result.orientationMatch}</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFFFFF] border border-[#E4DACB] flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#1C1917]">Kinematic Trajectory Pattern</span>
                <p className="text-[#57534E] text-[11px] mt-0.5">{result.movementPatternMatch}</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFFFFF] border border-[#E4DACB] flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#1C1917]">Context AI Intent Validation</span>
                <p className="text-[#57534E] text-[11px] mt-0.5">{result.contextSupport}</p>
              </div>
            </div>
          </div>

          {/* Alternate Candidates */}
          <div className="pt-1">
            <span className="text-[10px] uppercase font-mono text-[#78716C] font-bold block mb-1.5">
              Alternative Gestures Evaluated:
            </span>
            <div className="flex gap-2">
              {result.possibleAlternates.map(alt => (
                <div key={alt.sign} className="flex-1 p-2 rounded-xl bg-[#FFFFFF] border border-[#E4DACB] text-center">
                  <span className="text-xs font-bold text-[#1C1917] block">{alt.sign}</span>
                  <span className="text-[10px] font-mono text-[#8C6B28] font-bold">
                    {Math.round(alt.probability * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E4DACB] bg-[#F7F2EB] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#6B1D2F] hover:bg-[#541524] text-[#FAF7F2] font-black text-xs transition shadow-sm"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
