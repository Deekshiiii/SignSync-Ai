/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CameraView } from '../components/CameraView';
import { 
  PredictionResult, 
  SequenceItem, 
  AppSettings, 
  AppView, 
  SupportedLanguage,
  ExplainableAIResult
} from '../types';
import { generateExplainableAIResult } from '../services/copilotService';
import { translateSentence } from '../services/multilingual';
import { ttsService } from '../services/ttsService';
import { speechService } from '../services/speechRecognition';
import { 
  Sparkles, 
  Search,
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  RotateCcw, 
  Trash2, 
  Send, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  HeartHandshake, 
  MessageSquare, 
  Languages, 
  GraduationCap, 
  AlertOctagon, 
  Compass, 
  Edit3, 
  Copy, 
  Check, 
  Info,
  Radio,
  Activity
} from 'lucide-react';

interface HomeWorkspaceViewProps {
  onPrediction: (result: PredictionResult) => void;
  latestPrediction: PredictionResult | null;
  sequence: SequenceItem[];
  generatedSentence: string;
  onClearSequence: () => void;
  onUndoSign: () => void;
  onRemoveSignIndex: (idx: number) => void;
  onAddManualSign: (sign: string) => void;
  onNavigate: (view: AppView) => void;
  onOpenWhyAI: (result: ExplainableAIResult) => void;
  onOpenEmergency: () => void;
  settings: AppSettings;
  outputLanguage: SupportedLanguage;
}

