/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Landmark3D, Handedness } from '../types';

export interface RecordedSample {
  id: string;
  signId: string;
  timestamp: number;
  handedness: Handedness;
  landmarks: Landmark3D[];
  normalizedVector: number[]; // 63 values
  metadata?: {
    cameraDistance?: 'close' | 'medium' | 'far';
    lighting?: 'bright' | 'normal' | 'dim';
  };
}

export interface DatasetStats {
  totalSamples: number;
  signCounts: Record<string, number>;
  lastUpdated: number;
}

/**
 * Standard Canonical Sign Finger Curl Map
 * Values represent finger extension: 1.0 = fully extended straight, 0.0 = fully curled into fist/palm.
 * Array format: [Thumb, Index, Middle, Ring, Pinky]
 */
export const CANONICAL_SIGN_CURL_MAP: Record<string, [number, number, number, number, number]> = {
  // Numbers (0 - 10)
  NUM_0: [0.40, 0.45, 0.45, 0.45, 0.45], // O-shape oval pinch
  NUM_1: [0.20, 0.95, 0.15, 0.15, 0.15], // Index only
  NUM_2: [0.20, 0.95, 0.95, 0.15, 0.15], // Index + Middle (V shape)
  NUM_3: [0.90, 0.95, 0.95, 0.15, 0.15], // Thumb + Index + Middle
  NUM_4: [0.15, 0.95, 0.95, 0.95, 0.95], // 4 fingers up, thumb folded
  NUM_5: [0.95, 0.95, 0.95, 0.95, 0.95], // Open 5 fingers
  NUM_6: [0.50, 0.95, 0.95, 0.95, 0.25], // Thumb touches pinky
  NUM_7: [0.50, 0.95, 0.95, 0.25, 0.95], // Thumb touches ring
  NUM_8: [0.50, 0.95, 0.25, 0.95, 0.95], // Thumb touches middle
  NUM_9: [0.50, 0.25, 0.95, 0.95, 0.95], // Thumb touches index
  NUM_10: [0.95, 0.15, 0.15, 0.15, 0.15], // Thumbs up / shaking fist

  // Core ISL Vocabulary
  HELLO: [0.85, 0.95, 0.95, 0.95, 0.90],
  NAMASTE: [0.90, 0.95, 0.95, 0.95, 0.95],
  GOOD_MORNING: [0.90, 0.90, 0.85, 0.85, 0.80],
  GOOD_NIGHT: [0.50, 0.50, 0.50, 0.50, 0.50],
  WELCOME: [0.85, 0.95, 0.95, 0.95, 0.90],
  BYE: [0.80, 0.95, 0.95, 0.95, 0.90],
  WATER: [0.20, 0.95, 0.95, 0.95, 0.15], // W-shape: Index, Middle, Ring up
  FOOD: [0.45, 0.45, 0.45, 0.45, 0.45], // Pinch fingertips to thumb
  EAT: [0.45, 0.45, 0.45, 0.45, 0.45],
  HELP: [0.90, 0.15, 0.15, 0.15, 0.15], // Thumbs-up fist on flat palm
  PLEASE: [0.85, 0.95, 0.95, 0.95, 0.90],
  THANK_YOU: [0.85, 0.95, 0.95, 0.95, 0.90],
  SORRY: [0.25, 0.15, 0.15, 0.15, 0.15], // Closed fist rubbing chest
  YES: [0.85, 0.15, 0.15, 0.15, 0.15], // Nodding fist
  NO: [0.45, 0.45, 0.45, 0.15, 0.15], // Snap index + middle against thumb
  TOILET: [0.60, 0.15, 0.15, 0.15, 0.15], // T-hand fist
  MEDICINE: [0.25, 0.15, 0.85, 0.15, 0.15], // Middle finger rubbing palm
  HOME: [0.85, 0.95, 0.95, 0.95, 0.90], // Roof shape
  TIME: [0.20, 0.95, 0.15, 0.15, 0.15], // Pointing to wrist
  WHAT: [0.35, 0.85, 0.15, 0.15, 0.15], // Index finger wiggling
  WHERE: [0.85, 0.95, 0.95, 0.95, 0.90], // Palms facing up
  WHY: [0.90, 0.15, 0.15, 0.15, 0.90], // Y-shape: Thumb & pinky out
  HOW: [0.50, 0.50, 0.50, 0.50, 0.50],
  I: [0.20, 0.95, 0.15, 0.15, 0.15], // Index pointing to chest
  YOU: [0.20, 0.95, 0.15, 0.15, 0.15], // Index pointing forward
  WE: [0.20, 0.95, 0.15, 0.15, 0.15], // Index arcing across chest
  STOP: [0.90, 0.95, 0.95, 0.95, 0.95], // Open palm forward
  WAIT: [0.75, 0.85, 0.85, 0.85, 0.80],
  DRINK: [0.65, 0.65, 0.65, 0.65, 0.65], // C-cup shape
  SLEEP: [0.40, 0.35, 0.35, 0.35, 0.35],
  WORK: [0.20, 0.15, 0.15, 0.15, 0.15], // Fists tapping
  EMERGENCY: [0.80, 0.65, 0.65, 0.65, 0.65],
  DOCTOR: [0.85, 0.90, 0.15, 0.15, 0.15], // L-shape feeling pulse
  HOSPITAL: [0.85, 0.95, 0.95, 0.15, 0.15], // Cross gesture
  PAIN: [0.20, 0.95, 0.15, 0.15, 0.15],
  MOTHER: [0.90, 0.95, 0.95, 0.95, 0.95],
  FATHER: [0.90, 0.95, 0.95, 0.95, 0.95],
  FRIEND: [0.35, 0.75, 0.15, 0.15, 0.15],
  HAPPY: [0.85, 0.95, 0.95, 0.95, 0.90],
  FINE: [0.85, 0.95, 0.95, 0.95, 0.90],

  // Fingerspelling (Alphabet A - Z)
  FS_A: [0.90, 0.15, 0.15, 0.15, 0.15], // Fist, thumb resting alongside
  FS_B: [0.15, 0.95, 0.95, 0.95, 0.95], // 4 fingers up, thumb tucked across
  FS_C: [0.45, 0.45, 0.45, 0.45, 0.45], // Curved C shape
  FS_D: [0.35, 0.95, 0.25, 0.25, 0.25], // Index pointing up, O with others
  FS_E: [0.25, 0.25, 0.25, 0.25, 0.25], // Claw/curled knuckles
  FS_F: [0.35, 0.35, 0.95, 0.95, 0.95], // OK sign: thumb touches index, 3 up
  FS_G: [0.85, 0.90, 0.15, 0.15, 0.15], // Thumb & index pointing sideways
  FS_H: [0.20, 0.95, 0.95, 0.15, 0.15], // Index + middle pointing horizontal
  FS_I: [0.15, 0.15, 0.15, 0.15, 0.95], // Pinky upright only
  FS_J: [0.15, 0.15, 0.15, 0.15, 0.95], // Pinky tracing J
  FS_K: [0.85, 0.95, 0.90, 0.15, 0.15], // V-hand with thumb between
  FS_L: [0.90, 0.95, 0.15, 0.15, 0.15], // L-shape: Thumb & index extended
  FS_M: [0.20, 0.20, 0.20, 0.20, 0.15], // Thumb under 3 fingers
  FS_N: [0.20, 0.20, 0.20, 0.15, 0.15], // Thumb under 2 fingers
  FS_O: [0.40, 0.40, 0.40, 0.40, 0.40], // O circle
  FS_P: [0.85, 0.95, 0.90, 0.15, 0.15], // Downward K
  FS_Q: [0.85, 0.90, 0.15, 0.15, 0.15], // Downward G
  FS_R: [0.20, 0.95, 0.95, 0.15, 0.15], // Crossed index & middle
  FS_S: [0.20, 0.15, 0.15, 0.15, 0.15], // Fist with thumb across front
  FS_T: [0.25, 0.20, 0.15, 0.15, 0.15], // Thumb tucked under index
  FS_U: [0.20, 0.95, 0.95, 0.15, 0.15], // Index + middle together
  FS_V: [0.20, 0.95, 0.95, 0.15, 0.15], // Index + middle spread
  FS_W: [0.20, 0.95, 0.95, 0.95, 0.15], // Index, middle, ring up
  FS_X: [0.20, 0.45, 0.15, 0.15, 0.15], // Hooked index
  FS_Y: [0.90, 0.15, 0.15, 0.15, 0.90], // Thumb & pinky out (shaka)
  FS_Z: [0.20, 0.95, 0.15, 0.15, 0.15]  // Index tracing Z
};

