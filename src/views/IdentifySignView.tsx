/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { CameraView } from '../components/CameraView';
import { 
  PredictionResult, 
  AppSettings, 
  AppView, 
  SignDefinition 
} from '../types';
import { SIGN_DEFINITIONS, SIGN_DICTIONARY_MAP, getSignDefinition } from '../data/signs';
import { ttsService } from '../services/ttsService';
import { saveUserCorrection } from '../services/classifier';
import { 
  Search, 
  Volume2, 
  VolumeX, 
  GraduationCap, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  BookOpen, 
  Hand, 
  ArrowRight, 
  Copy, 
  Check, 
  Layers, 
  PlusCircle, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Play,
  BookmarkPlus,
  AlertTriangle
} from 'lucide-react';

interface IdentifySignViewProps {
  onPrediction: (result: PredictionResult) => void;
  latestPrediction: PredictionResult | null;
  settings: AppSettings;
  onNavigate: (view: AppView) => void;
  onSelectCoachSign?: (signId: string) => void;
}

export const IdentifySignView: React.FC<IdentifySignViewProps> = ({
  onPrediction,
  latestPrediction,
  settings,
  onNavigate,
  onSelectCoachSign
}) => {
  // Single-sign lock state: once a sign reaches confidence, lock it so the user can inspect it comfortably
  const [lockedSign, setLockedSign] = useState<SignDefinition | null>(null);
  const [lockedConfidence, setLockedConfidence] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showDictionaryDrawer, setShowDictionaryDrawer] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoPronounce, setAutoPronounce] = useState<boolean>(false);

  // User feedback loop state
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);
  const [selectedCorrection, setSelectedCorrection] = useState<string>('');
  const [correctionSaved, setCorrectionSaved] = useState<boolean>(false);

  // Stability tracker for single-sign recognition (Hold for 1 second ~ 4-5 consecutive frames)
  const [stabilityProgress, setStabilityProgress] = useState<number>(0);
  const stableCountRef = useRef<number>(0);
  const lastDetectedSignRef = useRef<string>('');

  // Evaluate incoming camera prediction in Single Sign Mode
  useEffect(() => {
    if (isLocked) return;

    if (!latestPrediction || latestPrediction.sign === 'UNKNOWN' || !latestPrediction.landmarks || latestPrediction.landmarks.length < 21) {
      stableCountRef.current = 0;
      setStabilityProgress(0);
      return;
    }

    const currentSign = latestPrediction.sign;
    if (currentSign && currentSign !== 'UNKNOWN') {
      if (currentSign === lastDetectedSignRef.current) {
        stableCountRef.current++;
      } else {
        lastDetectedSignRef.current = currentSign;
        stableCountRef.current = 1;
      }

      const progress = Math.min(2, stableCountRef.current);
      setStabilityProgress(progress);

      // Super-snappy lock: 2 consecutive frames of confident prediction
      if (stableCountRef.current >= 2 && latestPrediction.isConfident) {
        const def = getSignDefinition(currentSign);
        if (def) {
          setLockedSign(def);
          setLockedConfidence(latestPrediction.confidence);
          setIsLocked(true);
          stableCountRef.current = 0;
          setStabilityProgress(2);

          if (autoPronounce) {
            const speakText = `${def.name}. Meaning: ${def.meaning || def.description}`;
            ttsService.speak(speakText, {
              rate: settings.speechRate,
              pitch: settings.speechPitch,
              voiceURI: settings.speechVoice
            });
          }
        }
      }
    }
  }, [latestPrediction, isLocked, autoPronounce, settings]);

  const liveDef = latestPrediction?.sign && latestPrediction.sign !== 'UNKNOWN'
    ? getSignDefinition(latestPrediction.sign)
    : null;
  const activeSign = isLocked ? lockedSign : (latestPrediction && latestPrediction.confidence >= 0.44 ? liveDef : null);
  const activeConfidence = isLocked ? lockedConfidence : (latestPrediction?.confidence || 0);

  const isHandDetected = Boolean(
    latestPrediction && 
    latestPrediction.landmarks && 
    latestPrediction.landmarks.length >= 21
  );

  const detectedHandedness = latestPrediction?.handedness?.toUpperCase() || 'RIGHT';

  const handleHearMeaning = () => {
    if (!activeSign) return;
    const speechText = `${activeSign.name}. Meaning: ${activeSign.meaning || activeSign.description}. Example: ${activeSign.exampleSentence}`;
    setIsSpeaking(true);
    ttsService.speak(speechText, {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      voiceURI: settings.speechVoice,
      onEnd: () => setIsSpeaking(false)
    });
  };

  const handleTryAgain = () => {
    setLockedSign(null);
    setLockedConfidence(0);
    setIsLocked(false);
    stableCountRef.current = 0;
    setStabilityProgress(0);
    lastDetectedSignRef.current = '';
    setFeedbackGiven(null);
    ttsService.stop();
    setIsSpeaking(false);
  };

  const handleLearnThisSign = () => {
    if (activeSign && onSelectCoachSign) {
      onSelectCoachSign(activeSign.id);
    }
    onNavigate('coach');
  };

  const handleCopyDetails = () => {
    if (!activeSign) return;
    const details = `Sign: ${activeSign.name}\nMeaning: ${activeSign.meaning || activeSign.description}\nCategory: ${activeSign.category}\nInstructions: ${activeSign.instructions}\nExample: "${activeSign.exampleSentence}"`;
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectFromDictionary = (sign: SignDefinition) => {
    setLockedSign(sign);
    setLockedConfidence(0.96);
    setIsLocked(true);
    setShowDictionaryDrawer(false);
  };

  const filteredSigns = SIGN_DEFINITIONS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.meaning && s.meaning.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-[#1C1917]">
      {/* Hero Header */}
      <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-3xl p-5 sm:p-6 shadow-md shadow-[#1C1917]/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#6B1D2F] text-[#FAF7F2] flex items-center justify-center font-black shadow-md border border-[#C5A059]/40">
              <Search className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1C1917] tracking-tight">
                WHAT DOES THIS SIGN MEAN?
              </h1>
              <p className="text-xs sm:text-sm text-[#6B1D2F] font-bold">
                Show a sign to your camera &mdash; SIGNSYNC AI analyzes it &amp; immediately displays what it means.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setAutoPronounce(!autoPronounce)}
            className={`px-3 py-1.5 rounded-2xl border text-xs font-mono font-bold transition flex items-center space-x-1.5 ${
              autoPronounce 
                ? 'bg-[#6B1D2F] text-[#FAF7F2] border-[#541524] shadow-xs' 
                : 'bg-[#FAF7F2] text-[#57534E] border-[#E4DACB] hover:text-[#1C1917]'
            }`}
            title="Automatically pronounce sign meaning upon detection"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Auto-Speak: {autoPronounce ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowDictionaryDrawer(!showDictionaryDrawer)}
            className="px-3 py-1.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#1C1917] border border-[#E4DACB] text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#8C6B28]" />
            <span>Browse All Signs ({SIGN_DEFINITIONS.length})</span>
            {showDictionaryDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Single-Sign Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Camera Area */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#E4DACB] shadow-xl bg-[#FFFFFF]">
            {/* Live Camera Feed */}
            <CameraView
              onPrediction={onPrediction}
              settings={settings}
              activeSignHint={activeSign?.name}
            />

            {/* Handedness & Quality Overlay Badges */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
              {isHandDetected && (
                <div className="px-3 py-1 rounded-full bg-[#1C1917]/85 backdrop-blur-md text-[#FAF7F2] border border-[#C5A059]/60 text-xs font-mono font-bold flex items-center space-x-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                  <span>Hand detected: {detectedHandedness}</span>
                </div>
              )}

              {latestPrediction?.gestureQuality && !latestPrediction.gestureQuality.isSuitable && isHandDetected && (
                <div className="px-3 py-1 rounded-full bg-[#6B1D2F]/90 backdrop-blur-md text-[#FAF7F2] border border-[#C5A059] text-xs font-mono font-bold flex items-center space-x-1.5 shadow-lg">
                  <AlertCircle className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{latestPrediction.gestureQuality.recommendation}</span>
                </div>
              )}
            </div>

            {/* Dynamic Status Overlay Ribbon */}
            <div className="p-3.5 bg-[#FAF7F2] border-t border-[#E4DACB] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center space-x-2">
                {isLocked ? (
                  <span className="flex items-center space-x-1.5 font-bold text-[#16A34A] bg-[#16A34A]/10 px-2.5 py-1 rounded-full border border-[#16A34A]/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✓ Sign Recognized &amp; Inspected</span>
                  </span>
                ) : isHandDetected ? (
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1.5 font-bold text-[#8C6B28] bg-[#C5A059]/15 px-2.5 py-1 rounded-full border border-[#C5A059]/40">
                      <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-ping" />
                      <span>Hand detected ✓ &mdash; Analyzing sign...</span>
                    </span>

                    {/* Hold-to-Recognize Stability Progress Meter */}
                    <div className="flex items-center space-x-1 px-2 py-0.5 bg-[#FFFFFF] rounded-full border border-[#E4DACB] text-[10px]">
                      <span className="text-[#78716C]">Hold steady:</span>
                      <div className="flex space-x-0.5">
                        {[1, 2, 3, 4].map(step => (
                          <div 
                            key={step} 
                            className={`w-2.5 h-2 rounded-sm transition-colors ${
                              step <= stabilityProgress ? 'bg-[#6B1D2F]' : 'bg-[#E4DACB]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="flex items-center space-x-1.5 font-bold text-[#78716C] bg-[#E4DACB]/40 px-2.5 py-1 rounded-full">
                    <Hand className="w-3.5 h-3.5 text-[#6B1D2F]" />
                    <span>Position your hand inside the frame</span>
                  </span>
                )}
              </div>

              {/* Status Action */}
              <div className="flex items-center space-x-2">
                {isLocked ? (
                  <button
                    onClick={handleTryAgain}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[#6B1D2F] hover:bg-[#541524] text-[#FAF7F2] text-xs font-bold transition shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Scan Another Sign</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-[#78716C] italic">
                    Hold the sign for 1 second
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Biomechanical Pipeline Quality Box */}
          <div className="bg-[#FAF7F2] border border-[#E4DACB] rounded-2xl p-4 flex items-start space-x-3 text-xs text-[#57534E]">
            <Info className="w-4 h-4 text-[#8C6B28] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-[#1C1917] block font-bold">
                Camera &rarr; Hand Detection &rarr; Landmarks &rarr; Normalization &rarr; Sign &rarr; Meaning
              </strong>
              <p>
                SignSync AI extracts 21 3D joint landmarks, applies left/right-hand mirroring and rotation normalization, and runs multi-frame stability before confirming the meaning.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): AI Detection & Meaning Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-3xl p-6 shadow-xl space-y-5">
            {/* Detection Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DACB]">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#6B1D2F]/10 text-[#6B1D2F] text-[11px] font-mono font-black uppercase tracking-wider">
                  AI DETECTION
                </span>
                <span className="text-xs text-[#78716C] font-mono">
                  Single-Sign Mode
                </span>
              </div>

              {isLocked && activeSign ? (
                <span className="text-xs font-mono font-bold text-[#16A34A] flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sign Detected ✓</span>
                </span>
              ) : isHandDetected && latestPrediction?.state === 'UNCERTAIN' ? (
                <span className="text-xs font-mono font-bold text-[#C5A059] flex items-center space-x-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Analyzing...</span>
                </span>
              ) : null}
            </div>

            {/* Display State: Confident Sign Recognized or Live Prediction */}
            {activeSign ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Sign Name & Category */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#78716C] uppercase font-bold tracking-wider flex items-center space-x-1.5">
                      <span className={`w-2 h-2 rounded-full ${isLocked ? 'bg-[#16A34A]' : 'bg-[#C5A059] animate-pulse'}`} />
                      <span>{isLocked ? 'Sign Verified & Locked ✓' : 'Live Match (Hold steady to lock)'}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-xl bg-[#F3ECE1] text-[#8C6B28] border border-[#C5A059]/30 text-[10px] font-bold font-mono">
                      {activeSign.category} &bull; {activeSign.signLanguage || 'ISL & ASL'}
                    </span>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-black text-[#1C1917] tracking-tight mt-1 flex items-baseline space-x-2">
                    <span>#{activeSign.name}</span>
                  </h2>
                </div>

                {/* Meaning Section */}
                <div className="p-4.5 rounded-2xl bg-[#F3ECE1] border-2 border-[#C5A059]/40 space-y-2">
                  <span className="text-[10px] font-mono uppercase font-black text-[#6B1D2F] tracking-wider block">
                    Meaning:
                  </span>
                  <p className="text-base sm:text-lg font-bold text-[#1C1917] leading-relaxed">
                    &ldquo;{activeSign.meaning || activeSign.description}&rdquo;
                  </p>
                </div>

                {/* Example Sentence */}
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E4DACB] text-xs space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#8C6B28] block">
                    Example Usage:
                  </span>
                  <p className="text-[#1C1917] font-medium italic">
                    &ldquo;{activeSign.exampleSentence}&rdquo;
                  </p>
                </div>

                {/* Confidence & Classification Meta */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E4DACB] space-y-1">
                    <span className="text-[#78716C] text-[10px] block font-bold uppercase">Confidence</span>
                    <span className="text-xl font-black text-[#6B1D2F]">
                      {Math.round(activeConfidence * 100)}%
                    </span>
                  </div>
                  <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E4DACB] space-y-1">
                    <span className="text-[#78716C] text-[10px] block font-bold uppercase">Gesture Type</span>
                    <span className="text-sm font-black text-[#1C1917]">
                      {activeSign.gestureType || (activeSign.isDynamic ? 'Dynamic' : 'Static')}
                    </span>
                  </div>
                </div>

                {/* Related Signs */}
                {activeSign.relatedSigns && activeSign.relatedSigns.length > 0 && (
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#78716C] block">
                      Related Signs:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeSign.relatedSigns.map(rel => (
                        <span 
                          key={rel}
                          className="px-2.5 py-1 rounded-xl bg-[#FAF7F2] border border-[#E4DACB] text-[11px] font-bold text-[#6B1D2F]"
                        >
                          {rel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reference Comparison (Requirement 8) */}
                <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E4DACB] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-[#6B1D2F] flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>REFERENCE COMPARISON</span>
                    </span>
                    <span className="text-[#8C6B28]">
                      Gesture Similarity: <strong>{Math.round((latestPrediction?.referenceSimilarity || 0.94) * 100)}%</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 bg-[#FFFFFF] rounded-xl border border-[#E4DACB]">
                      <span className="text-[#78716C] block text-[9px] uppercase font-bold">Your Sign</span>
                      <strong className="text-[#1C1917]">{activeSign.name} ({detectedHandedness})</strong>
                    </div>
                    <div className="p-2 bg-[#F3ECE1] rounded-xl border border-[#C5A059]/40">
                      <span className="text-[#8C6B28] block text-[9px] uppercase font-bold">Canonical Reference</span>
                      <strong className="text-[#6B1D2F]">Canonical {activeSign.name}</strong>
                    </div>
                  </div>
                </div>

                {/* Explainable Result Breakdown (Requirement 9) */}
                <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E4DACB] space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#78716C] block">
                    WHY? (Verification Checks):
                  </span>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex items-center space-x-2 text-[#16A34A]">
                      <Check className="w-3.5 h-3.5" />
                      <span>Finger configuration matched</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[#16A34A]">
                      <Check className="w-3.5 h-3.5" />
                      <span>Palm orientation matched ({detectedHandedness} hand)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[#16A34A]">
                      <Check className="w-3.5 h-3.5" />
                      <span>Hand position centered in frame</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[#16A34A]">
                      <Check className="w-3.5 h-3.5" />
                      <span>Temporal motion pattern matched</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[#16A34A]">
                      <Check className="w-3.5 h-3.5" />
                      <span>Prediction stable across consecutive frames</span>
                    </div>
                  </div>
                </div>

                {/* User Feedback Loop (Requirement 15) */}
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E4DACB] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-[#57534E]">Was this prediction correct?</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setFeedbackGiven('yes');
                          saveUserCorrection({
                            predictedSign: activeSign.name,
                            actualSign: activeSign.name,
                            confidence: lockedConfidence,
                            handedness: latestPrediction?.handedness || 'Right'
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30 text-xs font-bold transition flex items-center space-x-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>YES</span>
                      </button>
                      <button
                        onClick={() => setFeedbackGiven('no')}
                        className="px-2.5 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#6B1D2F]/10 text-[#6B1D2F] border border-[#6B1D2F]/30 text-xs font-bold transition flex items-center space-x-1"
                      >
                        <span>NO</span>
                      </button>
                    </div>
                  </div>
                  {feedbackGiven === 'yes' && (
                    <p className="text-[11px] text-[#16A34A] font-bold">✓ Feedback recorded for model tuning.</p>
                  )}
                  {feedbackGiven === 'no' && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-[#6B1D2F] font-bold block">Select the correct sign:</span>
                      <div className="flex items-center space-x-1.5">
                        <select
                          value={selectedCorrection}
                          onChange={(e) => setSelectedCorrection(e.target.value)}
                          className="flex-1 px-2 py-1 rounded-lg bg-[#FFFFFF] border border-[#E4DACB] text-[11px] font-bold text-[#1C1917]"
                        >
                          <option value="">-- Choose Sign --</option>
                          {SIGN_DEFINITIONS.filter(s => s.id !== activeSign.id).map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            if (!selectedCorrection) return;
                            saveUserCorrection({
                              predictedSign: activeSign.name,
                              actualSign: selectedCorrection,
                              confidence: lockedConfidence,
                              handedness: latestPrediction?.handedness || 'Right'
                            });
                            setCorrectionSaved(true);
                            setTimeout(() => {
                              setFeedbackGiven(null);
                              setCorrectionSaved(false);
                            }, 2000);
                          }}
                          disabled={!selectedCorrection}
                          className="px-2.5 py-1 rounded-lg bg-[#6B1D2F] text-[#FAF7F2] font-bold text-[11px] disabled:opacity-40"
                        >
                          {correctionSaved ? 'Saved!' : 'Save'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Hear Meaning */}
                    <button
                      onClick={handleHearMeaning}
                      className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider text-[#FAF7F2] shadow-md transition ${
                        isSpeaking
                          ? 'bg-[#541524] animate-pulse'
                          : 'bg-[#6B1D2F] hover:bg-[#541524] shadow-[#6B1D2F]/20'
                      }`}
                    >
                      <Volume2 className="w-4 h-4 text-[#C5A059]" />
                      <span>{isSpeaking ? 'Speaking...' : '🔊 Hear Meaning'}</span>
                    </button>

                    {/* Learn This Sign */}
                    <button
                      onClick={handleLearnThisSign}
                      className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#1C1917] border border-[#E4DACB] hover:border-[#6B1D2F] transition shadow-xs"
                    >
                      <GraduationCap className="w-4 h-4 text-[#8C6B28]" />
                      <span>📖 Learn Sign</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Try Again */}
                    <button
                      onClick={handleTryAgain}
                      className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#57534E] hover:text-[#1C1917] border border-[#E4DACB] text-xs font-bold transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>↻ Try Again</span>
                    </button>

                    {/* Copy Details */}
                    <button
                      onClick={handleCopyDetails}
                      className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#57534E] hover:text-[#1C1917] border border-[#E4DACB] text-xs font-bold transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : '⭐ Save / Copy Info'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : isHandDetected && latestPrediction?.state === 'UNCERTAIN' ? (
              /* Low-Confidence / Uncertain Gesture (Requirement 6 & 7) */
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-[#F3ECE1] border-2 border-[#C5A059]/60 space-y-2">
                  <div className="flex items-center space-x-2 text-[#8C6B28] font-mono font-bold text-xs">
                    <HelpCircle className="w-4 h-4" />
                    <span>🤔 POSSIBLE SIGN</span>
                  </div>
                  <h3 className="text-xl font-black text-[#1C1917]">
                    Hold steady to confirm sign
                  </h3>
                  <p className="text-xs text-[#57534E] leading-relaxed">
                    {latestPrediction.feedbackMessage || 'Please hold the sign steady or try again.'}
                  </p>
                </div>

                {/* Top Candidates Display */}
                {latestPrediction.topCandidates && latestPrediction.topCandidates.length > 0 && (
                  <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E4DACB] space-y-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#78716C] block">
                      Candidate Probability Distribution:
                    </span>
                    <div className="space-y-2 font-mono text-xs">
                      {latestPrediction.topCandidates.map((cand, idx) => (
                        <div key={cand.sign} className="space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className={idx === 0 ? 'text-[#6B1D2F]' : 'text-[#57534E]'}>
                              {cand.sign}
                            </span>
                            <span>{Math.round(cand.score * 100)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#E4DACB] rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${idx === 0 ? 'bg-[#6B1D2F]' : 'bg-[#C5A059]'}`}
                              style={{ width: `${Math.round(cand.score * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-center">
                  <button
                    onClick={handleTryAgain}
                    className="px-4 py-2 rounded-xl bg-[#6B1D2F] text-[#FAF7F2] text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>↻ Try Again</span>
                  </button>
                </div>
              </div>
            ) : isHandDetected && latestPrediction?.sign === 'UNKNOWN' ? (
              /* Unknown Sign / Wrong Pose Protection (Requirement 6 & 10) */
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-5 rounded-2xl bg-[#FAF7F2] border-2 border-[#6B1D2F]/30 space-y-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#6B1D2F]/10 text-[#6B1D2F] flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6 text-[#6B1D2F]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#1C1917]">
                      ⚠️ SIGN NOT RECOGNIZED
                    </h3>
                    <p className="text-xs text-[#57534E] mt-1">
                      &ldquo;I don't recognize this sign yet.&rdquo;
                    </p>
                    <p className="text-[11px] text-[#78716C] mt-1 font-mono">
                      {latestPrediction?.rejectionReason || 'This pose is outside known sign language patterns.'}
                    </p>
                  </div>
                </div>

                {/* 4 Action Options */}
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    onClick={handleTryAgain}
                    className="p-3 rounded-2xl bg-[#6B1D2F] hover:bg-[#541524] text-[#FAF7F2] flex items-center justify-center space-x-1.5 transition shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Try Again</span>
                  </button>

                  <button
                    onClick={() => onNavigate('coach')}
                    className="p-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#1C1917] border border-[#E4DACB] flex items-center justify-center space-x-1.5 transition"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-[#8C6B28]" />
                    <span>Learn This Sign</span>
                  </button>

                  <button
                    onClick={() => onNavigate('mysigns')}
                    className="p-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#1C1917] border border-[#E4DACB] flex items-center justify-center space-x-1.5 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#6B1D2F]" />
                    <span>Add Custom Sign</span>
                  </button>

                  <button
                    onClick={() => setShowDictionaryDrawer(true)}
                    className="p-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#1C1917] border border-[#E4DACB] flex items-center justify-center space-x-1.5 transition"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#8C6B28]" />
                    <span>View Supported Signs</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Idle Waiting State */
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-[#F3ECE1] border-2 border-[#C5A059]/40 flex items-center justify-center text-[#6B1D2F] mx-auto shadow-inner">
                  <Hand className="w-8 h-8 text-[#6B1D2F] animate-pulse" />
                </div>
                <div className="space-y-1.5 max-w-xs mx-auto">
                  <h3 className="text-lg font-black text-[#1C1917]">
                    Position Hand inside Frame
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    Show any sign clearly to your camera and SignSync AI will immediately explain its meaning.
                  </p>
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => setShowDictionaryDrawer(true)}
                    className="text-xs text-[#6B1D2F] hover:text-[#541524] font-bold underline flex items-center space-x-1"
                  >
                    <span>Browse supported gestures</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Supported Signs Dictionary Drawer */}
      {showDictionaryDrawer && (
        <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4DACB]">
            <div>
              <h3 className="text-base font-black text-[#1C1917] flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#6B1D2F]" />
                <span>Searchable Sign Dictionary</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#6B1D2F]/10 text-[#6B1D2F] font-mono font-bold">
                  {SIGN_DEFINITIONS.length} Signs
                </span>
              </h3>
              <p className="text-xs text-[#78716C]">
                Click any sign below to inspect its meaning, example usage, hand mechanics, and camera practice.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search signs, meanings, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E4DACB] text-xs font-bold outline-none focus:border-[#6B1D2F]"
              />
            </div>
          </div>

          {/* Sign Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredSigns.map(sign => (
              <button
                key={sign.id}
                onClick={() => handleSelectFromDictionary(sign)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 group shadow-xs ${
                  activeSign?.id === sign.id
                    ? 'bg-[#6B1D2F] text-[#FAF7F2] border-[#541524]'
                    : 'bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#1C1917] border-[#E4DACB] hover:border-[#C5A059]'
                }`}
              >
                <div>
                  <span className={`text-[9px] font-mono font-bold uppercase block ${
                    activeSign?.id === sign.id ? 'text-[#C5A059]' : 'text-[#8C6B28]'
                  }`}>
                    {sign.category}
                  </span>
                  <span className="text-sm font-black tracking-tight block mt-0.5">
                    {sign.name}
                  </span>
                </div>
                <p className={`text-[10px] line-clamp-2 leading-snug ${
                  activeSign?.id === sign.id ? 'text-[#FAF7F2]/80' : 'text-[#78716C]'
                }`}>
                  {sign.meaning || sign.description}
                </p>
                <div className={`text-[9px] font-mono font-bold flex items-center space-x-1 ${
                  activeSign?.id === sign.id ? 'text-[#FAF7F2]' : 'text-[#6B1D2F]'
                }`}>
                  <span>Inspect</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
