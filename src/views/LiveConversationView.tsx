/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ConversationMessage, 
  SupportedLanguage, 
  AppSettings, 
  PredictionResult, 
  SequenceItem 
} from '../types';
import { CameraView } from '../components/CameraView';
import { SignAvatar } from '../components/SignAvatar';
import { speechService } from '../services/speechRecognition';
import { ttsService } from '../services/ttsService';
import { translateSentence } from '../services/multilingual';
import { analyzeConversationIntent } from '../services/copilotService';
import { 
  MessageSquare, 
  Mic, 
  MicOff, 
  Volume2, 
  Send, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  Clock, 
  User, 
  Radio, 
  ArrowRight,
  Maximize2
} from 'lucide-react';

interface LiveConversationViewProps {
  onPrediction: (result: PredictionResult) => void;
  latestPrediction: PredictionResult | null;
  sequence: SequenceItem[];
  generatedSentence: string;
  onClearSequence: () => void;
  settings: AppSettings;
  outputLanguage: SupportedLanguage;
}

export const LiveConversationView: React.FC<LiveConversationViewProps> = ({
  onPrediction,
  latestPrediction,
  sequence,
  generatedSentence,
  onClearSequence,
  settings,
  outputLanguage
}) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: 'm1',
      sender: 'signer',
      senderName: 'Signer (You)',
      text: 'Hello, my name is Deekshitha.',
      translatedText: translateSentence('Hello, my name is Deekshitha.', outputLanguage),
      sourceLang: 'en',
      targetLang: outputLanguage,
      signs: ['HELLO', 'MY', 'NAME'],
      timestamp: Date.now() - 60000,
      confidence: 0.96
    },
    {
      id: 'm2',
      sender: 'speaker',
      senderName: 'Conversant (Hearing)',
      text: 'Nice to meet you Deekshitha! How can I help you today?',
      translatedText: translateSentence('Nice to meet you Deekshitha! How can I help you today?', outputLanguage),
      sourceLang: 'en',
      targetLang: outputLanguage,
      timestamp: Date.now() - 35000
    }
  ]);

  const [isListeningMic, setIsListeningMic] = useState(false);
  const [liveSpeechTranscript, setLiveSpeechTranscript] = useState('');
  const [typingInput, setTypingInput] = useState('');
  const [showAvatar, setShowAvatar] = useState(true);
  const [activeAvatarText, setActiveAvatarText] = useState('HELLO');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, liveSpeechTranscript]);

  // Hook up speech recognition
  useEffect(() => {
    speechService.setLanguage(outputLanguage);

    const unsubTranscript = speechService.onTranscript((text, isFinal) => {
      setLiveSpeechTranscript(text);
      if (isFinal && text.trim()) {
        const newMsg: ConversationMessage = {
          id: `msg-${Date.now()}`,
          sender: 'speaker',
          senderName: 'Speaker (Voice Input)',
          text: text.trim(),
          translatedText: translateSentence(text.trim(), outputLanguage),
          sourceLang: 'en',
          targetLang: outputLanguage,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, newMsg]);
        setLiveSpeechTranscript('');
        setActiveAvatarText(text.trim());
      }
    });

    const unsubStatus = speechService.onStatusChange((listening) => {
      setIsListeningMic(listening);
    });

    return () => {
      unsubTranscript();
      unsubStatus();
      speechService.stop();
    };
  }, [outputLanguage]);

  // Send current recognized signs from signer
  const handleSendSignerSentence = () => {
    if (!generatedSentence) return;

    const translated = translateSentence(generatedSentence, outputLanguage);
    const newMsg: ConversationMessage = {
      id: `msg-${Date.now()}`,
      sender: 'signer',
      senderName: 'Signer (You)',
      text: generatedSentence,
      translatedText: translated,
      sourceLang: 'en',
      targetLang: outputLanguage,
      signs: sequence.map(s => s.sign),
      timestamp: Date.now(),
      confidence: sequence.length > 0 ? sequence[0].confidence : 0.94
    };

    setMessages(prev => [...prev, newMsg]);
    setActiveAvatarText(generatedSentence);

    // Speak audio aloud
    ttsService.speak(translated, {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      voiceURI: settings.speechVoice
    });

    onClearSequence();
  };

  // Send manual text response from hearing speaker
  const handleSendSpeakerText = (textToSend?: string) => {
    const text = textToSend || typingInput;
    if (!text.trim()) return;

    const translated = translateSentence(text.trim(), outputLanguage);
    const newMsg: ConversationMessage = {
      id: `msg-${Date.now()}`,
      sender: 'speaker',
      senderName: 'Speaker (Response)',
      text: text.trim(),
      translatedText: translated,
      sourceLang: 'en',
      targetLang: outputLanguage,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMsg]);
    setTypingInput('');
    setActiveAvatarText(text.trim());
  };

  // Analyze copilot intent from latest message
  const lastMsg = messages[messages.length - 1];
  const copilotAnalysis = analyzeConversationIntent(lastMsg ? lastMsg.text : '', messages);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#101726] border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
              <span>Two-Way Live Conversation</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800 font-mono">
                Signer &harr; Speaker
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Sign &rarr; Spoken Voice &nbsp;|&nbsp; Spoken Voice &rarr; Text &amp; Sign Avatar
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Avatar toggle */}
          <button
            onClick={() => setShowAvatar(!showAvatar)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              showAvatar
                ? 'bg-cyan-950/70 border-cyan-700 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {showAvatar ? 'Avatar Active' : 'Show Avatar'}
          </button>

          {/* Clear conversation */}
          <button
            onClick={() => setMessages([])}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition border border-slate-700"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Camera & Avatar, Right Chat Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Signer Camera + Avatar Visualizer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-800 shadow-xl">
            <CameraView
              onPrediction={onPrediction}
              settings={settings}
            />
          </div>

          {/* Signer Live Input Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Signer Composition</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {sequence.length} Signs Detected
              </span>
            </div>

            {/* Sequence chips */}
            <div className="min-h-[42px] bg-slate-950 rounded-xl p-2 flex items-center gap-1.5 overflow-x-auto border border-slate-800">
              {sequence.length === 0 ? (
                <span className="text-xs text-slate-500 italic">Sign in camera or use presets...</span>
              ) : (
                sequence.map((s, idx) => (
                  <span
                    key={s.id}
                    className="text-xs px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold whitespace-nowrap"
                  >
                    {s.sign}
                  </span>
                ))
              )}
            </div>

            {/* Interpreted Sentence & Send Button */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs text-white font-bold truncate">
                {generatedSentence ? `“${generatedSentence}”` : 'Awaiting sign sentence...'}
              </div>
              <button
                onClick={handleSendSignerSentence}
                disabled={!generatedSentence}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 font-black text-xs transition shadow-md shadow-cyan-500/25"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sign Avatar Panel */}
          {showAvatar && (
            <SignAvatar
              currentText={activeAvatarText}
              className="border-slate-800 shadow-xl"
            />
          )}
        </div>

        {/* Right Column: Two-Way Message Stream & Voice Mic Input */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Messages Scroll Area */}
          <div className="bg-[#0e1422] border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between h-[520px]">
            {/* Scrollable chat log */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto space-y-4 pr-1.5"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <MessageSquare className="w-12 h-12 mb-3 text-slate-700" />
                  <p className="text-sm font-semibold text-slate-400">Start the conversation</p>
                  <p className="text-xs max-w-sm mt-1">
                    Sign using the camera on the left, or press the microphone below to speak as the hearing conversant.
                  </p>
                </div>
              ) : (
                messages.map(msg => {
                  const isSigner = msg.sender === 'signer';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isSigner ? 'items-start' : 'items-end'}`}
                    >
                      {/* Message Bubble */}
                      <div className={`max-w-[85%] rounded-3xl p-4.5 space-y-1.5 shadow-lg border transition ${
                        isSigner
                          ? 'bg-gradient-to-br from-[#131b2e] to-[#151f38] border-cyan-500/30 text-white rounded-tl-sm'
                          : 'bg-gradient-to-br from-violet-950/70 to-indigo-950/70 border-violet-500/40 text-white rounded-tr-sm'
                      }`}>
                        {/* Sender info */}
                        <div className="flex items-center justify-between space-x-3 text-[10px] font-mono text-slate-400">
                          <span className={`font-bold uppercase ${isSigner ? 'text-cyan-400' : 'text-violet-300'}`}>
                            {isSigner ? '🤟 SIGNER (YOU)' : '🎤 CONVERSANT (VOICE)'}
                          </span>
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Signs Used (if signer) */}
                        {msg.signs && msg.signs.length > 0 && (
                          <div className="flex flex-wrap gap-1 py-0.5">
                            {msg.signs.map((s, idx) => (
                              <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900/80 text-cyan-300 font-mono">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Primary Message Text */}
                        <p className="text-base font-extrabold tracking-tight leading-snug">
                          &ldquo;{msg.text}&rdquo;
                        </p>

                        {/* Multilingual Translation */}
                        {msg.translatedText && msg.translatedText !== msg.text && (
                          <p className="text-xs font-semibold text-cyan-300/90 pt-1 border-t border-slate-700/50">
                            {msg.translatedText}
                          </p>
                        )}

                        {/* Actions: Speak & Replay */}
                        <div className="flex items-center justify-end space-x-2 pt-1">
                          <button
                            onClick={() => ttsService.speak(msg.translatedText || msg.text)}
                            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                            title="Speak audio"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Live listening indicator */}
              {isListeningMic && liveSpeechTranscript && (
                <div className="flex flex-col items-end">
                  <div className="max-w-[85%] rounded-3xl p-3 bg-violet-950/40 border border-violet-500/50 text-slate-300 text-xs italic animate-pulse">
                    <span className="font-bold text-violet-400 mr-1.5">Listening:</span>
                    &ldquo;{liveSpeechTranscript}&rdquo;
                  </div>
                </div>
              )}
            </div>

            {/* Smart Suggested Replies (Section 13) */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="flex items-center space-x-1.5 mb-2">
                <Sparkles className="w-3 h-3 text-violet-400" />
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                  Copilot Suggested Replies:
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {copilotAnalysis.suggestedReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendSpeakerText(reply)}
                    className="text-xs px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-violet-950 hover:border-violet-600 text-slate-300 hover:text-violet-200 border border-slate-800 font-semibold transition"
                  >
                    + {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* Speaker Microphone & Text Input Bar */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center space-x-2">
              {/* Mic Toggle Button */}
              <button
                onClick={() => speechService.toggle()}
                className={`p-3 rounded-2xl border transition shadow-lg ${
                  isListeningMic
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                    : 'bg-violet-600 hover:bg-violet-500 text-white border-violet-500 shadow-violet-500/20'
                }`}
                title={isListeningMic ? 'Stop Listening' : 'Start Speech Input'}
              >
                {isListeningMic ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                placeholder={isListeningMic ? 'Listening to speech...' : 'Type response or press mic...'}
                value={typingInput}
                onChange={(e) => setTypingInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendSpeakerText()}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500 transition"
              />

              {/* Send Button */}
              <button
                onClick={() => handleSendSpeakerText()}
                disabled={!typingInput.trim()}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-violet-600 text-white disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