/**
 * Generates anatomically accurate, normalized canonical 21 3D landmarks for a given sign.
 * Matches standard MediaPipe hand landmark geometry with authentic palm scale and finger proportions.
 */
export function generateCanonicalLandmarks(signId: string, timeSec: number = 0): Landmark3D[] {
  // Base wrist centered in view: screen coordinates [0, 1]
  const baseWrist: Landmark3D = { x: 0.50, y: 0.72, z: 0 };
  const landmarks: Landmark3D[] = [];

  // Normalize sign ID key
  const cleanKey = signId.toUpperCase().replace(/\s+/g, '_');
  const targetCurls = CANONICAL_SIGN_CURL_MAP[cleanKey] || 
                      CANONICAL_SIGN_CURL_MAP[signId] || 
                      [0.85, 0.95, 0.95, 0.95, 0.90]; // default open hand

  // targetCurls: 1.0 = extended straight, 0.0 = curled into palm
  const thumbExt = targetCurls[0];
  const indexExt = targetCurls[1];
  const middleExt = targetCurls[2];
  const ringExt = targetCurls[3];
  const pinkyExt = targetCurls[4];

  // Dynamic kinematic oscillations for simulated feed & motion bonuses
  let oscX = 0;
  let oscY = 0;
  if (['HELLO', 'BYE', 'TOILET', 'NUM_10', 'EMERGENCY', 'WHAT'].includes(cleanKey)) {
    oscX = Math.sin(timeSec * 5) * 0.035;
  } else if (['YES', 'NOD'].includes(cleanKey)) {
    oscY = Math.sin(timeSec * 6) * 0.03;
  } else if (['WATER', 'FOOD', 'EAT', 'TIME'].includes(cleanKey)) {
    oscY = Math.sin(timeSec * 4) * 0.015;
  } else if (['PLEASE', 'THANK_YOU', 'SORRY'].includes(cleanKey)) {
    oscY = Math.sin(timeSec * 3) * 0.02;
  }

  // 0: Wrist
  landmarks.push({
    x: baseWrist.x + oscX,
    y: baseWrist.y + oscY,
    z: baseWrist.z
  });

  // Natural palm MCP knuckles (proportional to palm scale ~0.14)
  const cmc1 = { x: baseWrist.x - 0.055 + oscX, y: baseWrist.y - 0.050 + oscY, z: -0.005 };
  const mcp5 = { x: baseWrist.x - 0.045 + oscX, y: baseWrist.y - 0.135 + oscY, z: 0 };
  const mcp9 = { x: baseWrist.x - 0.005 + oscX, y: baseWrist.y - 0.145 + oscY, z: 0 };
  const mcp13 = { x: baseWrist.x + 0.035 + oscX, y: baseWrist.y - 0.135 + oscY, z: 0 };
  const mcp17 = { x: baseWrist.x + 0.070 + oscX, y: baseWrist.y - 0.115 + oscY, z: 0 };

  // --- 1. THUMB (1, 2, 3, 4) ---
  // When extended (thumbExt ~ 1.0): thumb points outward to the left (x < wrist.x)
  // When curled/folded (thumbExt ~ 0.0): thumb tucks across palm toward ring/pinky base
  const thumbMCP = {
    x: cmc1.x - 0.035 * thumbExt + 0.015 * (1 - thumbExt),
    y: cmc1.y - 0.040 * thumbExt - 0.015 * (1 - thumbExt),
    z: cmc1.z + 0.010
  };

  const thumbIP = {
    x: thumbMCP.x - 0.035 * thumbExt + 0.035 * (1 - thumbExt),
    y: thumbMCP.y - 0.035 * thumbExt + 0.010 * (1 - thumbExt),
    z: thumbMCP.z + 0.010
  };

  const thumbTIP = {
    x: thumbIP.x - 0.030 * thumbExt + 0.035 * (1 - thumbExt),
    y: thumbIP.y - 0.030 * thumbExt + 0.015 * (1 - thumbExt),
    z: thumbIP.z + 0.010
  };

  landmarks.push(cmc1, thumbMCP, thumbIP, thumbTIP); // Indices 1, 2, 3, 4

  // Helper to generate finger joints along unit direction vector with proper anatomical curl
  const makeArticulatedFinger = (
    mcp: Landmark3D,
    unitDir: { x: number; y: number },
    extFactor: number, // 1.0 = straight up, 0.0 = curled into palm
    segmentLengths: [number, number, number]
  ): Landmark3D[] => {
    // curlFactor: 0.0 = straight, 1.0 = curled
    const curl = Math.max(0, Math.min(1, 1 - extFactor));

    // Proximal joint (PIP): extends along unitDir, tilts slightly forward as it curls
    const pip = {
      x: mcp.x + unitDir.x * segmentLengths[0] * (1 - curl * 0.25),
      y: mcp.y + unitDir.y * segmentLengths[0] * (1 - curl * 0.35),
      z: mcp.z + 0.025 * curl
    };

    // Intermediate joint (DIP): bends sharply toward wrist (+y) when curled
    const dip = {
      x: pip.x + unitDir.x * segmentLengths[1] * (1 - curl) - 0.005 * curl,
      y: pip.y + unitDir.y * segmentLengths[1] * (1 - curl) + segmentLengths[1] * 0.85 * curl,
      z: pip.z + 0.030 * curl
    };

    // Distal joint (TIP): curls completely down touching palm base
    const tip = {
      x: dip.x + unitDir.x * segmentLengths[2] * (1 - curl) - 0.005 * curl,
      y: dip.y + unitDir.y * segmentLengths[2] * (1 - curl) + segmentLengths[2] * 0.90 * curl,
      z: dip.z + 0.015 * curl
    };

    return [pip, dip, tip];
  };

  // --- 2. INDEX FINGER (5, 6, 7, 8) ---
  landmarks.push(mcp5);
  const indexPoints = makeArticulatedFinger(
    mcp5,
    { x: -0.12, y: -0.99 },
    indexExt,
    [0.048, 0.038, 0.028]
  );
  landmarks.push(...indexPoints);

  // --- 3. MIDDLE FINGER (9, 10, 11, 12) ---
  landmarks.push(mcp9);
  const middlePoints = makeArticulatedFinger(
    mcp9,
    { x: 0.0, y: -1.0 },
    middleExt,
    [0.054, 0.042, 0.032]
  );
  landmarks.push(...middlePoints);

  // --- 4. RING FINGER (13, 14, 15, 16) ---
  landmarks.push(mcp13);
  const ringPoints = makeArticulatedFinger(
    mcp13,
    { x: 0.12, y: -0.99 },
    ringExt,
    [0.048, 0.038, 0.028]
  );
  landmarks.push(...ringPoints);

  // --- 5. PINKY FINGER (17, 18, 19, 20) ---
  landmarks.push(mcp17);
  const pinkyPoints = makeArticulatedFinger(
    mcp17,
    { x: 0.24, y: -0.97 },
    pinkyExt,
    [0.038, 0.030, 0.024]
  );
  landmarks.push(...pinkyPoints);

  return landmarks;
}

