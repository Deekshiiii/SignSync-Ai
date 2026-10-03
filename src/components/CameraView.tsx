/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Landmark3D, Handedness, AppSettings, PredictionResult } from '../types';
import { drawHandLandmarks } from '../services/landmarks';
import { classifyHandGesture } from '../services/classifier';
import { generateCanonicalLandmarks } from '../services/sampleDataset';
import { islDatasetAdapter } from '../services/ISLDatasetAdapter';
import { 
  Camera, 
  CameraOff, 
  FlipHorizontal, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle2,
  Sparkles,
  Sliders,
  Minimize2,
  Maximize2,
  Activity,
  Layers
} from 'lucide-react';

// Declarations for global MediaPipe objects loaded via CDN
declare global {
  interface Window {
    Hands?: any;
    Camera?: any;
  }
}

interface CameraViewProps {
  onPrediction: (result: PredictionResult) => void;
  settings: AppSettings;
  activeSignHint?: string;
  isCoachingMode?: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onPrediction,
  settings,
  activeSignHint,
  isCoachingMode = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [simulatedSign, setSimulatedSign] = useState<string>('HELLO');
  const [livePrediction, setLivePrediction] = useState<PredictionResult | null>(null);
  const [isDebugOpen, setIsDebugOpen] = useState<boolean>(true);
  const [isDebugMinimized, setIsDebugMinimized] = useState<boolean>(false);

  const handsInstanceRef = useRef<any>(null);
  const cameraInstanceRef = useRef<any>(null);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const simTimeRef = useRef<number>(0);
  const simFpsTimeRef = useRef<number>(performance.now());
  const simFrameCountRef = useRef<number>(0);
  const onPredictionRef = useRef(onPrediction);
  onPredictionRef.current = onPrediction;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const activeSignHintRef = useRef(activeSignHint);
  activeSignHintRef.current = activeSignHint;
  const lastDispatchTimeRef = useRef<number>(0);
  const lastHadHandRef = useRef<boolean>(false);

