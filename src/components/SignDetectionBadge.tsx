/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PredictionResult, AppView } from '../types';
import { SIGN_DICTIONARY_MAP, SIGN_DEFINITIONS } from '../data/signs';
import { saveUserCorrection } from '../services/classifier';
import { 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  Sparkles, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  ThumbsUp, 
  ThumbsDown, 
  Save, 
  RotateCcw, 
  BookOpen, 
  PlusCircle, 
  Check, 
  Info 
} from 'lucide-react';

interface SignDetectionBadgeProps {
  prediction: PredictionResult | null;
  stabilityProgress: number; // 0 to 1.0 (ring progress toward committing sign)
  onNavigate?: (view: AppView) => void;
  onTeachSign?: (signName: string) => void;
}

export const SignDetectionBadge: React.FC<SignDetectionBadgeProps> = ({
  prediction,
  stabilityProgress,
  onNavigate,
  onTeachSign
}) => {
  const [showWhy, setShowWhy] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);
  const [selectedCorrection, setSelectedCorrection] = useState('');
  const [correctionSaved, setCorrectionSaved] = useState(false);

  // If no prediction or hand not present
  if (!prediction || !prediction.landmarks || prediction.landmarks.length < 21) {
    return (
      <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-3xl p-5 shadow-md flex flex-col justify-between text-[#1C1917]">
        <div className="flex items-center justify-between text-xs text-[#78716C] mb-2 font-mono">
          <span className="font-bold uppercase tracking-wider text-[11px] text-[#6B1D2F] flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Detection State</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E4DACB] text-[10px] text-[#78716C]">
            Awaiting Gesture
          </span>
        </div>

        <div className="flex items-center space-x-4 my-2">
          <div className="w-14 h-14 rounded-2xl bg-[#F3ECE1] border border-[#C5A059]/30 flex items-center justify-center text-[#6B1D2F]">
            <HelpCircle className="w-7 h-7 text-[#6B1D2F]" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#1C1917] tracking-tight">
              WAITING FOR SIGN
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5 leading-relaxed">
              Position your hand clearly inside the camera frame.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { state, sign, confidence, referenceSimilarity, handedness, whyBreakdown, rejectionReason } = prediction;
  const confidencePercent = Math.round(confidence * 100);
  const similarityPercent = Math.round((referenceSimilarity || 0) * 100);
  const signDef = SIGN_DICTIONARY_MAP.get(sign);

  const handleFeedbackYes = () => {
    setFeedbackGiven('yes');
    saveUserCorrection({
      predictedSign: sign,
      actualSign: sign,
      confidence,
      handedness
    });
  };

  const handleFeedbackNo = () => {
    setFeedbackGiven('no');
  };

  const handleSaveCorrection = () => {
    if (!selectedCorrection) return;
    saveUserCorrection({
      predictedSign: sign,
      actualSign: selectedCorrection,
      confidence,
      handedness
    });
    setCorrectionSaved(true);
    setTimeout(() => {
      setFeedbackGiven(null);
      setCorrectionSaved(false);
      setSelectedCorrection('');
    }, 2000);
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl p-5 shadow-lg border-2 transition text-[#1C1917] ${
      state === 'CONFIDENT'
        ? 'bg-[#FFFFFF] border-[#16A34A]/50 shadow-[#16A34A]/5'
        : state === 'UNCERTAIN'
        ? 'bg-[#FFFFFF] border-[#C5A059] shadow-[#C5A059]/10'
        : 'bg-[#FFFFFF] border-[#6B1D2F]/40 shadow-[#6B1D2F]/5'
    }`}>
      {/* Header Info with 3-State Badge */}
      <div className="flex items-center justify-between text-xs mb-3">
        <div className="flex items-center space-x-2">
          {state === 'CONFIDENT' && (
            <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30 text-[10px] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>🟢 CONFIDENT</span>
            </span>
          )}
          {state === 'UNCERTAIN' && (
            <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#C5A059]/20 text-[#8C6B28] border border-[#C5A059]/50 text-[10px] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
              <span>🟡 UNCERTAIN</span>
            </span>
          )}
          {state === 'UNKNOWN' && (
            <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#6B1D2F]/10 text-[#6B1D2F] border border-[#6B1D2F]/30 text-[10px] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-[#6B1D2F]" />
              <span>🔴 SIGN NOT RECOGNIZED</span>
            </span>
          )}

          <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E4DACB] text-[10px] font-mono text-[#57534E]">
            Hand: <strong>{handedness.toUpperCase()}</strong>
          </span>
        </div>

        {/* Reference similarity badge */}
        {similarityPercent > 0 && state !== 'UNKNOWN' && (
          <span className="text-[11px] font-mono font-bold text-[#8C6B28]">
            Ref Match: <strong>{similarityPercent}%</strong>
          </span>
        )}
      </div>

      {/* Main Sign Display */}
      {state === 'CONFIDENT' && (
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            {/* Stability Ring */}
            <div className="relative flex-shrink-0">
              <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" className="text-[#E4DACB]" fill="transparent" />
                <circle
                  cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4"
                  strokeDasharray={125.6}
                  strokeDashoffset={125.6 * (1 - stabilityProgress)}
                  strokeLinecap="round"
                  className="text-[#6B1D2F] transition-all duration-100"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-black text-[#6B1D2F] text-xs">
                {stabilityProgress >= 1.0 ? <CheckCircle2 className="w-6 h-6 text-[#16A34A]" /> : `${Math.round(stabilityProgress * 100)}%`}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight truncate">
                  {sign}
                </h3>
                <span className="text-xs font-mono font-bold text-[#16A34A]">
                  {confidencePercent}%
                </span>
              </div>
              <p className="text-xs text-[#57534E] truncate mt-0.5">
                {signDef?.meaning || signDef?.description || 'Active gesture detected'}
              </p>
            </div>
          </div>
        </div>
      )}

      {state === 'UNCERTAIN' && (
        <div className="space-y-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F3ECE1] border border-[#C5A059]/40 flex items-center justify-center text-[#8C6B28]">
              <AlertTriangle className="w-6 h-6 text-[#8C6B28]" />
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-lg font-black text-[#1C1917]">
                  Possible: {sign}
                </h3>
                <span className="text-xs font-mono font-bold text-[#8C6B28]">
                  {confidencePercent}%
                </span>
              </div>
              <p className="text-xs text-[#57534E] mt-0.5">
                {prediction.feedbackMessage || 'Hold the sign steady or try again.'}
              </p>
            </div>
          </div>

          {/* Similar candidate options */}
          {prediction.topCandidates.length > 1 && (
            <div className="pt-2 border-t border-[#E4DACB] flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
              <span className="text-[#78716C]">Top candidates:</span>
              {prediction.topCandidates.slice(0, 3).map((c, i) => (
                <span key={c.sign} className="px-2 py-0.5 rounded-lg bg-[#FAF7F2] border border-[#E4DACB] font-bold text-[#1C1917]">
                  {i + 1}. {c.sign} ({Math.round(c.score * 100)}%)
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {state === 'UNKNOWN' && (
        <div className="space-y-3">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#6B1D2F]/10 border border-[#6B1D2F]/30 flex items-center justify-center text-[#6B1D2F] flex-shrink-0">
              <HelpCircle className="w-6 h-6 text-[#6B1D2F]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1C1917]">
                Sign Not Recognized
              </h3>
              <p className="text-xs text-[#57534E] mt-0.5 leading-relaxed">
                {rejectionReason || 'This gesture does not sufficiently match the supported sign vocabulary.'}
              </p>
            </div>
          </div>

          {/* Wrong-Pose Protection Action Buttons (Requirement 10) */}
          <div className="pt-2 border-t border-[#E4DACB] flex items-center flex-wrap gap-2 text-xs">
            {onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('identify')}
                  className="px-3 py-1.5 rounded-xl bg-[#6B1D2F] text-[#FAF7F2] font-bold hover:bg-[#541524] transition text-xs flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3 text-[#C5A059]" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={() => onNavigate('identify')}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] text-[#1C1917] border border-[#E4DACB] hover:bg-[#F3ECE1] font-bold transition text-xs flex items-center space-x-1"
                >
                  <BookOpen className="w-3 h-3 text-[#8C6B28]" />
                  <span>View Supported Signs</span>
                </button>
                <button
                  onClick={() => onNavigate('mysigns')}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] text-[#6B1D2F] border border-[#6B1D2F]/30 hover:bg-[#6B1D2F]/10 font-bold transition text-xs flex items-center space-x-1"
                >
                  <PlusCircle className="w-3 h-3 text-[#C5A059]" />
                  <span>Teach SIGNSYNC</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Explainable Result: "Why?" Section (Requirement 9) */}
      {whyBreakdown && state !== 'UNKNOWN' && (
        <div className="mt-3 pt-3 border-t border-[#E4DACB]">
          <button
            onClick={() => setShowWhy(!showWhy)}
            className="w-full flex items-center justify-between text-xs font-mono font-bold text-[#6B1D2F] hover:underline"
          >
            <span className="flex items-center space-x-1">
              <Info className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Explainable AI: Why this interpretation?</span>
            </span>
            {showWhy ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showWhy && (
            <div className="mt-2.5 p-3 rounded-2xl bg-[#FAF7F2] border border-[#E4DACB] space-y-1.5 text-xs text-[#57534E] font-mono animate-in fade-in">
              <div className="flex items-center space-x-2">
                <span className={whyBreakdown.fingerConfigMatched ? 'text-[#16A34A] font-bold' : 'text-[#DC2626]'}>
                  {whyBreakdown.fingerConfigMatched ? '✓' : '✗'}
                </span>
                <span>Finger configuration matched</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={whyBreakdown.palmOrientationMatched ? 'text-[#16A34A] font-bold' : 'text-[#DC2626]'}>
                  {whyBreakdown.palmOrientationMatched ? '✓' : '✗'}
                </span>
                <span>Palm orientation matched</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={whyBreakdown.handPositionMatched ? 'text-[#16A34A] font-bold' : 'text-[#DC2626]'}>
                  {whyBreakdown.handPositionMatched ? '✓' : '✗'}
                </span>
                <span>Hand position &amp; distance in range</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={whyBreakdown.temporalPatternMatched ? 'text-[#16A34A] font-bold' : 'text-[#DC2626]'}>
                  {whyBreakdown.temporalPatternMatched ? '✓' : '✗'}
                </span>
                <span>Temporal movement pattern matched</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={whyBreakdown.stableAcrossFrames ? 'text-[#16A34A] font-bold' : 'text-[#DC2626]'}>
                  {whyBreakdown.stableAcrossFrames ? '✓' : '✗'}
                </span>
                <span>Prediction stable across consecutive frames</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Feedback Loop (Requirement 15) */}
      {state === 'CONFIDENT' && (
        <div className="mt-3 pt-3 border-t border-[#E4DACB] flex flex-col gap-2">
          {feedbackGiven === null ? (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#57534E] font-bold text-[11px]">Was this prediction correct?</span>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleFeedbackYes}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30 text-xs font-bold transition flex items-center space-x-1"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>YES</span>
                </button>
                <button
                  onClick={handleFeedbackNo}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#6B1D2F]/10 text-[#6B1D2F] border border-[#6B1D2F]/30 text-xs font-bold transition flex items-center space-x-1"
                >
                  <ThumbsDown className="w-3 h-3" />
                  <span>NO</span>
                </button>
              </div>
            </div>
          ) : feedbackGiven === 'yes' ? (
            <div className="flex items-center space-x-1.5 text-xs text-[#16A34A] font-bold">
              <Check className="w-3.5 h-3.5" />
              <span>Thank you! Feedback recorded for model tuning.</span>
            </div>
          ) : (
            <div className="space-y-2 text-xs bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E4DACB]">
              <span className="font-bold text-[#6B1D2F] block">
                AI predicted: <strong>{sign}</strong>. What was the correct sign?
              </span>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedCorrection}
                  onChange={(e) => setSelectedCorrection(e.target.value)}
                  className="flex-1 px-2.5 py-1 rounded-lg bg-[#FFFFFF] border border-[#E4DACB] text-xs font-bold text-[#1C1917] outline-none"
                >
                  <option value="">-- Select Correct Sign --</option>
                  {SIGN_DEFINITIONS.filter(s => s.id !== sign).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>
                <button
                  onClick={handleSaveCorrection}
                  disabled={!selectedCorrection}
                  className="px-3 py-1 rounded-lg bg-[#6B1D2F] text-[#FAF7F2] font-bold text-xs hover:bg-[#541524] disabled:opacity-40 transition flex items-center space-x-1"
                >
                  <Save className="w-3 h-3" />
                  <span>{correctionSaved ? 'Saved!' : 'Save Correction'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