// Local storage dataset key
const DATASET_STORAGE_KEY = 'signsync_custom_dataset_v1';

export class CustomDatasetManager {
  private samples: RecordedSample[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(DATASET_STORAGE_KEY);
        if (stored) {
          this.samples = JSON.parse(stored);
        }
      }
    } catch (e) {
      console.warn('Could not read dataset from storage', e);
    }
  }

  public saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(DATASET_STORAGE_KEY, JSON.stringify(this.samples));
      }
    } catch (e) {
      console.warn('Could not save dataset to storage', e);
    }
  }

  public addSample(sample: Omit<RecordedSample, 'id' | 'timestamp'>): RecordedSample {
    const newSample: RecordedSample = {
      ...sample,
      id: `sample-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now()
    };
    this.samples.push(newSample);
    this.saveToStorage();
    return newSample;
  }

  public deleteSample(sampleId: string): boolean {
    const initialLen = this.samples.length;
    this.samples = this.samples.filter(s => s.id !== sampleId);
    if (this.samples.length !== initialLen) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public getSamplesForSign(signId: string): RecordedSample[] {
    return this.samples.filter(s => s.signId.toUpperCase() === signId.toUpperCase());
  }

  public getAllSamples(): RecordedSample[] {
    return [...this.samples];
  }

  public getStats(): DatasetStats {
    const signCounts: Record<string, number> = {};
    for (const s of this.samples) {
      signCounts[s.signId] = (signCounts[s.signId] || 0) + 1;
    }
    return {
      totalSamples: this.samples.length,
      signCounts,
      lastUpdated: this.samples.length > 0 ? this.samples[this.samples.length - 1].timestamp : Date.now()
    };
  }

  public clearDataset(): void {
    this.samples = [];
    this.saveToStorage();
  }

  public clearSignSamples(signId: string): void {
    this.samples = this.samples.filter(s => s.signId.toUpperCase() !== signId.toUpperCase());
    this.saveToStorage();
  }

  public exportJSON(): string {
    return JSON.stringify({
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      stats: this.getStats(),
      samples: this.samples
    }, null, 2);
  }
}

export const datasetManager = new CustomDatasetManager();
