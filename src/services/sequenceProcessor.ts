/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PredictionResult, SequenceItem } from '../types';

export class ContinuousSequenceManager {
  private sequence: SequenceItem[] = [];
  private stabilityCounter = 0;
  private candidateSign: string | null = null;
  private lastConfirmedSign: string | null = null;
  private lastConfirmedTime = 0;
  private minStabilityFrames = 6; // 6 consecutive stable frames required (Requirement 5)
  private duplicateCooldownMs = 1200; // prevent rapid duplicate spam
  private rollingPredictions: string[] = []; // rolling window of past 8 frames
  private onSequenceUpdateCallback?: (seq: SequenceItem[], newSignAdded?: string) => void;

  constructor(options: {
    stabilityFrames?: number;
    duplicateCooldownMs?: number;
    onSequenceUpdate?: (seq: SequenceItem[], newSignAdded?: string) => void;
  } = {}) {
    if (options.stabilityFrames) this.minStabilityFrames = options.stabilityFrames;
    if (options.duplicateCooldownMs) this.duplicateCooldownMs = options.duplicateCooldownMs;
    if (options.onSequenceUpdate) this.onSequenceUpdateCallback = options.onSequenceUpdate;
  }

  public setStabilityFrames(frames: number) {
    this.minStabilityFrames = Math.max(3, Math.min(25, frames));
  }

  public setDuplicateCooldown(ms: number) {
    this.duplicateCooldownMs = ms;
  }

  public onUpdate(callback: (seq: SequenceItem[], newSignAdded?: string) => void) {
    this.onSequenceUpdateCallback = callback;
  }

  /**
   * Processes a live frame's prediction and updates continuous sequence if stability criteria met (Requirement 5)
   */
  public processFrame(prediction: PredictionResult): {
    candidateSign: string | null;
    stabilityProgress: number; // 0 to 1
    newSignAdded: boolean;
    isFluctuating: boolean;
    stabilityMessage: string;
  } {
    const now = Date.now();

    // Track rolling history
    this.rollingPredictions.push(prediction.sign);
    if (this.rollingPredictions.length > 8) {
      this.rollingPredictions.shift();
    }

    // Check for prediction fluctuation (Requirement 5)
    // If the last 5-6 frames switch back and forth between different non-empty signs:
    const nonUnknownRecent = this.rollingPredictions.filter(s => s !== 'UNKNOWN');
    const uniqueRecent = new Set(nonUnknownRecent);
    const isFluctuating = uniqueRecent.size >= 2 && nonUnknownRecent.length >= 4;

    let stabilityMessage = '';
    if (isFluctuating) {
      stabilityMessage = 'Gesture unclear — please hold the pose steady.';
    }

    // If prediction is unknown or uncertain or fluctuating, decay stability counter
    if (!prediction.isConfident || prediction.sign === 'UNKNOWN' || prediction.state !== 'CONFIDENT' || isFluctuating) {
      if (this.stabilityCounter > 0) {
        this.stabilityCounter = Math.max(0, this.stabilityCounter - 1);
      }
      if (this.stabilityCounter === 0) {
        this.candidateSign = null;
        if (now - this.lastConfirmedTime > 500) {
          this.lastConfirmedSign = null;
        }
      }
      return {
        candidateSign: this.candidateSign,
        stabilityProgress: this.stabilityCounter / this.minStabilityFrames,
        newSignAdded: false,
        isFluctuating,
        stabilityMessage: stabilityMessage || (prediction.feedbackMessage || 'Hold gesture steady')
      };
    }

    const currentSign = prediction.sign;

    // Consecutive stable frame accumulation
    if (this.candidateSign === currentSign) {
      this.stabilityCounter++;
    } else {
      this.candidateSign = currentSign;
      this.stabilityCounter = 1;
    }

    const progress = Math.min(1.0, this.stabilityCounter / this.minStabilityFrames);

    // If stability threshold reached (e.g. 6 consecutive frames of the same sign)
    if (this.stabilityCounter >= this.minStabilityFrames) {
      const isRecentDuplicate = this.lastConfirmedSign === currentSign && (now - this.lastConfirmedTime < this.duplicateCooldownMs);

      if (!isRecentDuplicate) {
        const newItem: SequenceItem = {
          id: `${currentSign}-${now}-${Math.random().toString(36).substring(2, 6)}`,
          sign: currentSign,
          timestamp: now,
          confidence: prediction.confidence
        };

        this.sequence.push(newItem);
        this.lastConfirmedSign = currentSign;
        this.lastConfirmedTime = now;
        this.stabilityCounter = 0;
        this.rollingPredictions = [];

        if (this.onSequenceUpdateCallback) {
          this.onSequenceUpdateCallback([...this.sequence], currentSign);
        }

        return {
          candidateSign: null,
          stabilityProgress: 0,
          newSignAdded: true,
          isFluctuating: false,
          stabilityMessage: `Confirmed: ${currentSign}`
        };
      }
    }

    return {
      candidateSign: this.candidateSign,
      stabilityProgress: progress,
      newSignAdded: false,
      isFluctuating: false,
      stabilityMessage: `Stabilizing: ${currentSign} (${Math.round(progress * 100)}%)`
    };
  }

  public getSequence(): SequenceItem[] {
    return [...this.sequence];
  }

  public addManualSign(sign: string, confidence = 1.0) {
    const newItem: SequenceItem = {
      id: `${sign}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sign,
      timestamp: Date.now(),
      confidence
    };
    this.sequence.push(newItem);
    this.lastConfirmedSign = sign;
    this.lastConfirmedTime = Date.now();
    if (this.onSequenceUpdateCallback) {
      this.onSequenceUpdateCallback([...this.sequence], sign);
    }
  }

  public undoLastSign(): SequenceItem | undefined {
    if (this.sequence.length === 0) return undefined;
    const removed = this.sequence.pop();
    this.lastConfirmedSign = this.sequence.length > 0 ? this.sequence[this.sequence.length - 1].sign : null;
    if (this.onSequenceUpdateCallback) {
      this.onSequenceUpdateCallback([...this.sequence]);
    }
    return removed;
  }

  public removeSignAtIndex(index: number) {
    if (index >= 0 && index < this.sequence.length) {
      this.sequence.splice(index, 1);
      if (this.onSequenceUpdateCallback) {
        this.onSequenceUpdateCallback([...this.sequence]);
      }
    }
  }

  public clearSequence() {
    this.sequence = [];
    this.stabilityCounter = 0;
    this.candidateSign = null;
    this.lastConfirmedSign = null;
    if (this.onSequenceUpdateCallback) {
      this.onSequenceUpdateCallback([]);
    }
  }
}
