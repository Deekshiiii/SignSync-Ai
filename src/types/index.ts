/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Landmark3D {
  x: number;
  y: number;
  z: number;
}

export type Handedness = 'Left' | 'Right';

export interface HandDetectionResult {
  landmarks: Landmark3D[];
  handedness: Handedness;
  score: number;
}

export interface FingerCurlStates {
  thumb: number;   // 0.0 (curled) to 1.0 (fully extended)
  index: number;
  middle: number;
  ring: number;
  pinky: number;
}

export interface NormalizedHandFeatures {
  // 63 normalized relative coordinates (landmarks 0-20 translated to wrist and scaled by palm size)
  relativeLandmarks: number[]; // 21 * 3 = 63
  flippedRelativeLandmarks?: number[]; // 63 values mirrored horizontally
  // Finger curl metrics (0 = curled/fist, 1 = extended)
  curl: FingerCurlStates;
  // Pinch distances relative to palm scale
  pinchThumbIndex: number;
  pinchThumbMiddle: number;
  pinchThumbRing: number;
  pinchThumbPinky: number;
  // Palm normal vector [nx, ny, nz] (indicates palm orientation: facing camera, facing user, up, down, etc.)
  palmNormal: [number, number, number];
  // Hand pointing direction vector from wrist to middle MCP
  handDirection: [number, number, number];
  // Motion vector over recent frames (speed & direction)
  motionSpeed: number;
  motionDirection: [number, number, number];
}

export interface SignDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  instructions: string;
  handPostureDescription: string;
  meaning?: string;
  exampleSentence: string;
  isDynamic: boolean;
  gestureType?: 'Static' | 'Dynamic';
  signLanguage?: string;
  relatedSigns?: string[];
  motionType?: string;
  difficulty: 'Easy' | 'Medium' | 'Intermediate';
  handsRequired?: 1 | 2;
  isFingerspelling?: boolean;
  isNumber?: boolean;
  datasetSource?: string;
}

export type RecognitionState = 'CONFIDENT' | 'UNCERTAIN' | 'UNKNOWN' | 'AMBIGUOUS';

export interface GestureQualityCheckResult {
  isSuitable: boolean;
  score: number; // 0 to 1
  issues: string[];
  recommendation: string;
  handSizeRatio: number;
  motionSpeed: number;
  isClipped: boolean;
  visibilityScore: number;
}

export interface PredictionResult {
  sign: string;
  confidence: number; // 0 to 1
  isConfident: boolean; // meets confident criteria
  state: RecognitionState;
  decision: 'ACCEPT' | 'UNCERTAIN' | 'REJECT';
  handedness: Handedness;
  handsDetected?: number; // 1 or 2
  topCandidates: { sign: string; score: number }[];
  margin: number; // score difference between top 1 and top 2
  referenceSimilarity: number; // similarity against stored reference exemplar (0 to 1)
  gestureQuality: GestureQualityCheckResult;
  rejectionReason?: string;
  isAmbiguous?: boolean;
  ambiguousReason?: string;
  whyBreakdown?: {
    fingerConfigMatched: boolean;
    palmOrientationMatched: boolean;
    handPositionMatched: boolean;
    temporalPatternMatched: boolean;
    stableAcrossFrames: boolean;
  };
  landmarks?: Landmark3D[];
  secondaryLandmarks?: Landmark3D[];
  features?: NormalizedHandFeatures;
  secondaryFeatures?: NormalizedHandFeatures;
  timestamp: number;
  feedbackMessage?: string;
  qualityMetrics?: {
    handShape: number;
    position: number;
    orientation: number;
    movement: number;
  };
  contextNote?: string;
  modelType?: string;
}

export interface SequenceItem {
  id: string;
  sign: string;
  timestamp: number;
  confidence: number;
  locked?: boolean;
}

export interface TranslationHistoryItem {
  id: string;
  timestamp: number;
  signs: string[];
  generatedSentence: string;
  confidence: number;
  grammarMode: 'rule-based' | 'ai-enhanced';
  targetLanguage?: SupportedLanguage;
  translatedText?: string;
}

export type SupportedLanguage = 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export type AppView = 
  | 'home' 
  | 'identify'
  | 'translate' 
  | 'conversation' 
  | 'coach' 
  | 'copilot' 
  | 'mysigns' 
  | 'languages' 
  | 'scene' 
  | 'emergency' 
  | 'insights' 
  | 'history' 
  | 'privacy' 
  | 'settings';

export interface AppSettings {
  confidenceThreshold: number; // e.g. 0.82 for confident state
  minMarginThreshold: number;   // e.g. 0.15 difference between top1 and top2
  minReferenceSimilarity: number; // e.g. 0.75 canonical exemplar similarity
  stabilityFrames: number;      // frames sign must be held (e.g. 5-7 frames)
  debugMode: boolean;           // Real-time developer debug HUD
  autoSpeak: boolean;           // speak sentence automatically when confirmed
  speechRate: number;           // 0.5 to 1.5
  speechPitch: number;          // 0.5 to 1.5
  speechVoice: string;          // voice URI or name
  mirrorVideo: boolean;         // mirror preview
  showSkeleton: boolean;        // draw hand skeleton
  skeletonStyle: 'neon' | 'soft' | 'minimal';
  inputLanguage: SupportedLanguage;
  outputLanguage: SupportedLanguage;
  contextActive: boolean;       // AI conversation memory enabled
  localProcessingOnly: boolean; // Local on-device vs cloud
  accessibilityMode: boolean;   // Simplified high-contrast layout
  largeText: boolean;
  reducedMotion: boolean;
  captionSize: 'normal' | 'large' | 'extra-large';
}

export interface UserCorrectionRecord {
  id: string;
  timestamp: number;
  predictedSign: string;
  actualSign: string;
  confidence: number;
  handedness: Handedness;
}

export interface CoachEvaluation {
  similarity: number;           // 0-100%
  handPositionCheck: boolean;
  movementCheck: boolean;
  orientationCheck: boolean;
  fingerCurlsCheck: boolean;
  tips: string[];
  isSuccess: boolean;
}

export interface ConversationMessage {
  id: string;
  sender: 'signer' | 'speaker' | 'assistant';
  senderName: string;
  text: string;
  translatedText?: string;
  sourceLang: SupportedLanguage;
  targetLang: SupportedLanguage;
  signs?: string[];
  timestamp: number;
  confidence?: number;
}

export interface CustomSign {
  id: string;
  name: string;
  meaning: string;
  language: string;
  sampleCount: number;
  recordedAt: number;
  accuracy: number;
  category: string;
}

export interface SceneDetection {
  id: string;
  objectName: string;
  confidence: number;
  category: 'transit' | 'medical' | 'civic' | 'danger' | 'person' | 'facility';
  icon: string;
  suggestedSignPrompt?: string;
}

export interface ExplainableAIResult {
  sign: string;
  confidence: number;
  handShapeMatch: string;
  orientationMatch: string;
  movementPatternMatch: string;
  temporalSequenceMatch: string;
  contextSupport: string;
  possibleAlternates: { sign: string; probability: number }[];
}
