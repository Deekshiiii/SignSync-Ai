/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AppView, 
  AppSettings, 
  PredictionResult, 
  SequenceItem, 
  TranslationHistoryItem,
  SupportedLanguage,
  ExplainableAIResult
} from './types';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { SettingsModal } from './components/SettingsModal';
import { EmergencyModal } from './components/EmergencyModal';
import { ExplainableAIModal } from './components/ExplainableAIModal';
import { HomeWorkspaceView } from './views/HomeWorkspaceView';
import { IdentifySignView } from './views/IdentifySignView';
import { TranslateView } from './views/TranslateView';
import { LiveConversationView } from './views/LiveConversationView';
import { SignCoachView } from './views/SignCoachView';
import { CommunicationCopilotView } from './views/CommunicationCopilotView';
import { MySignsView } from './views/MySignsView';
import { LanguagesView } from './views/LanguagesView';
import { SceneUnderstandingView } from './views/SceneUnderstandingView';
import { InsightsView } from './views/InsightsView';
import { HistoryView } from './views/HistoryView';
import { PrivacyCenterView } from './views/PrivacyCenterView';
import { ContinuousSequenceManager } from './services/sequenceProcessor';
import { generateSentenceFromSigns } from './services/nlpEngine';
import { translateSentence } from './services/multilingual';
import { ttsService } from './services/ttsService';

const DEFAULT_SETTINGS: AppSettings = {
  confidenceThreshold: 0.58,
  minMarginThreshold: 0.04,
  minReferenceSimilarity: 0.45,
  stabilityFrames: 2,
  debugMode: false,
  autoSpeak: false,
  speechRate: 1.0,
  speechPitch: 1.0,
  speechVoice: '',
  mirrorVideo: true,
  showSkeleton: true,
  skeletonStyle: 'neon',
  inputLanguage: 'en',
  outputLanguage: 'en',
  contextActive: true,
  localProcessingOnly: false,
  accessibilityMode: false,
  largeText: false,
  reducedMotion: false,
  captionSize: 'normal'
};