  // Discover video input devices once on mount
  useEffect(() => {
    let isMounted = true;
    async function getDevices() {
      try {
        if (navigator.mediaDevices?.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevs = devices.filter(d => d.kind === 'videoinput');
          if (isMounted) {
            setAvailableDevices(videoDevs);
            setSelectedDeviceId(prev => (prev || (videoDevs.length > 0 ? videoDevs[0].deviceId : '')));
          }
        }
      } catch (err) {
        console.warn('Could not list media devices:', err);
      }
    }
    getDevices();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle incoming results from MediaPipe Hands
  const handleMediaPipeResults = useCallback((results: any) => {
    // Calculate FPS at most once a second
    const now = performance.now();
    frameCountRef.current++;
    if (now - lastFrameTimeRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const currSettings = settingsRef.current;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      lastHadHandRef.current = true;
      const numHands = results.multiHandLandmarks.length;

      const rawLms1 = results.multiHandLandmarks[0];
      const handedness1: Handedness = results.multiHandedness?.[0]?.label === 'Left' ? 'Left' : 'Right';
      const landmarks1: Landmark3D[] = rawLms1.map((lm: any) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z ?? 0
      }));

      let primaryLandmarks = landmarks1;
      let primaryHandedness: Handedness = handedness1;
      let secondaryLandmarks: Landmark3D[] | undefined = undefined;
      let secondaryHandedness: Handedness | undefined = undefined;

      if (numHands >= 2 && results.multiHandLandmarks[1]) {
        const rawLms2 = results.multiHandLandmarks[1];
        const handedness2: Handedness = results.multiHandedness?.[1]?.label === 'Left' ? 'Left' : 'Right';
        const landmarks2: Landmark3D[] = rawLms2.map((lm: any) => ({
          x: lm.x,
          y: lm.y,
          z: lm.z ?? 0
        }));

        if (handedness2 === 'Right' && handedness1 === 'Left') {
          primaryLandmarks = landmarks2;
          primaryHandedness = 'Right';
          secondaryLandmarks = landmarks1;
          secondaryHandedness = 'Left';
        } else {
          secondaryLandmarks = landmarks2;
          secondaryHandedness = handedness2;
        }

        // Draw skeleton for BOTH hands (Requirement 9)
        if (currSettings.showSkeleton) {
          drawHandLandmarks(ctx, landmarks1, canvas.width, canvas.height, {
            handedness: handedness1,
            style: currSettings.skeletonStyle,
            mirror: currSettings.mirrorVideo
          });
          drawHandLandmarks(ctx, landmarks2, canvas.width, canvas.height, {
            handedness: handedness2,
            style: currSettings.skeletonStyle,
            mirror: currSettings.mirrorVideo
          });
        }
      } else {
        if (currSettings.showSkeleton) {
          drawHandLandmarks(ctx, primaryLandmarks, canvas.width, canvas.height, {
            handedness: primaryHandedness,
            style: currSettings.skeletonStyle,
            mirror: currSettings.mirrorVideo
          });
        }
      }

      // Classify gesture with conservative thresholds and reference comparison
      const prediction = classifyHandGesture(
        primaryLandmarks, 
        primaryHandedness, 
        currSettings.confidenceThreshold,
        currSettings.minMarginThreshold,
        currSettings.minReferenceSimilarity,
        secondaryLandmarks,
        secondaryHandedness
      );

      // Throttle React state dispatch to ~10 FPS to prevent React update depth limit
      if (now - lastDispatchTimeRef.current >= 90) {
        lastDispatchTimeRef.current = now;
        setLivePrediction(prediction);
        onPredictionRef.current(prediction);
      }
    } else {
      // If we just lost tracking, send one UNKNOWN update immediately
      if (lastHadHandRef.current) {
        lastHadHandRef.current = false;
        lastDispatchTimeRef.current = now;
        const emptyQuality = {
          isSuitable: false,
          score: 0,
          issues: ['No hand in frame'],
          recommendation: 'Position your hand inside the frame',
          handSizeRatio: 0,
          motionSpeed: 0,
          isClipped: false,
          visibilityScore: 0
        };
        const unkPrediction: PredictionResult = {
          sign: 'UNKNOWN',
          confidence: 0,
          isConfident: false,
          state: 'UNKNOWN',
          decision: 'REJECT',
          handedness: 'Right',
          topCandidates: [],
          margin: 0,
          referenceSimilarity: 0,
          gestureQuality: emptyQuality,
          timestamp: Date.now(),
          feedbackMessage: 'No hand detected in camera frame.'
        };
        setLivePrediction(unkPrediction);
        onPredictionRef.current(unkPrediction);
      } else if (now - lastDispatchTimeRef.current >= 1500) {
        // Slow idle heartbeat (every 1.5 seconds) to avoid continuous re-render churn
        lastDispatchTimeRef.current = now;
        const idleQuality = {
          isSuitable: false,
          score: 0,
          issues: ['Awaiting hand'],
          recommendation: 'Position your hand inside the frame',
          handSizeRatio: 0,
          motionSpeed: 0,
          isClipped: false,
          visibilityScore: 0
        };
        const idlePrediction: PredictionResult = {
          sign: 'UNKNOWN',
          confidence: 0,
          isConfident: false,
          state: 'UNKNOWN',
          decision: 'REJECT',
          handedness: 'Right',
          topCandidates: [],
          margin: 0,
          referenceSimilarity: 0,
          gestureQuality: idleQuality,
          timestamp: Date.now(),
          feedbackMessage: 'Position your hand inside the camera frame.'
        };
        setLivePrediction(idlePrediction);
        onPredictionRef.current(idlePrediction);
      }
    }
  }, []);