export const HomeWorkspaceView: React.FC<HomeWorkspaceViewProps> = ({
  onPrediction,
  latestPrediction,
  sequence,
  generatedSentence,
  onClearSequence,
  onUndoSign,
  onRemoveSignIndex,
  onAddManualSign,
  onNavigate,
  onOpenWhyAI,
  onOpenEmergency,
  settings,
  outputLanguage
}) => {
  const [conversantReply, setConversantReply] = useState<string>('How can I help you?');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [isEditingSentence, setIsEditingSentence] = useState(false);
  const [editableSentence, setEditableSentence] = useState('');
  const [copied, setCopied] = useState(false);

  // Dynamic sentence
  const activeSentence = isEditingSentence ? editableSentence : generatedSentence;
  const translatedActiveSentence = translateSentence(activeSentence || 'Waiting for gesture...', outputLanguage);

  const handleSpeak = (textToSpeak?: string) => {
    const text = textToSpeak || translatedActiveSentence;
    if (!text || text.includes('Waiting')) return;
    setIsSpeaking(true);
    ttsService.speak(text, {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      voiceURI: settings.speechVoice,
      onEnd: () => setIsSpeaking(false)
    });
  };

  const handleStartSpeakingMic = () => {
    const listening = speechService.toggle();
    setIsListeningMic(listening);
  };

  const handleCopy = () => {
    if (!activeSentence) return;
    navigator.clipboard.writeText(activeSentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick categories
  const quickCategories = [
    { label: 'Hello', sign: 'HELLO' },
    { label: 'Thank You', sign: 'THANK YOU' },
    { label: 'Please Help', sign: 'HELP' },
    { label: 'I Want Water', sign: 'WATER' },
    { label: 'I Need Food', sign: 'FOOD' },
    { label: 'Yes', sign: 'YES' },
    { label: 'No', sign: 'NO' },
    { label: 'Stop', sign: 'STOP' }
  ];

  return (
    <div className="space-y-6 text-[#1C1917]">
      {/* Welcome & Communication Flow Hero */}
      <div className="relative overflow-hidden bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-3xl p-5 sm:p-6 shadow-md shadow-[#1C1917]/5">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-black text-[#1C1917] tracking-tight">
                Welcome to SIGNSYNC AI
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#6B1D2F] text-[#FAF7F2] text-[10px] font-mono font-bold">
                PRO v2.0
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6B1D2F] font-bold">
              Understand. Translate. Connect. &mdash; Real-time AI accessibility bridge.
            </p>
          </div>

          {/* Visual Pipeline Flow */}
          <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-mono font-bold text-[#57534E] bg-[#F7F2EB] px-4 py-2 rounded-2xl border border-[#E4DACB] self-start md:self-auto overflow-x-auto max-w-full">
            <span className="text-[#6B1D2F]">SIGN</span>
            <ArrowRight className="w-3 h-3 text-[#A8A29E] flex-shrink-0" />
            <span className="text-[#8C6B28]">AI PERCEPTION</span>
            <ArrowRight className="w-3 h-3 text-[#A8A29E] flex-shrink-0" />
            <span className="text-[#6B1D2F]">CONTEXT</span>
            <ArrowRight className="w-3 h-3 text-[#A8A29E] flex-shrink-0" />
            <span className="text-[#1C1917]">NATURAL VOICE</span>
          </div>
        </div>
      </div>

      {/* Major Feature Banner: 🔍 IDENTIFY A SIGN (Section 4) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#6B1D2F] to-[#541524] p-5 sm:p-6 text-[#FAF7F2] shadow-xl border-2 border-[#C5A059]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#C5A059] text-[#1C1917] text-[10px] font-mono font-black uppercase tracking-wider">
              NEW FEATURE
            </span>
            <span className="text-xs text-[#C5A059] font-mono font-bold">
              Single-Sign Instant Identification
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#FAF7F2] flex items-center space-x-2">
            <Search className="w-6 h-6 text-[#C5A059]" />
            <span>IDENTIFY A SIGN</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#FAF7F2]/90 leading-relaxed font-medium">
            &ldquo;Show a sign to your camera and I&apos;ll tell you what it means.&rdquo; Instant landmark recognition, dictionary meaning &amp; speech playback.
          </p>
        </div>

        <button
          onClick={() => onNavigate('identify')}
          className="flex-shrink-0 px-6 py-3.5 rounded-2xl bg-[#C5A059] hover:bg-[#d4b16c] text-[#1C1917] font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition flex items-center justify-center space-x-2 group"
        >
          <span>Open Sign Identifier</span>
          <ArrowRight className="w-4 h-4 text-[#1C1917] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Main Communication Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Camera Feed & Timeline */}
        <div className="lg:col-span-7 space-y-4">
          {/* Live Camera Panel */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#E4DACB] shadow-xl bg-[#FFFFFF]">
            <CameraView
              onPrediction={onPrediction}
              settings={settings}
            />

            {/* Tracking Quality & Multi-modal perception indicators below video */}
            <div className="p-3.5 bg-[#FAF7F2] border-t border-[#E4DACB] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#57534E]">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1.5 font-bold text-[#1C1917]">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                  <span>Hands</span>
                  <span className="text-[#16A34A] text-[10px]">✓ Tracking</span>
                </span>
                <span className="flex items-center space-x-1.5 font-bold text-[#1C1917]">
                  <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                  <span>Pose</span>
                  <span className="text-[#78716C] text-[10px]">✓ Ready</span>
                </span>
                <span className="flex items-center space-x-1.5 font-bold text-[#1C1917]">
                  <span className="w-2 h-2 rounded-full bg-[#6B1D2F]" />
                  <span>Face</span>
                  <span className="text-[#78716C] text-[10px]">✓ Ready</span>
                </span>
              </div>

              <div className="flex items-center space-x-3 text-[11px]">
                <span>FPS: <strong className="text-[#1C1917]">29</strong></span>
                <span>Latency: <strong className="text-[#6B1D2F]">18ms</strong></span>
                <span>Quality: <strong className="text-[#16A34A]">96%</strong></span>
              </div>
            </div>
          </div>

          {/* Real-Time Sign Timeline */}
          <div className="bg-[#FFFFFF] border border-[#E4DACB] rounded-3xl p-4.5 shadow-md space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold uppercase tracking-wider text-[#6B1D2F]">
                  Continuous Sign Timeline
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#C5A059]/20 text-[#8C6B28] text-[10px] font-mono font-bold">
                  {sequence.length} Captured
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={onUndoSign}
                  disabled={sequence.length === 0}
                  className="p-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#57534E] hover:text-[#1C1917] disabled:opacity-30 transition border border-[#E4DACB]"
                  title="Undo last sign"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onClearSequence}
                  disabled={sequence.length === 0}
                  className="p-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#6B1D2F]/10 text-[#6B1D2F] disabled:opacity-30 transition border border-[#E4DACB]"
                  title="Clear sequence"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sequence chips */}
            <div className="min-h-[50px] bg-[#FAF7F2] rounded-2xl p-2.5 flex items-center gap-2 overflow-x-auto border border-[#E4DACB]">
              {sequence.length === 0 ? (
                <span className="text-xs text-[#78716C] italic mx-auto">
                  Hold signs clearly in camera view to build timeline (e.g. I &rarr; WANT &rarr; WATER)
                </span>
              ) : (
                sequence.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#6B1D2F] border border-[#541524] text-[#FAF7F2] text-xs font-bold whitespace-nowrap shadow-sm">
                      <span>{item.sign}</span>
                      <span className="text-[10px] font-mono text-[#C5A059]">
                        {Math.round(item.confidence * 100)}%
                      </span>
                      <button
                        onClick={() => onRemoveSignIndex(index)}
                        className="text-[#FAF7F2]/70 hover:text-[#FAF7F2] ml-1"
                      >
                        &times;
                      </button>
                    </div>
                    {index < sequence.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-[#C5A059] flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))
              )}
            </div>

            {/* Quick Phrase Chips */}
            <div className="pt-1 flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] uppercase font-mono text-[#78716C] font-bold flex-shrink-0 mr-1">
                Quick Phrases:
              </span>
              {quickCategories.map(cat => (
                <button
                  key={cat.sign}
                  onClick={() => onAddManualSign(cat.sign)}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-[#FAF7F2] hover:bg-[#6B1D2F] text-[#57534E] hover:text-[#FAF7F2] border border-[#E4DACB] hover:border-[#6B1D2F] font-bold transition whitespace-nowrap shadow-xs"
                >
                  + {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): AI Interpretation & Two-Way Dialogue */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Real-Time AI Interpretation Panel */}
          <div className="relative overflow-hidden bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-3xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-[#6B1D2F] flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#C5A059] animate-pulse" />
                <span>Real-Time AI Interpretation</span>
              </span>

              {latestPrediction?.isConfident && latestPrediction.sign !== 'UNKNOWN' && (
                <button
                  onClick={() => onOpenWhyAI(generateExplainableAIResult(latestPrediction.sign, latestPrediction.confidence))}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#F3ECE1] hover:bg-[#6B1D2F] text-[#6B1D2F] hover:text-[#FAF7F2] border border-[#E4DACB] text-[10px] font-mono font-bold transition"
                >
                  <HelpCircle className="w-3 h-3 text-[#C5A059]" />
                  <span>Why this interpretation?</span>
                </button>
              )}
            </div>

            {/* Detected Sign Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E4DACB]">
                <span className="text-[10px] font-mono uppercase text-[#78716C] block mb-1">
                  Active Detected Gesture
                </span>
                <span className="text-xl font-black text-[#1C1917]">
                  {latestPrediction?.isConfident ? latestPrediction.sign : 'Awaiting Sign'}
                </span>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E4DACB]">
                <span className="text-[10px] font-mono uppercase text-[#78716C] block mb-1">
                  Confidence &amp; Stability
                </span>
                <span className="text-xl font-black font-mono text-[#6B1D2F]">
                  {latestPrediction?.isConfident ? `${Math.round(latestPrediction.confidence * 100)}%` : '0%'}
                </span>
                <span className="text-[10px] text-[#16A34A] font-bold block mt-0.5">High Stability</span>
              </div>
            </div>

            {/* Context-Aware Sentence Generation */}
            <div className="p-4 bg-[#F3ECE1] rounded-2xl border border-[#C5A059]/40 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                <span className="font-bold text-[#6B1D2F]">Natural English Synthesis:</span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => {
                      if (!isEditingSentence) {
                        setEditableSentence(generatedSentence);
                      }
                      setIsEditingSentence(!isEditingSentence);
                    }}
                    className="text-[#78716C] hover:text-[#1C1917]"
                    title="Edit sentence"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="text-[#78716C] hover:text-[#1C1917]"
                    title="Copy text"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {isEditingSentence ? (
                <input
                  type="text"
                  value={editableSentence}
                  onChange={(e) => setEditableSentence(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#6B1D2F] rounded-xl p-2 text-sm text-[#1C1917] font-bold outline-none"
                />
              ) : (
                <p className="text-xl font-extrabold text-[#1C1917] tracking-tight leading-snug">
                  {activeSentence ? `“${activeSentence}”` : 'Awaiting sign input to generate sentence...'}
                </p>
              )}

              {/* Multilingual Translation */}
              {translatedActiveSentence && translatedActiveSentence !== activeSentence && (
                <p className="text-xs font-bold text-[#6B1D2F] pt-1 border-t border-[#E4DACB] font-mono">
                  {translatedActiveSentence}
                </p>
              )}
            </div>

            {/* Speak & Stop Voice Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSpeak()}
                disabled={!activeSentence}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider text-[#FAF7F2] shadow-md transition ${
                  isSpeaking
                    ? 'bg-[#541524] animate-pulse'
                    : activeSentence
                    ? 'bg-[#6B1D2F] hover:bg-[#541524] shadow-[#6B1D2F]/25'
                    : 'bg-[#E4DACB] text-[#78716C] cursor-not-allowed'
                }`}
              >
                <Volume2 className="w-4 h-4 text-[#C5A059]" />
                <span>{isSpeaking ? 'Speaking...' : '🔊 Speak Aloud'}</span>
              </button>
            </div>
          </div>

          {/* AI Conversation Dialogue Panel */}
          <div className="bg-[#FFFFFF] border border-[#E4DACB] rounded-3xl p-5 shadow-lg space-y-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B1D2F] flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-[#C5A059]" />
              <span>Active Two-Way Dialogue</span>
            </span>

            {/* 🤟 YOU */}
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E4DACB] space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-[#6B1D2F]">
                🤟 YOU (SIGNER)
              </span>
              <p className="text-sm font-extrabold text-[#1C1917]">
                &ldquo;{activeSentence || 'I need help.'}&rdquo;
              </p>
            </div>

            {/* 🔊 SIGNSYNC AI / CONVERSANT */}
            <div className="p-3.5 rounded-2xl bg-[#F3ECE1] border border-[#C5A059]/40 space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase text-[#8C6B28]">
                <span>🔊 CONVERSANT RESPONSE</span>
                <button
                  onClick={() => ttsService.speak(conversantReply)}
                  className="text-[#78716C] hover:text-[#1C1917]"
                  title="Replay"
                >
                  <Volume2 className="w-3 h-3" />
                </button>
              </div>
              <p className="text-sm font-extrabold text-[#1C1917]">
                &ldquo;{conversantReply}&rdquo;
              </p>
            </div>

            {/* 🎤 Hearing Response Mic Button */}
            <div className="pt-1">
              <button
                onClick={handleStartSpeakingMic}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider border transition shadow-sm ${
                  isListeningMic
                    ? 'bg-[#6B1D2F] text-[#FAF7F2] border-[#541524] animate-pulse'
                    : 'bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#1C1917] border-[#E4DACB]'
                }`}
              >
                {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#6B1D2F]" />}
                <span>{isListeningMic ? 'Listening to speech...' : '🎤 Start Speaking (Conversant Voice)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Large Bottom Quick Actions */}
      <div className="pt-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#57534E] block mb-3">
          Quick Workspaces:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate('identify')}
            className="p-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#FAF7F2] border border-[#E4DACB] hover:border-[#6B1D2F] transition text-left space-y-1 shadow-sm group"
          >
            <Search className="w-5 h-5 text-[#6B1D2F] group-hover:scale-110 transition-transform mb-2" />
            <span className="font-bold text-xs text-[#1C1917] block">🔍 Identify Sign</span>
            <span className="text-[10px] text-[#78716C] block">Single-sign camera</span>
          </button>

          <button
            onClick={() => onNavigate('translate')}
            className="p-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#FAF7F2] border border-[#E4DACB] hover:border-[#6B1D2F] transition text-left space-y-1 shadow-sm"
          >
            <Languages className="w-5 h-5 text-[#6B1D2F] mb-2" />
            <span className="font-bold text-xs text-[#1C1917] block">🤟 Live Translate</span>
            <span className="text-[10px] text-[#78716C] block">Kiosk subtitle view</span>
          </button>

          <button
            onClick={() => onNavigate('conversation')}
            className="p-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#FAF7F2] border border-[#E4DACB] hover:border-[#6B1D2F] transition text-left space-y-1 shadow-sm"
          >
            <MessageSquare className="w-5 h-5 text-[#C5A059] mb-2" />
            <span className="font-bold text-xs text-[#1C1917] block">💬 Two-Way Connect</span>
            <span className="text-[10px] text-[#78716C] block">Speech &amp; Avatar</span>
          </button>

          <button
            onClick={() => onNavigate('coach')}
            className="p-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#FAF7F2] border border-[#E4DACB] hover:border-[#6B1D2F] transition text-left space-y-1 shadow-sm"
          >
            <GraduationCap className="w-5 h-5 text-[#6B1D2F] mb-2" />
            <span className="font-bold text-xs text-[#1C1917] block">🎓 Sign Coach</span>
            <span className="text-[10px] text-[#78716C] block">Posture evaluation</span>
          </button>

          <button
            onClick={() => onNavigate('languages')}
            className="p-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#FAF7F2] border border-[#E4DACB] hover:border-[#6B1D2F] transition text-left space-y-1 shadow-sm"
          >
            <Languages className="w-5 h-5 text-[#C5A059] mb-2" />
            <span className="font-bold text-xs text-[#1C1917] block">🌐 Multilingual</span>
            <span className="text-[10px] text-[#78716C] block">Tamil, Hindi, Telugu...</span>
          </button>

          <button
            onClick={onOpenEmergency}
            className="p-4 rounded-2xl bg-[#6B1D2F]/10 hover:bg-[#6B1D2F] text-[#6B1D2F] hover:text-[#FAF7F2] border border-[#6B1D2F]/40 transition text-left space-y-1 shadow-sm group"
          >
            <AlertOctagon className="w-5 h-5 text-[#6B1D2F] group-hover:text-[#FAF7F2] mb-2 animate-pulse" />
            <span className="font-bold text-xs block">🚨 Emergency</span>
            <span className="text-[10px] text-[#6B1D2F] group-hover:text-[#FAF7F2]/80 block">Instant loud alert</span>
          </button>
        </div>
      </div>
    </div>
  );
};
