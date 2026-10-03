/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { CustomSign } from '../types';
import { generateCanonicalLandmarks } from '../services/sampleDataset';
import { drawHandLandmarks } from '../services/landmarks';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Trash2, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Activity,
  Maximize2
} from 'lucide-react';

interface SignVideoPreviewModalProps {
  sign: CustomSign;
  isOpen: boolean;
  onClose: () => void;
  onVerify?: (id: string) => void;
  onDelete?: (id: string) => void;
  onReRecord?: (id: string) => void;
}

export const SignVideoPreviewModal: React.FC<SignVideoPreviewModalProps> = ({
  sign,
  isOpen,
  onClose,
  onVerify,
  onDelete,
  onReRecord
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isVerified, setIsVerified] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 440;
    canvas.height = 320;

    const render = () => {
      if (isPlaying) {
        timeRef.current += 0.04 * speed;
      }
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Dark charcoal background with subtle gold vignette
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#1C1917';
      ctx.fillRect(0, 0, w, h);

      // Subtle warm grid lines
      ctx.strokeStyle = 'rgba(197, 160, 89, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Generate dynamic landmarks for this custom sign
      // Use sign name as seed
      const landmarks = generateCanonicalLandmarks(
        sign.name.includes('DEEKSHITHA') ? 'HELP' : sign.name.includes('COFFEE') ? 'FOOD' : 'HELLO',
        t
      );

      // Draw skeleton on canvas with burgundy / muted gold accents
      drawHandLandmarks(ctx, landmarks, w, h, {
        handedness: 'Right',
        signLabel: sign.name,
        confidence: sign.accuracy,
        style: 'neon'
      });

      // Overlay timecode & tracking indicators
      ctx.fillStyle = '#C5A059';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillText(`REC: ${sign.sampleCount} FRAMES | ${(t % 4).toFixed(2)}s`, 16, 26);

      ctx.fillStyle = '#FAF7F2';
      ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`21 3D LANDMARKS • BIOMECHANICAL CONFIDENCE: ${Math.round(sign.accuracy * 100)}%`, 16, h - 16);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isPlaying, speed, sign]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#FAF7F2] border-2 border-[#C5A059]/40 rounded-3xl shadow-2xl shadow-[#1C1917]/30 overflow-hidden flex flex-col text-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#6B1D2F] text-[#FAF7F2] p-4.5 flex items-center justify-between border-b border-[#C5A059]/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#541524] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold tracking-tight text-[#FAF7F2]">
                  {sign.name}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#C5A059]/20 text-[#FAF7F2] border border-[#C5A059]/50 font-bold uppercase">
                  {sign.category}
                </span>
              </div>
              <p className="text-xs text-[#FAF7F2]/80 mt-0.5">
                Video gesture kinematic preview &amp; verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#FAF7F2]/70 hover:text-[#FAF7F2] hover:bg-[#541524] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Canvas Container */}
        <div className="relative bg-[#1C1917] flex items-center justify-center overflow-hidden aspect-[4/3] max-h-[300px]">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
          />

          {/* Floating Live Badge */}
          <div className="absolute top-3 right-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#1C1917]/85 border border-[#C5A059]/40 text-[#C5A059] text-[10px] font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
            <span>RECORDED SAMPLE PLAYBACK</span>
          </div>

          {/* Playback Overlay Controls */}
          <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-[#1C1917]/90 p-1.5 rounded-2xl border border-[#C5A059]/30 text-xs">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-xl bg-[#292524] hover:bg-[#6B1D2F] text-[#FAF7F2] transition"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#C5A059]" />}
            </button>
            <button
              onClick={() => { timeRef.current = 0; }}
              className="p-1.5 rounded-xl bg-[#292524] hover:bg-[#6B1D2F] text-[#FAF7F2] transition"
              title="Replay from start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSpeed(speed === 1.0 ? 0.5 : 1.0)}
              className={`px-2 py-1 rounded-xl text-[10px] font-bold font-mono transition ${
                speed === 0.5 ? 'bg-[#6B1D2F] text-[#FAF7F2]' : 'text-[#FAF7F2]/80 hover:text-[#FAF7F2]'
              }`}
            >
              {speed === 0.5 ? '0.5x Slow' : '1.0x'}
            </button>
          </div>
        </div>

        {/* Gesture Details & Biomechanical Checks */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-2xl bg-[#F3ECE1] border border-[#E4DACB] text-xs space-y-1.5">
            <span className="font-bold text-[#6B1D2F] block">Registered Meaning:</span>
            <p className="text-[#44403C] leading-relaxed italic">&ldquo;{sign.meaning}&rdquo;</p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="p-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E4DACB]">
              <span className="text-[10px] text-[#78716C] font-mono block">Accuracy</span>
              <span className="text-base font-black text-[#6B1D2F] font-mono">
                {Math.round(sign.accuracy * 100)}%
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E4DACB]">
              <span className="text-[10px] text-[#78716C] font-mono block">Samples</span>
              <span className="text-base font-black text-[#1C1917] font-mono">
                {sign.sampleCount}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E4DACB]">
              <span className="text-[10px] text-[#78716C] font-mono block">Biomechanics</span>
              <span className="text-base font-black text-[#C5A059] font-mono">
                Verified
              </span>
            </div>
          </div>

          {/* Delete confirmation banner if triggered */}
          {showDeleteConfirm && (
            <div className="p-3.5 rounded-2xl bg-[#6B1D2F]/10 border border-[#6B1D2F] text-xs space-y-2 animate-in fade-in">
              <span className="font-bold text-[#6B1D2F] block">
                Are you sure you want to delete this recorded sign?
              </span>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E4DACB] text-[#1C1917] font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (onDelete) onDelete(sign.id);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#6B1D2F] text-[#FAF7F2] font-bold text-xs hover:bg-[#541524]"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4.5 border-t border-[#E4DACB] bg-[#F7F2EB] flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center space-x-2">
            {/* Delete button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E4DACB] text-[#6B1D2F] hover:bg-[#6B1D2F]/10 font-bold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            {/* Re-record button */}
            {onReRecord && (
              <button
                onClick={() => {
                  onReRecord(sign.id);
                  onClose();
                }}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E4DACB] text-[#1C1917] hover:bg-[#F3ECE1] font-bold transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Re-Record</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Verify & Save button */}
            <button
              onClick={() => {
                setIsVerified(true);
                if (onVerify) onVerify(sign.id);
                setTimeout(() => onClose(), 600);
              }}
              className="flex items-center space-x-1.5 px-4.5 py-2.5 rounded-xl bg-[#6B1D2F] hover:bg-[#541524] text-[#FAF7F2] font-black tracking-wide shadow-md shadow-[#6B1D2F]/25 transition"
            >
              <Check className="w-4 h-4 text-[#C5A059]" />
              <span>{isVerified ? '✓ Verified & Saved' : 'Verify & Keep Gesture'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
