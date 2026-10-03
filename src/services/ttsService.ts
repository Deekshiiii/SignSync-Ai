/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TTSVoiceOption {
  name: string;
  lang: string;
  default: boolean;
  voiceURI: string;
}

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<(isSpeaking: boolean) => void> = new Set();
  private voicesLoadedCallbacks: Set<(voices: TTSVoiceOption[]) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();

      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    const voiceOptions: TTSVoiceOption[] = this.voices.map(v => ({
      name: v.name,
      lang: v.lang,
      default: v.default,
      voiceURI: v.voiceURI
    }));
    this.voicesLoadedCallbacks.forEach(cb => cb(voiceOptions));
  }

  public getVoices(): TTSVoiceOption[] {
    if (!this.synth) return [];
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    return this.voices.map(v => ({
      name: v.name,
      lang: v.lang,
      default: v.default,
      voiceURI: v.voiceURI
    }));
  }

  public onVoicesLoaded(callback: (voices: TTSVoiceOption[]) => void) {
    this.voicesLoadedCallbacks.add(callback);
    if (this.voices.length > 0) {
      callback(this.getVoices());
    }
    return () => {
      this.voicesLoadedCallbacks.delete(callback);
    };
  }

  public subscribeSpeaking(callback: (isSpeaking: boolean) => void) {
    this.listeners.add(callback);
    callback(this.isSpeaking);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private setSpeaking(status: boolean) {
    this.isSpeaking = status;
    this.listeners.forEach(cb => cb(status));
  }

  public speak(text: string, options: {
    rate?: number;
    pitch?: number;
    voiceURI?: string;
    onEnd?: () => void;
  } = {}) {
    if (!this.synth || !text.trim()) return;

    // Cancel any active speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;

    if (options.voiceURI && this.voices.length > 0) {
      const selectedVoice = this.voices.find(v => v.voiceURI === options.voiceURI || v.name === options.voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => {
      this.setSpeaking(true);
    };

    utterance.onend = () => {
      this.setSpeaking(false);
      this.currentUtterance = null;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('TTS Error:', e);
      this.setSpeaking(false);
      this.currentUtterance = null;
      if (options.onEnd) options.onEnd();
    };

    this.synth.speak(utterance);
  }

  public stop() {
    if (!this.synth) return;
    this.synth.cancel();
    this.setSpeaking(false);
    this.currentUtterance = null;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const ttsService = new TTSService();
