/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Landmark3D, NormalizedHandFeatures, FingerCurlStates, Handedness } from '../types';

export const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm Base Knuckles
  [5, 9], [9, 13], [13, 17]
];

export const FINGER_COLORS = {
  thumb: '#f59e0b',  // amber-500
  index: '#06b6d4',  // cyan-500
  middle: '#3b82f6', // blue-500
  ring: '#8b5cf6',   // violet-500
  pinky: '#ec4899',  // pink-500
  palm: '#10b981',   // emerald-500
  wrist: '#6366f1'   // indigo-500
};

/**
 * Calculates Euclidean distance between two 3D landmarks
 */
export function distance3D(a: Landmark3D, b: Landmark3D): number {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
    Math.pow(a.y - b.y, 2) +
    Math.pow(a.z - b.z, 2)
  );
}

/**
 * Calculates 2D Euclidean distance in the camera image plane (immune to monocular Z noise)
 */
export function distance2D(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

/**
 * Calculates 3D angle between three points (A -> B -> C) in degrees
 */
export function angleBetweenPoints(a: Landmark3D, b: Landmark3D, c: Landmark3D): number {
  const v1 = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const v2 = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

  if (mag1 * mag2 === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

/**
 * Calculates planar 2D angle between three points (A -> B -> C) in degrees.
 * Resilient against monocular depth sensor estimation errors.
 */
export function angleBetweenPoints2D(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };

  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

  if (mag1 * mag2 === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

/**
 * Biomechanical Finger Extension Calculator (Index, Middle, Ring, Pinky)
 * Combines 3 independent kinematic features for maximum precision:
 * 1. Tip-to-Wrist distance ratio vs MCP-to-Wrist
 * 2. Tip-to-MCP distance ratio vs Palm scale
 * 3. Planar joint angles at PIP and DIP joints
 * Returns value in [0.0, 1.0] where 1.0 = fully extended straight, 0.0 = curled into fist/palm.
 */
export function calculateFingerExtension(
  landmarks: Landmark3D[],
  palmScale: number,
  mcpIdx: number,
  pipIdx: number,
  dipIdx: number,
  tipIdx: number
): number {
  const wrist = landmarks[0];
  const mcp = landmarks[mcpIdx];
  const pip = landmarks[pipIdx];
  const dip = landmarks[dipIdx];
  const tip = landmarks[tipIdx];

  // 1. Tip-to-Wrist distance ratio (extended fingers are far from wrist, curled fingers close)
  const tipToWrist = distance2D(tip, wrist);
  const mcpToWrist = distance2D(mcp, wrist) || 0.12;
  const wristRatio = tipToWrist / mcpToWrist;
  // Extended: ratio ~1.6 - 2.1; Curled: ratio ~0.65 - 0.95
  const extWrist = Math.max(0, Math.min(1, (wristRatio - 0.90) / (1.75 - 0.90)));

  // 2. Tip-to-MCP distance relative to palm length
  const tipToMcp = distance2D(tip, mcp);
  const mcpRatio = tipToMcp / (palmScale || 0.15);
  // Extended: ~0.80 - 1.25; Curled: ~0.20 - 0.45
  const extMcp = Math.max(0, Math.min(1, (mcpRatio - 0.35) / (0.90 - 0.35)));

  // 3. Planar 2D joint angle at PIP and DIP
  const pipAngle = angleBetweenPoints2D(mcp, pip, dip);
  const dipAngle = angleBetweenPoints2D(pip, dip, tip);
  const avgAngle = (pipAngle + dipAngle) / 2;
  // Extended: ~160° - 180°; Curled: ~60° - 100°
  const extAngle = Math.max(0, Math.min(1, (avgAngle - 85) / (165 - 85)));

  // Weighted ensemble
  const finalExt = extWrist * 0.45 + extMcp * 0.35 + extAngle * 0.20;
  return Math.max(0.02, Math.min(0.98, finalExt));
}

/**
 * Biomechanical Thumb Extension & Abduction Calculator
 * Evaluates thumb abduction from palm and extension at IP/TIP joints.
 */
export function calculateThumbExtension(
  landmarks: Landmark3D[],
  palmScale: number
): number {
  const wrist = landmarks[0];
  const cmc = landmarks[1];
  const mcp = landmarks[2];
  const ip = landmarks[3];
  const tip = landmarks[4];
  const indexMcp = landmarks[5];
  const pinkyMcp = landmarks[17];

  // Abduction from index finger base
  const tipToIndexMcp = distance2D(tip, indexMcp) / (palmScale || 0.15);
  // Distance from pinky MCP (folded thumb touches ring/pinky base)
  const tipToPinkyMcp = distance2D(tip, pinkyMcp) / (palmScale || 0.15);
  // Distance to wrist
  const tipToWrist = distance2D(tip, wrist) / (palmScale || 0.15);

  // 2D angle at thumb joints
  const mcpAngle = angleBetweenPoints2D(cmc, mcp, ip);
  const ipAngle = angleBetweenPoints2D(mcp, ip, tip);
  const avgAngle = (mcpAngle + ipAngle) / 2;

  // Extended / Thumbs-up: tipToIndexMcp > 0.65, tipToWrist > 0.85, avgAngle > 140°
  // Folded / Inward: tipToIndexMcp < 0.40, tipToPinkyMcp < 0.50
  const extAbduction = Math.max(0, Math.min(1, (tipToIndexMcp - 0.32) / (0.75 - 0.32)));
  const extWrist = Math.max(0, Math.min(1, (tipToWrist - 0.50) / (0.95 - 0.50)));
  const extAngle = Math.max(0, Math.min(1, (avgAngle - 100) / (160 - 100)));

  const finalExt = extAbduction * 0.50 + extWrist * 0.30 + extAngle * 0.20;
  return Math.max(0.02, Math.min(0.98, finalExt));
}

/**
 * History buffer to estimate dynamic hand velocity and oscillation
 */
interface MotionSample {
  wrist: Landmark3D;
  timestamp: number;
}
const recentMotionSamples: MotionSample[] = [];
const MOTION_WINDOW_MS = 600;

export function recordMotionSample(wrist: Landmark3D) {
  const now = Date.now();
  recentMotionSamples.push({ wrist: { ...wrist }, timestamp: now });
  while (recentMotionSamples.length > 0 && now - recentMotionSamples[0].timestamp > MOTION_WINDOW_MS) {
    recentMotionSamples.shift();
  }
}

/**
 * Computes motion speed and direction vector from the recent window
 */
export function computeMotionVector(): { speed: number; direction: [number, number, number]; oscillationX: number; oscillationY: number } {
  if (recentMotionSamples.length < 3) {
    return { speed: 0, direction: [0, 0, 0], oscillationX: 0, oscillationY: 0 };
  }

  const oldest = recentMotionSamples[0];
  const latest = recentMotionSamples[recentMotionSamples.length - 1];
  const dt = (latest.timestamp - oldest.timestamp) / 1000;

  if (dt <= 0) return { speed: 0, direction: [0, 0, 0], oscillationX: 0, oscillationY: 0 };

  const dx = latest.wrist.x - oldest.wrist.x;
  const dy = latest.wrist.y - oldest.wrist.y;
  const dz = latest.wrist.z - oldest.wrist.z;
  const speed = Math.sqrt(dx * dx + dy * dy + dz * dz) / dt;

  // Count directional flips to detect waving or nodding
  let flipsX = 0;
  let flipsY = 0;
  for (let i = 2; i < recentMotionSamples.length; i++) {
    const prevDeltaX = recentMotionSamples[i - 1].wrist.x - recentMotionSamples[i - 2].wrist.x;
    const currDeltaX = recentMotionSamples[i].wrist.x - recentMotionSamples[i - 1].wrist.x;
    if (prevDeltaX * currDeltaX < -0.0001) flipsX++;

    const prevDeltaY = recentMotionSamples[i - 1].wrist.y - recentMotionSamples[i - 2].wrist.y;
    const currDeltaY = recentMotionSamples[i].wrist.y - recentMotionSamples[i - 1].wrist.y;
    if (prevDeltaY * currDeltaY < -0.0001) flipsY++;
  }

  const dirMag = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
  return {
    speed,
    direction: [dx / dirMag, dy / dirMag, dz / dirMag],
    oscillationX: flipsX,
    oscillationY: flipsY
  };
}

/**
 * Checks whether the detected hand is suitable for reliable recognition.
 * Permissive bounds designed to avoid false rejections while ensuring complete hand is visible.
 */
export function checkGestureQuality(
  landmarks: Landmark3D[],
  handedness: Handedness = 'Right',
  motionSpeed: number = 0
): import('../types').GestureQualityCheckResult {
  const issues: string[] = [];

  if (!landmarks || landmarks.length < 21) {
    return {
      isSuitable: false,
      score: 0,
      issues: ['Incomplete hand landmarks (expected 21 points)'],
      recommendation: 'Position your hand inside the camera frame.',
      handSizeRatio: 0,
      motionSpeed: 0,
      isClipped: true,
      visibilityScore: 0
    };
  }

  // Calculate bounding box in normalized [0, 1] screen space
  let minX = 1, maxX = 0, minY = 1, maxY = 0;
  for (const pt of landmarks) {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }

  const boxWidth = maxX - minX;
  const boxHeight = maxY - minY;
  const boxArea = boxWidth * boxHeight;

  // 1. Boundary clipping check (permissive: allows natural placement)
  const borderMargin = 0.015;
  const isClipped = minX <= borderMargin || maxX >= (1 - borderMargin) || minY <= borderMargin || maxY >= (1 - borderMargin);
  if (isClipped) {
    issues.push('Hand touches camera frame border');
  }

  // 2. Hand distance / size check
  let handSizeAdequate = true;
  if (boxArea < 0.003) {
    issues.push('Hand too far from camera');
    handSizeAdequate = false;
  } else if (boxArea > 0.92) {
    issues.push('Hand too close to camera');
    handSizeAdequate = false;
  }

  // 3. Motion stability check
  const isMovingTooFast = motionSpeed > 4.5;
  if (isMovingTooFast) {
    issues.push('Hand moving rapidly');
  }

  // Calculate score (0 to 1)
  let score = 1.0;
  if (isClipped) score -= 0.15;
  if (!handSizeAdequate) score -= 0.20;
  if (isMovingTooFast) score -= 0.15;

  score = Math.max(0.2, Math.min(1.0, score));

  // Determine user recommendation
  let recommendation = 'Hand positioned clearly.';
  if (isClipped) {
    recommendation = 'Keep entire hand within camera view.';
  } else if (boxArea < 0.003) {
    recommendation = 'Move hand slightly closer.';
  } else if (boxArea > 0.92) {
    recommendation = 'Move hand slightly back.';
  } else if (isMovingTooFast) {
    recommendation = 'Hold sign steady.';
  }

  return {
    isSuitable: score >= 0.35,
    score,
    issues,
    recommendation,
    handSizeRatio: boxArea,
    motionSpeed,
    isClipped,
    visibilityScore: isClipped ? 0.85 : 1.0
  };
}

/**
 * Calculates Euclidean and Cosine similarity between two 63D normalized feature arrays.
 * Applies 85% weight to (X, Y) coordinates and 15% to Z, providing high resilience
 * against monocular webcam depth estimation jitter.
 */
export function computeLandmarkSimilarity(sample63: number[], reference63: number[]): number {
  if (!sample63 || !reference63 || sample63.length !== 63 || reference63.length !== 63) {
    return 0;
  }

  let sumSqDiff2D = 0;
  let sumSqDiffZ = 0;
  let dot2D = 0;
  let magA2D = 0;
  let magB2D = 0;

  for (let i = 0; i < 21; i++) {
    const idx = i * 3;
    const ax = sample63[idx];
    const ay = sample63[idx + 1];
    const az = sample63[idx + 2];

    const bx = reference63[idx];
    const by = reference63[idx + 1];
    const bz = reference63[idx + 2];

    const dx = ax - bx;
    const dy = ay - by;
    const dz = az - bz;

    sumSqDiff2D += dx * dx + dy * dy;
    sumSqDiffZ += dz * dz;

    dot2D += ax * bx + ay * by;
    magA2D += ax * ax + ay * ay;
    magB2D += bx * bx + by * by;
  }

  // Mean joint Euclidean distance in 2D normalized space
  const meanDist2D = Math.sqrt(sumSqDiff2D / 21);
  const meanDistZ = Math.sqrt(sumSqDiffZ / 21);

  const euclideanScore2D = Math.max(0, 1 - (meanDist2D / 1.35));
  const euclideanScoreZ = Math.max(0, 1 - (meanDistZ / 0.80));
  const euclideanScore = euclideanScore2D * 0.85 + euclideanScoreZ * 0.15;

  // Cosine similarity
  const denom = Math.sqrt(magA2D) * Math.sqrt(magB2D);
  const cosineScore = denom > 0 ? Math.max(0, (dot2D / denom + 1) / 2) : 0;

  // Weighted fusion
  return Math.min(0.99, Math.max(0, euclideanScore * 0.65 + cosineScore * 0.35));
}

/**
 * Converts 21 raw landmarks into normalized 63-feature vector + geometric hand state.
 * Generates both native relative landmarks and flipped (mirrored along X) landmarks
 * so downstream classification is 100% agnostic to left/right hand usage or camera mirroring.
 */
export function extractNormalizedFeatures(
  landmarks: Landmark3D[],
  handedness: Handedness = 'Right',
  normalizeRotation = true
): NormalizedHandFeatures | null {
  if (!landmarks || landmarks.length < 21) return null;

  const wrist = landmarks[0];
  const indexMCP = landmarks[5];
  const middleMCP = landmarks[9];
  const pinkyMCP = landmarks[17];

  // Palm scale reference distance: average distance from wrist to index & middle MCPs
  const distMiddle = distance2D(wrist, middleMCP);
  const distIndex = distance2D(wrist, indexMCP);
  const palmScale = (distMiddle + distIndex) / 2 || 0.14;

  // Left-hand horizontal mirroring factor so both hands map to same canonical frame
  const xSign = handedness === 'Left' ? -1 : 1;

  // Rotation normalization: compute angle of middleMCP vector relative to vertical-up (0, -1)
  let rotCos = 1;
  let rotSin = 0;
  if (normalizeRotation) {
    const dx = (middleMCP.x - wrist.x) * xSign;
    const dy = middleMCP.y - wrist.y;
    const currentAngle = Math.atan2(dx, -dy);
    rotCos = Math.cos(-currentAngle);
    rotSin = Math.sin(-currentAngle);
  }

  // 63 normalized relative coordinates (scaled, mirrored, and rotation-aligned)
  const relativeLandmarks: number[] = [];
  const flippedRelativeLandmarks: number[] = [];

  for (let i = 0; i < 21; i++) {
    const pt = landmarks[i];
    // Translate relative to wrist and mirror if left hand
    const rawX = (pt.x - wrist.x) * xSign / palmScale;
    const rawY = (pt.y - wrist.y) / palmScale;
    const rawZ = (pt.z - wrist.z) / palmScale;

    // Apply 2D rotation alignment
    const rotX = rawX * rotCos - rawY * rotSin;
    const rotY = rawX * rotSin + rawY * rotCos;

    relativeLandmarks.push(rotX, rotY, rawZ);
    // Flipped version for dual-handedness matching
    flippedRelativeLandmarks.push(-rotX, rotY, rawZ);
  }

  // Calculate ultra-precise finger extension states using biomechanical metrics
  const thumbExt = calculateThumbExtension(landmarks, palmScale);
  const indexExt = calculateFingerExtension(landmarks, palmScale, 5, 6, 7, 8);
  const middleExt = calculateFingerExtension(landmarks, palmScale, 9, 10, 11, 12);
  const ringExt = calculateFingerExtension(landmarks, palmScale, 13, 14, 15, 16);
  const pinkyExt = calculateFingerExtension(landmarks, palmScale, 17, 18, 19, 20);

  const curl: FingerCurlStates = {
    thumb: thumbExt,
    index: indexExt,
    middle: middleExt,
    ring: ringExt,
    pinky: pinkyExt
  };

  // Pinch distances normalized by palmScale
  const thumbTip = landmarks[4];
  const pinchThumbIndex = distance2D(thumbTip, landmarks[8]) / palmScale;
  const pinchThumbMiddle = distance2D(thumbTip, landmarks[12]) / palmScale;
  const pinchThumbRing = distance2D(thumbTip, landmarks[16]) / palmScale;
  const pinchThumbPinky = distance2D(thumbTip, landmarks[20]) / palmScale;

  // Palm normal: vector(Wrist -> IndexMCP) x vector(Wrist -> PinkyMCP)
  const v1 = {
    x: (indexMCP.x - wrist.x) * xSign,
    y: indexMCP.y - wrist.y,
    z: indexMCP.z - wrist.z
  };
  const v2 = {
    x: (pinkyMCP.x - wrist.x) * xSign,
    y: pinkyMCP.y - wrist.y,
    z: pinkyMCP.z - wrist.z
  };

  const nx = v1.y * v2.z - v1.z * v2.y;
  const ny = v1.z * v2.x - v1.x * v2.z;
  const nz = v1.x * v2.y - v1.y * v2.x;
  const normMag = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;

  // Hand direction (wrist to middle MCP)
  const hx = (middleMCP.x - wrist.x) * xSign;
  const hy = middleMCP.y - wrist.y;
  const hz = middleMCP.z - wrist.z;
  const hMag = Math.sqrt(hx * hx + hy * hy + hz * hz) || 1;

  // Update motion tracker
  recordMotionSample(wrist);
  const motion = computeMotionVector();

  return {
    relativeLandmarks,
    flippedRelativeLandmarks,
    curl,
    pinchThumbIndex,
    pinchThumbMiddle,
    pinchThumbRing,
    pinchThumbPinky,
    palmNormal: [nx / normMag, ny / normMag, nz / normMag],
    handDirection: [hx / hMag, hy / hMag, hz / hMag],
    motionSpeed: motion.speed,
    motionDirection: motion.direction
  };
}

/**
 * Draws professional skeleton overlay on canvas
 */
export function drawHandLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark3D[],
  width: number,
  height: number,
  options: {
    handedness?: Handedness;
    signLabel?: string;
    confidence?: number;
    style?: 'neon' | 'soft' | 'minimal';
    mirror?: boolean;
  } = {}
) {
  if (!landmarks || landmarks.length < 21) return;

  const {
    handedness = 'Right',
    signLabel,
    confidence = 0,
    style = 'neon',
    mirror = false
  } = options;

  ctx.save();

  // Convert normalized [0, 1] coords to canvas pixel coordinates
  const points = landmarks.map(lm => ({
    x: (mirror ? (1 - lm.x) : lm.x) * width,
    y: lm.y * height,
    z: lm.z
  }));

  // Determine finger index groups for coloring
  const getPointColor = (index: number) => {
    if (index === 0) return FINGER_COLORS.wrist;
    if (index >= 1 && index <= 4) return FINGER_COLORS.thumb;
    if (index >= 5 && index <= 8) return FINGER_COLORS.index;
    if (index >= 9 && index <= 12) return FINGER_COLORS.middle;
    if (index >= 13 && index <= 16) return FINGER_COLORS.ring;
    if (index >= 17 && index <= 20) return FINGER_COLORS.pinky;
    return '#38bdf8';
  };

  // 1. Draw connecting bones
  HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
    const p1 = points[startIdx];
    const p2 = points[endIdx];

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);

    if (style === 'neon') {
      ctx.lineWidth = 3.5;
      const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      grad.addColorStop(0, getPointColor(startIdx));
      grad.addColorStop(1, getPointColor(endIdx));
      ctx.strokeStyle = grad;
      ctx.shadowColor = getPointColor(endIdx);
      ctx.shadowBlur = 8;
    } else if (style === 'soft') {
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.shadowBlur = 0;
    } else {
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#94a3b8';
      ctx.shadowBlur = 0;
    }

    ctx.stroke();
  });

  // 2. Draw landmark joint spheres
  points.forEach((pt, idx) => {
    ctx.beginPath();
    const isTip = [4, 8, 12, 16, 20].includes(idx);
    const radius = isTip ? 5.5 : idx === 0 ? 6.5 : 3.5;

    ctx.arc(pt.x, pt.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = getPointColor(idx);
    ctx.fill();

    if (isTip) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
  });

  ctx.restore();
}