const SETTINGS_KEY = 'signsync_settings_pro_v2';
const HISTORY_KEY = 'signsync_history_pro_v2';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [whyAIResult, setWhyAIResult] = useState<ExplainableAIResult | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.confidenceThreshold > 0.70) parsed.confidenceThreshold = 0.58;
        if (parsed.minMarginThreshold > 0.08) parsed.minMarginThreshold = 0.04;
        if (parsed.minReferenceSimilarity > 0.60) parsed.minReferenceSimilarity = 0.45;
        if (parsed.stabilityFrames > 3) parsed.stabilityFrames = 2;
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [history, setHistory] = useState<TranslationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [latestPrediction, setLatestPrediction] = useState<PredictionResult | null>(null);
  const [sequence, setSequence] = useState<SequenceItem[]>([]);
  const [stabilityProgress, setStabilityProgress] = useState<number>(0);
  const [generatedSentence, setGeneratedSentence] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Sequence processor
  const sequenceManagerRef = useRef<ContinuousSequenceManager | null>(null);

  // Initialize continuous sequence processor
  useEffect(() => {
    const sm = new ContinuousSequenceManager({
      stabilityFrames: settings.stabilityFrames,
      onSequenceUpdate: (newSeq, newSignAdded) => {
        setSequence(newSeq);
        const signs = newSeq.map(s => s.sign);
        const sentence = generateSentenceFromSigns(signs);
        setGeneratedSentence(sentence);

        // Auto-speak if enabled
        if (settings.autoSpeak && newSignAdded && sentence) {
          const translated = translateSentence(sentence, settings.outputLanguage);
          ttsService.speak(translated, {
            rate: settings.speechRate,
            pitch: settings.speechPitch,
            voiceURI: settings.speechVoice
          });
        }
      }
    });

    sequenceManagerRef.current = sm;
  }, [settings.stabilityFrames, settings.autoSpeak, settings.outputLanguage, settings.speechRate, settings.speechPitch, settings.speechVoice]);

  // Demo Mode simulated sequence loop (Section 29)
  useEffect(() => {
    if (!isDemoMode) return;

    const demoSigns = ['HELLO', 'I', 'WANT', 'WATER'];
    let step = 0;

    const demoInterval = setInterval(() => {
      const sign = demoSigns[step % demoSigns.length];
      step++;

      if (sequenceManagerRef.current) {
        sequenceManagerRef.current.addManualSign(sign, 0.96);
      }
    }, 2400);

    return () => clearInterval(demoInterval);
  }, [isDemoMode]);

  // Settings update helper
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (e) {
      // ignore
    }
  };

  // Commit sentence to history
  const handleCommitToHistory = useCallback(() => {
    if (sequence.length === 0 || !generatedSentence) return;

    const avgConfidence = sequence.reduce((acc, curr) => acc + curr.confidence, 0) / sequence.length;
    const translated = translateSentence(generatedSentence, settings.outputLanguage);
    const historyItem: TranslationHistoryItem = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      signs: sequence.map(s => s.sign),
      generatedSentence,
      confidence: avgConfidence,
      grammarMode: 'rule-based',
      targetLanguage: settings.outputLanguage,
      translatedText: translated
    };

    const newHistory = [historyItem, ...history];
    setHistory(newHistory);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) {
      // ignore
    }
  }, [sequence, generatedSentence, history, settings.outputLanguage]);

  // Clear all data (Privacy Center)
  const handleClearAllData = () => {
    setHistory([]);
    setSequence([]);
    setGeneratedSentence('');
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      // ignore
    }
  };

  // Prediction incoming from Camera
  const handlePrediction = useCallback((pred: PredictionResult) => {
    setLatestPrediction(pred);

    if (sequenceManagerRef.current) {
      const { stabilityProgress: progress } = sequenceManagerRef.current.processFrame(pred);
      setStabilityProgress(progress);
    }
  }, []);

  const handleSpeak = (textToSpeak?: string) => {
    const raw = textToSpeak || generatedSentence;
    if (!raw) return;
    const translated = translateSentence(raw, settings.outputLanguage);
    ttsService.speak(translated, {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      voiceURI: settings.speechVoice
    });
  };

  const handleUndoSign = () => {
    if (sequenceManagerRef.current) sequenceManagerRef.current.undoLastSign();
  };

  const handleClearSequence = () => {
    if (sequence.length > 0 && generatedSentence) {
      handleCommitToHistory();
    }
    if (sequenceManagerRef.current) sequenceManagerRef.current.clearSequence();
    setGeneratedSentence('');
  };

  const handleRemoveSignIndex = (idx: number) => {
    if (sequenceManagerRef.current) sequenceManagerRef.current.removeSignAtIndex(idx);
  };

  const handleAddManualSign = (sign: string) => {
    if (sequenceManagerRef.current) sequenceManagerRef.current.addManualSign(sign, 0.95);
  };

  return (
    <div className={`min-h-screen bg-[#FAF7F2] text-[#1C1917] flex ${
      settings.accessibilityMode ? 'text-sm font-semibold' : ''
    }`}>
      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => {
          if (view === 'emergency') {
            setIsEmergencyOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
        isDemoMode={isDemoMode}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <TopHeader
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          outputLanguage={settings.outputLanguage}
          onLanguageChange={(lang) => handleUpdateSettings({ outputLanguage: lang })}
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        {/* Demo Mode Notice Banner (Section 29) */}
        {isDemoMode && (
          <div className="bg-[#F3ECE1] border-b border-[#C5A059] px-4 py-2 text-xs font-mono text-[#6B1D2F] flex items-center justify-between shadow-xs">
            <span className="font-bold flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-ping" />
              <span>DEMO MODE ACTIVE &mdash; Simulating continuous sign sequence: HELLO &rarr; I &rarr; WANT &rarr; WATER</span>
            </span>
            <button
              onClick={() => setIsDemoMode(false)}
              className="text-[11px] underline hover:text-[#541524] font-bold"
            >
              Exit Demo Mode
            </button>
          </div>
        )}

        {/* View Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {currentView === 'home' && (
            <HomeWorkspaceView
              onPrediction={handlePrediction}
              latestPrediction={latestPrediction}
              sequence={sequence}
              generatedSentence={generatedSentence}
              onClearSequence={handleClearSequence}
              onUndoSign={handleUndoSign}
              onRemoveSignIndex={handleRemoveSignIndex}
              onAddManualSign={handleAddManualSign}
              onNavigate={setCurrentView}
              onOpenWhyAI={(res) => setWhyAIResult(res)}
              onOpenEmergency={() => setIsEmergencyOpen(true)}
              settings={settings}
              outputLanguage={settings.outputLanguage}
            />
          )}

          {currentView === 'identify' && (
            <IdentifySignView
              onPrediction={handlePrediction}
              latestPrediction={latestPrediction}
              settings={settings}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'translate' && (
            <TranslateView
              onPrediction={handlePrediction}
              latestPrediction={latestPrediction}
              sequence={sequence}
              generatedSentence={generatedSentence}
              settings={settings}
              isSpeaking={isSpeaking}
              onSpeak={handleSpeak}
              onStopSpeak={() => ttsService.stop()}
              onClearSequence={handleClearSequence}
              onAddManualSign={handleAddManualSign}
              onCommitToHistory={handleCommitToHistory}
              history={history}
            />
          )}

          {currentView === 'conversation' && (
            <LiveConversationView
              onPrediction={handlePrediction}
              latestPrediction={latestPrediction}
              sequence={sequence}
              generatedSentence={generatedSentence}
              onClearSequence={handleClearSequence}
              settings={settings}
              outputLanguage={settings.outputLanguage}
            />
          )}

          {currentView === 'coach' && (
            <SignCoachView
              onPrediction={handlePrediction}
              latestPrediction={latestPrediction}
              settings={settings}
            />
          )}

          {currentView === 'copilot' && (
            <CommunicationCopilotView
              settings={settings}
              outputLanguage={settings.outputLanguage}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {currentView === 'mysigns' && (
            <MySignsView
              settings={settings}
            />
          )}

          {currentView === 'languages' && (
            <LanguagesView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {currentView === 'scene' && (
            <SceneUnderstandingView
              onPrediction={handlePrediction}
              latestPrediction={latestPrediction}
              settings={settings}
            />
          )}

          {currentView === 'insights' && (
            <InsightsView />
          )}

          {currentView === 'history' && (
            <HistoryView
              history={history}
              onSpeak={handleSpeak}
              onClearHistory={() => setHistory([])}
              onDeleteItem={(id) => setHistory(history.filter(h => h.id !== id))}
            />
          )}

          {currentView === 'privacy' && (
            <PrivacyCenterView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onClearAllData={handleClearAllData}
            />
          )}

          {currentView === 'settings' && (
            <div className="space-y-6">
              <SettingsModal
                isOpen={true}
                onClose={() => setCurrentView('home')}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onResetDefaults={handleResetDefaults}
              />
            </div>
          )}
        </main>
      </div>

      {/* Emergency Mode Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        detectedSign={latestPrediction?.sign || 'HELP'}
      />

      {/* Explainable AI ("Why this interpretation?") Modal */}
      <ExplainableAIModal
        isOpen={whyAIResult !== null}
        onClose={() => setWhyAIResult(null)}
        result={whyAIResult}
      />
    </div>
  );
}
