/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private transcriptCallbacks: Set<(text: string, isFinal: boolean) => void> = new Set();
  private statusCallbacks: Set<(isListening: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            this.transcriptCallbacks.forEach(cb => cb(finalTranscript.trim(), true));
          } else if (interimTranscript) {
            this.transcriptCallbacks.forEach(cb => cb(interimTranscript.trim(), false));
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          this.setListening(false);
        };

        this.recognition.onend = () => {
          this.setListening(false);
        };
      }
    }
  }

  public setLanguage(langCode: string) {
    if (this.recognition) {
      const langMap: Record<string, string> = {
        en: 'en-US',
        ta: 'ta-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        ml: 'ml-IN',
        kn: 'kn-IN'
      };
      this.recognition.lang = langMap[langCode] || 'en-US';
    }
  }

  private setListening(val: boolean) {
    this.isListening = val;
    this.statusCallbacks.forEach(cb => cb(val));
  }

  public onTranscript(cb: (text: string, isFinal: boolean) => void) {
    this.transcriptCallbacks.add(cb);
    return () => this.transcriptCallbacks.delete(cb);
  }

  public onStatusChange(cb: (isListening: boolean) => void) {
    this.statusCallbacks.add(cb);
    cb(this.isListening);
    return () => this.statusCallbacks.delete(cb);
  }

  public start() {
    if (!this.recognition) {
      console.warn('Speech Recognition not supported in this browser.');
      return false;
    }
    try {
      this.recognition.start();
      this.setListening(true);
      return true;
    } catch (e) {
      console.warn('Recognition start failed', e);
      return false;
    }
  }

  public stop() {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
      this.setListening(false);
    } catch (e) {
      // ignore
    }
  }

  public toggle(): boolean {
    if (this.isListening) {
      this.stop();
      return false;
    } else {
      return this.start();
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechRecognitionService();
