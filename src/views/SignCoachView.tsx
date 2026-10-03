/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { CameraView } from '../components/CameraView';
import { 
  PredictionResult, 
  AppSettings, 
  CoachEvaluation 
} from '../types';
import { SIGN_DEFINITIONS, SIGN_DICTIONARY_MAP } from '../data/signs';
import { evaluateCoachSign } from '../services/classifier';
import { 
  GraduationCap, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  ArrowRight, 
  Sparkles, 
  Award, 
  BookOpen, 
  Info,
  HelpCircle
} from 'lucide-react';

interface SignCoachViewProps {
  onPrediction: (result: PredictionResult) => void;
  latestPrediction: PredictionResult | null;
  settings: AppSettings;
}

export const SignCoachView: React.FC<SignCoachViewProps> = ({
  onPrediction,
  latestPrediction,
  settings
}) => {
  const [targetSignId, setTargetSignId] = useState<string>('HELP');
  const [evaluation, setEvaluation] = useState<CoachEvaluation>({
    similarity: 0,
    handPositionCheck: false,
    movementCheck: false,
    orientationCheck: false,
    fingerCurlsCheck: false,
    tips: ['Position your hand in the center of the camera view.'],
    isSuccess: false
  });

  const [hasCelebrated, setHasCelebrated] = useState(false);
  const successStreakRef = useRef<number>(0);

  const currentSignDef = SIGN_DICTIONARY_MAP.get(targetSignId) || SIGN_DEFINITIONS[0];

  // Evaluate live hand pose against target sign
  useEffect(() => {
    if (latestPrediction && latestPrediction.landmarks && latestPrediction.landmarks.length >= 21) {
      const evalResult = evaluateCoachSign(
        targetSignId,
        latestPrediction.landmarks,
        latestPrediction.handedness
      );
      setEvaluation(evalResult);

      if (evalResult.isSuccess) {
        successStreakRef.current++;
        if (successStreakRef.current >= 5 && !hasCelebrated) {
          triggerSuccessConfetti();
          setHasCelebrated(true);
        }
      } else {
        successStreakRef.current = 0;
      }
    } else {
      setEvaluation(prev => {
        if (prev.similarity === 0 && !prev.isSuccess && prev.tips[0] === 'Bring your hand clearly into the camera frame.') {
          return prev;
        }
        return {
          similarity: 0,
          handPositionCheck: false,
          movementCheck: false,
          orientationCheck: false,
          fingerCurlsCheck: false,
          tips: ['Bring your hand clearly into the camera frame.'],
          isSuccess: false
        };
      });
    }
  }, [latestPrediction, targetSignId, hasCelebrated]);

  const triggerSuccessConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Fallback
    }
  };

  const handleNextSign = () => {
    const currentIndex = SIGN_DEFINITIONS.findIndex(s => s.id === targetSignId);
    const nextIndex = (currentIndex + 1) % SIGN_DEFINITIONS.length;
    setTargetSignId(SIGN_DEFINITIONS[nextIndex].id);
    setHasCelebrated(false);
    successStreakRef.current = 0;
  };

  const handleTryAgain = () => {
    setHasCelebrated(false);
    successStreakRef.current = 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
              <span>Interactive Sign Coach</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                Real-Time Biofeedback
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Practice individual ASL gestures with landmark angle verification
            </p>
          </div>
        </div>

        {/* Target Sign Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase text-slate-400">Target Sign:</span>
          <select
            value={targetSignId}
            onChange={(e) => {
              setTargetSignId(e.target.value);
              setHasCelebrated(false);
            }}
            className="bg-slate-900 border border-indigo-700/80 text-indigo-300 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            {SIGN_DEFINITIONS.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera View */}
        <div className="lg:col-span-7 space-y-4">
          <CameraView
            onPrediction={onPrediction}
            settings={settings}
            activeSignHint={targetSignId}
            isCoachingMode={true}
          />

          {/* Reference Hand Posture Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>How to Form: {currentSignDef.name}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Difficulty: {currentSignDef.difficulty}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {currentSignDef.instructions}
            </p>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs">
              <span className="font-semibold text-slate-400 block mb-1">Handshape Configuration:</span>
              <p className="text-slate-300 italic">{currentSignDef.handPostureDescription}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Similarity Gauge & Verification Checklist */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Main Similarity Meter Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 border border-indigo-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Target: {targetSignId}</span>
              </span>

              {evaluation.isSuccess ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-600 text-emerald-300 text-xs font-black flex items-center space-x-1 animate-bounce">
                  <Award className="w-3.5 h-3.5" />
                  <span>MASTERED!</span>
                </span>
              ) : (
                <span className="text-xs font-mono text-slate-400">
                  Target &ge; 82%
                </span>
              )}
            </div>

            {/* Huge Circular Gauge */}
            <div className="flex flex-col items-center justify-center my-3">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - evaluation.similarity / 100)}
                    strokeLinecap="round"
                    className={`transition-all duration-200 ${
                      evaluation.similarity >= 82
                        ? 'text-emerald-400'
                        : evaluation.similarity >= 55
                        ? 'text-cyan-400'
                        : 'text-amber-400'
                    }`}
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white tracking-tight">
                    {evaluation.similarity}%
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                    Similarity
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center space-x-2">
              <button
                onClick={handleTryAgain}
                className="flex-1 flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700/60"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>TRY AGAIN</span>
              </button>
              <button
                onClick={handleNextSign}
                className="flex-1 flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/25"
              >
                <span>NEXT SIGN</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Verification Checklist (Exact MVP spec: Hand position, Movement, Orientation) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Biomechanical Pose Checklist:
            </span>

            <div className="space-y-2 text-xs">
              {/* 1. Hand Position */}
              <div className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                evaluation.handPositionCheck
                  ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400'
              }`}>
                <span className="font-semibold">Hand Position in View</span>
                {evaluation.handPositionCheck ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </div>

              {/* 2. Finger Curls & Shape */}
              <div className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                evaluation.fingerCurlsCheck
                  ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400'
              }`}>
                <span className="font-semibold">Finger Shape & Extension</span>
                {evaluation.fingerCurlsCheck ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </div>

              {/* 3. Orientation */}
              <div className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                evaluation.orientationCheck
                  ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400'
              }`}>
                <span className="font-semibold">Palm & Wrist Orientation</span>
                {evaluation.orientationCheck ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </div>

              {/* 4. Movement */}
              <div className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                evaluation.movementCheck
                  ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400'
              }`}>
                <span className="font-semibold">Movement & Motion</span>
                {evaluation.movementCheck ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </div>
            </div>
          </div>

          {/* Real-time Dynamic Coaching Tips */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Coach Feedback & Tips</span>
            </span>

            <div className="space-y-1.5">
              {evaluation.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300 leading-snug">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