  // Initialize MediaPipe Hands
  useEffect(() => {
    if (isSimulated) return;

    let checkInterval: any = null;

    const setupHands = () => {
      if (typeof window !== 'undefined' && window.Hands) {
        try {
          const hands = new window.Hands({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
          });

          hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });

          hands.onResults(handleMediaPipeResults);
          handsInstanceRef.current = hands;
          return true;
        } catch (e) {
          console.error('Error instantiating MediaPipe Hands:', e);
        }
      }
      return false;
    };

    if (!setupHands()) {
      checkInterval = setInterval(() => {
        if (setupHands()) {
          clearInterval(checkInterval);
        }
      }, 500);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (handsInstanceRef.current) {
        handsInstanceRef.current.close?.();
      }
    };
  }, [handleMediaPipeResults, isSimulated]);

  // Start or Stop Camera Feed
  useEffect(() => {
    if (isSimulated || !isCameraActive) {
      if (cameraInstanceRef.current) {
        cameraInstanceRef.current.stop?.();
        cameraInstanceRef.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      return;
    }

    let isMounted = true;

    async function initCamera() {
      try {
        setErrorMessage(null);
        const constraints: MediaStreamConstraints = {
          audio: false,
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
            : { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        setHasPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();

          // Match canvas size to video aspect
          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth || 640;
            canvasRef.current.height = videoRef.current.videoHeight || 480;
          }

          // Use MediaPipe Camera helper or custom loop
          if (window.Camera && handsInstanceRef.current) {
            const cam = new window.Camera(videoRef.current, {
              onFrame: async () => {
                if (videoRef.current && handsInstanceRef.current && isCameraActive) {
                  await handsInstanceRef.current.send({ image: videoRef.current });
                }
              },
              width: 640,
              height: 480
            });
            cam.start();
            cameraInstanceRef.current = cam;
          } else {
            // Fallback frame processor loop
            let isRunning = true;
            const processLoop = async () => {
              if (!isRunning || !isCameraActive) return;
              if (videoRef.current && handsInstanceRef.current && videoRef.current.readyState >= 2) {
                try {
                  await handsInstanceRef.current.send({ image: videoRef.current });
                } catch (e) {
                  // Ignore frame send transients
                }
              }
              animFrameRef.current = requestAnimationFrame(processLoop);
            };
            processLoop();
          }
        }
      } catch (err: any) {
        console.error('Camera initialization failed:', err);
        setHasPermission(false);
        setErrorMessage(
          err.name === 'NotAllowedError'
            ? 'Camera access denied by user. Please grant camera permission in your browser or use simulation mode.'
            : err.name === 'NotFoundError'
            ? 'No webcam device found on this system. You can switch to simulation mode.'
            : `Camera error: ${err.message || 'Unable to access webcam'}`
        );
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (cameraInstanceRef.current) {
        cameraInstanceRef.current.stop?.();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive, selectedDeviceId, isSimulated]);

  // Simulation mode loop (runs when webcam is unavailable or user chooses simulation)
  useEffect(() => {
    if (!isSimulated) return;

    let simAnimId: number;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 640;
      canvas.height = 480;
    }

    const simLoop = () => {
      const now = performance.now();
      simFrameCountRef.current++;
      if (now - simFpsTimeRef.current >= 1000) {
        setFps(simFrameCountRef.current);
        simFrameCountRef.current = 0;
        simFpsTimeRef.current = now;
      }

      simTimeRef.current += 0.035;
      const targetSign = activeSignHintRef.current || simulatedSign;
      const landmarks = generateCanonicalLandmarks(targetSign, simTimeRef.current);
      const currSettings = settingsRef.current;

      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw dark studio backdrop for simulation
          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Grid pattern
          ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
          ctx.lineWidth = 1;
          for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
          for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }

          const prediction = classifyHandGesture(
            landmarks,
            'Right',
            currSettings.confidenceThreshold,
            currSettings.minMarginThreshold,
            currSettings.minReferenceSimilarity
          );

          if (currSettings.showSkeleton) {
            drawHandLandmarks(ctx, landmarks, canvas.width, canvas.height, {
              handedness: 'Right',
              signLabel: prediction.isConfident ? prediction.sign : undefined,
              confidence: prediction.confidence,
              style: currSettings.skeletonStyle,
              mirror: currSettings.mirrorVideo
            });
          }

          if (now - lastDispatchTimeRef.current >= 100) {
            lastDispatchTimeRef.current = now;
            setLivePrediction(prediction);
            onPredictionRef.current(prediction);
          }
        }
      }

      simAnimId = requestAnimationFrame(simLoop);
    };

    simAnimId = requestAnimationFrame(simLoop);

    return () => {
      cancelAnimationFrame(simAnimId);
    };
  }, [isSimulated, simulatedSign]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl shadow-slate-950/50">
      {/* Video & Skeleton Canvas Container */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[520px] bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Real Video Element */}
        {!isSimulated && (
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover transition-transform duration-200 ${
              settings.mirrorVideo ? '-scale-x-100' : 'scale-x-100'
            } ${!isCameraActive ? 'opacity-0' : 'opacity-100'}`}
          />
        )}

        {/* MediaPipe Skeleton Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
            isSimulated && settings.mirrorVideo ? '-scale-x-100' : ''
          }`}
        />

        {/* Camera Permission / Error Banner */}
        {errorMessage && !isSimulated && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/90 text-center backdrop-blur-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-lg shadow-amber-500/10">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-100 mb-1">Camera Access Notice</h4>
            <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">{errorMessage}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => {
                  setIsSimulated(true);
                  setErrorMessage(null);
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Switch to Gesture Simulator</span>
              </button>
              <button
                onClick={() => setIsCameraActive(!isCameraActive)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                Retry Camera
              </button>
            </div>
          </div>
        )}

        {/* Camera Off Overlay */}
        {!isCameraActive && !isSimulated && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400">
            <CameraOff className="w-12 h-12 mb-3 text-slate-600" />
            <p className="text-sm font-semibold">Camera is paused</p>
            <button
              onClick={() => setIsCameraActive(true)}
              className="mt-3 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition"
            >
              Resume Feed
            </button>
          </div>
        )}

        {/* Live HUD Badges & Hand Status (Requirements 1, 2, 9, 27) */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 pointer-events-none z-10">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-[11px] font-mono text-slate-300">
            <span className={`w-2 h-2 rounded-full ${isSimulated ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
            <span className="font-bold text-white">{isSimulated ? 'DEMO MODE' : 'LIVE MODEL'}</span>
            <span className="text-slate-500">|</span>
            <span>{fps} FPS</span>
          </div>

          {/* Hand detected: LEFT or RIGHT or 2 HANDS (Requirements 2 & 9) */}
          {livePrediction && livePrediction.landmarks && livePrediction.landmarks.length >= 21 && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-cyan-500/50 text-[11px] font-mono font-bold text-cyan-300">
              <span className={`w-2 h-2 rounded-full ${livePrediction.handsDetected === 2 ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`} />
              <span>
                {livePrediction.handsDetected === 2 ? (
                  <strong className="text-emerald-300">Hands detected: 2 ✓ (Dual Hand)</strong>
                ) : (
                  <span>Hand detected: <strong className="text-white">{livePrediction.handedness.toUpperCase()}</strong></span>
                )}
              </span>
            </div>
          )}

          {isCoachingMode && (
            <div className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-[11px] font-bold text-cyan-300 backdrop-blur-md flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>COACH MODE</span>
            </div>
          )}
        </div>

        {/* Gesture Quality Advisory Banner: "Improve Camera Position" (Requirement 3) */}
        {livePrediction && livePrediction.landmarks && livePrediction.landmarks.length >= 21 && !livePrediction.gestureQuality.isSuitable && (
          <div className="absolute top-14 inset-x-4 z-20 flex justify-center pointer-events-none">
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl bg-amber-950/92 border border-amber-500/50 text-amber-200 text-xs font-bold shadow-xl backdrop-blur-md animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Improve Camera Position: {livePrediction.gestureQuality.recommendation}</span>
            </div>
          </div>
        )}

        {/* Real-Time 'Recognition Debug' Overlay */}
        {isDebugOpen && (
          <div className="absolute top-3 right-3 z-30 w-72 sm:w-80 rounded-2xl bg-[#1C1917]/95 backdrop-blur-md border border-[#C5A059]/60 shadow-2xl text-[11px] font-mono text-[#FAF7F2] overflow-hidden transition-all duration-200">
            {/* Overlay Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#292524] border-b border-[#44403C]">
              <div className="flex items-center space-x-1.5 font-bold text-[#C5A059]">
                <Activity className="w-3.5 h-3.5 text-[#C5A059] animate-pulse" />
                <span className="text-[10px] tracking-wider uppercase">Recognition Debug</span>
              </div>

              <div className="flex items-center space-x-1.5">
                {livePrediction && (
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                    livePrediction.decision === 'ACCEPT' 
                      ? 'bg-[#16A34A]/20 text-[#4ADE80] border border-[#16A34A]/50' :
                    livePrediction.decision === 'UNCERTAIN' 
                      ? 'bg-[#CA8A04]/20 text-[#FACC15] border border-[#CA8A04]/50' :
                      'bg-[#DC2626]/20 text-[#F87171] border border-[#DC2626]/50'
                  }`}>
                    {livePrediction.decision}
                  </span>
                )}

                <button
                  onClick={() => setIsDebugMinimized(!isDebugMinimized)}
                  className="p-1 hover:bg-[#44403C] rounded text-[#A8A29E] hover:text-[#FAF7F2] transition"
                  title={isDebugMinimized ? 'Expand Debug Panel' : 'Minimize Debug Panel'}
                >
                  {isDebugMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Overlay Body */}
            {!isDebugMinimized && (
              <div className="p-3 space-y-2.5 max-h-[380px] overflow-y-auto">
                {/* 1. Handedness Metric */}
                <div className="p-2 rounded-xl bg-[#292524]/60 border border-[#44403C] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-[#A8A29E] font-bold block">1. Handedness</span>
                    <strong className="text-sm font-black text-[#FAF7F2] flex items-center space-x-1.5">
                      <span>{livePrediction?.handedness ? livePrediction.handedness.toUpperCase() : 'NO HAND'}</span>
                      {livePrediction?.handedness && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#C5A059]/20 text-[#C5A059] font-normal border border-[#C5A059]/40">
                          {livePrediction.handedness === 'Left' ? 'Mirrored (X × -1)' : 'Native'}
                        </span>
                      )}
                    </strong>
                  </div>
                  <div className="text-right text-[10px] text-[#A8A29E]">
                    <span>Landmarks:</span> <strong className="text-[#FAF7F2]">{livePrediction?.landmarks?.length || 0}/21</strong>
                  </div>
                </div>

                {/* 2. Visibility Metric */}
                <div className="p-2 rounded-xl bg-[#292524]/60 border border-[#44403C] space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[9px] uppercase tracking-wider text-[#A8A29E] font-bold">2. Visibility</span>
                    <strong className="text-[#C5A059]">
                      {Math.round((livePrediction?.gestureQuality?.visibilityScore || (livePrediction?.landmarks?.length ? 1 : 0)) * 100)}%
                    </strong>
                  </div>
                  <div className="w-full h-1.5 bg-[#44403C] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#C5A059] to-[#16A34A] rounded-full transition-all duration-150"
                      style={{ width: `${Math.round((livePrediction?.gestureQuality?.visibilityScore || (livePrediction?.landmarks?.length ? 1 : 0)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-[#A8A29E] pt-0.5">
                    <span>Bounds: {livePrediction?.gestureQuality?.isClipped ? 'Clipped ⚠' : 'Inside Frame ✓'}</span>
                    <span>Area: {Math.round((livePrediction?.gestureQuality?.handSizeRatio || 0) * 100)}%</span>
                  </div>
                </div>

                {/* 3. Gesture Stability score */}
                <div className="p-2 rounded-xl bg-[#292524]/60 border border-[#44403C] space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[9px] uppercase tracking-wider text-[#A8A29E] font-bold">3. Gesture Stability</span>
                    <strong className="text-[#4ADE80]">
                      {Math.round((livePrediction?.gestureQuality?.score || 0) * 100)}%
                    </strong>
                  </div>
                  <div className="w-full h-1.5 bg-[#44403C] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-150 ${
                        (livePrediction?.gestureQuality?.score || 0) >= 0.7 
                          ? 'bg-[#16A34A]' 
                          : (livePrediction?.gestureQuality?.score || 0) >= 0.4 
                          ? 'bg-[#CA8A04]' 
                          : 'bg-[#DC2626]'
                      }`}
                      style={{ width: `${Math.round((livePrediction?.gestureQuality?.score || 0) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-[#A8A29E] pt-0.5">
                    <span>Speed: {((livePrediction?.gestureQuality?.motionSpeed || 0)).toFixed(2)} u/s</span>
                    <span className="text-[#FAF7F2]">
                      {livePrediction?.whyBreakdown?.stableAcrossFrames ? 'Temporal Stable ✓' : 'Temporal Buffering...'}
                    </span>
                  </div>
                </div>

                {/* 4. Top-3 Prediction Scores */}
                <div className="p-2 rounded-xl bg-[#292524]/60 border border-[#44403C] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[9px] uppercase tracking-wider text-[#A8A29E] font-bold">4. Top-3 Prediction Scores</span>
                    <span className="text-[9px] text-[#C5A059]">Margin: +{Math.round((livePrediction?.margin || 0) * 100)}%</span>
                  </div>
                  <div className="space-y-1">
                    {/* Candidate 1 */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-bold text-[#FAF7F2] truncate max-w-[130px]">
                          #1 {livePrediction?.topCandidates?.[0]?.sign || (livePrediction?.sign !== 'UNKNOWN' ? livePrediction?.sign : 'NO SIGN')}
                        </span>
                        <strong className="text-[#4ADE80]">
                          {Math.round((livePrediction?.topCandidates?.[0]?.score || livePrediction?.confidence || 0) * 100)}%
                        </strong>
                      </div>
                      <div className="w-full h-1 bg-[#44403C] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#16A34A] rounded-full transition-all duration-150"
                          style={{ width: `${Math.round((livePrediction?.topCandidates?.[0]?.score || livePrediction?.confidence || 0) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Candidate 2 */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#D6D3D1] truncate max-w-[130px]">
                          #2 {livePrediction?.topCandidates?.[1]?.sign || 'OTHER'}
                        </span>
                        <span className="text-[#A8A29E]">
                          {Math.round((livePrediction?.topCandidates?.[1]?.score || 0) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-1 bg-[#44403C] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#C5A059] rounded-full transition-all duration-150"
                          style={{ width: `${Math.round((livePrediction?.topCandidates?.[1]?.score || 0) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Candidate 3 */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#A8A29E] truncate max-w-[130px]">
                          #3 {livePrediction?.topCandidates?.[2]?.sign || 'OTHER / NOISE'}
                        </span>
                        <span className="text-[#78716C]">
                          {Math.round((livePrediction?.topCandidates?.[2]?.score || 0) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-1 bg-[#44403C] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#78716C] rounded-full transition-all duration-150"
                          style={{ width: `${Math.round((livePrediction?.topCandidates?.[2]?.score || 0) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Reference Similarity */}
                <div className="p-2 rounded-xl bg-[#292524]/60 border border-[#44403C] space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[9px] uppercase tracking-wider text-[#A8A29E] font-bold">5. Reference Similarity</span>
                    <strong className="text-[#C5A059]">
                      {Math.round((livePrediction?.referenceSimilarity || 0) * 100)}%
                    </strong>
                  </div>
                  <div className="w-full h-1.5 bg-[#44403C] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-150 ${
                        (livePrediction?.referenceSimilarity || 0) >= 0.70 
                          ? 'bg-[#16A34A]' 
                          : (livePrediction?.referenceSimilarity || 0) >= 0.50 
                          ? 'bg-[#CA8A04]' 
                          : 'bg-[#DC2626]'
                      }`}
                      style={{ width: `${Math.round((livePrediction?.referenceSimilarity || 0) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-[#A8A29E] pt-0.5">
                    <span>Threshold: &ge; 70%</span>
                    <span className={
                      (livePrediction?.referenceSimilarity || 0) >= 0.70 ? 'text-[#4ADE80] font-bold' : 'text-[#F87171]'
                    }>
                      {(livePrediction?.referenceSimilarity || 0) >= 0.70 ? 'MATCH ACCEPTED ✓' : 'UNCERTAIN / REJECT'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Center Target Reticle for alignment */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
          <div className="w-64 h-64 border-2 border-dashed border-cyan-500/50 rounded-3xl" />
        </div>
      </div>

      {/* Camera Toolbar & Controls */}
      <div className="p-3 bg-slate-900 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          {/* Camera Start/Stop */}
          <button
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`p-2 rounded-lg border transition ${
              isCameraActive
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-emerald-950/60 border-emerald-700 text-emerald-400'
            }`}
            title={isCameraActive ? 'Pause Camera' : 'Start Camera'}
          >
            {isCameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
          </button>

          {/* Mirror Toggle */}
          <button
            onClick={() => {
              settings.mirrorVideo = !settings.mirrorVideo;
            }}
            className={`p-2 rounded-lg border transition ${
              settings.mirrorVideo
                ? 'bg-cyan-950/60 border-cyan-700/80 text-cyan-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Mirror preview horizontally"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          {/* Skeleton Visibility Toggle */}
          <button
            onClick={() => {
              settings.showSkeleton = !settings.showSkeleton;
            }}
            className={`p-2 rounded-lg border transition ${
              settings.showSkeleton
                ? 'bg-cyan-950/60 border-cyan-700/80 text-cyan-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={settings.showSkeleton ? 'Hide Skeleton Overlay' : 'Show Skeleton Overlay'}
          >
            {settings.showSkeleton ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Recognition Debug Overlay Toggle */}
          <button
            onClick={() => setIsDebugOpen(prev => !prev)}
            className={`p-2 rounded-lg border transition flex items-center space-x-1.5 ${
              isDebugOpen
                ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059] shadow-sm shadow-[#C5A059]/20'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={isDebugOpen ? 'Hide Recognition Debug Overlay' : 'Show Recognition Debug Overlay'}
          >
            <Sliders className="w-4 h-4 text-[#C5A059]" />
            <span className="text-[10px] font-mono font-bold">DEBUG {isDebugOpen ? 'ON' : 'OFF'}</span>
          </button>

          {/* Device Selector */}
          {availableDevices.length > 1 && !isSimulated && (
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 max-w-[140px] truncate outline-none"
            >
              {availableDevices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Right side: Simulation switch & sign select */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSimulated(!isSimulated)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition ${
              isSimulated
                ? 'bg-indigo-950 border-indigo-600 text-indigo-300 shadow-sm shadow-indigo-500/10'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSimulated ? 'Simulating' : 'Simulate Feed'}</span>
          </button>

          {isSimulated && (
            <select
              value={simulatedSign}
              onChange={(e) => setSimulatedSign(e.target.value)}
              className="bg-slate-950 border border-indigo-700 text-indigo-200 text-xs font-semibold rounded-lg px-2 py-1.5 outline-none max-w-[140px] truncate"
            >
              {islDatasetAdapter.getClassRecords().map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
};
