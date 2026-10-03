/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, FastForward, FlipHorizontal, Sparkles } from 'lucide-react';

interface SignAvatarProps {
  currentText: string;
  activeSign?: string;
  className?: string;
}

export const SignAvatar: React.FC<SignAvatarProps> = ({
  currentText,
  activeSign,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string>('HELLO');
  const animTimeRef = useRef(0);

  // Sync gesture with incoming text or activeSign
  useEffect(() => {
    if (activeSign) {
      setCurrentGesture(activeSign.toUpperCase());
    } else if (currentText) {
      const lower = currentText.toLowerCase();
      if (lower.includes('water')) setCurrentGesture('WATER');
      else if (lower.includes('help')) setCurrentGesture('HELP');
      else if (lower.includes('thank')) setCurrentGesture('THANK YOU');
      else if (lower.includes('hospital')) setCurrentGesture('HELP');
      else if (lower.includes('yes')) setCurrentGesture('YES');
      else if (lower.includes('no')) setCurrentGesture('NO');
      else if (lower.includes('hello') || lower.includes('hi')) setCurrentGesture('HELLO');
      else setCurrentGesture('HELLO');
    }
  }, [activeSign, currentText]);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (isPlaying) {
        animTimeRef.current += isSlowMo ? 0.02 : 0.045;
      }
      const t = animTimeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Background subtle gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#0c1322');
      bgGrad.addColorStop(1, '#080c14');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      if (isMirrored) {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }

      // Center reference coordinates
      const cx = w * 0.5;
      const cy = h * 0.55;

      // 1. Torso & Shoulders
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;

      // Body / Torso
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy - 20);
      ctx.lineTo(cx + 50, cy - 20);
      ctx.lineTo(cx + 65, cy + 90);
      ctx.lineTo(cx - 65, cy + 90);
      ctx.closePath();
      ctx.fillStyle = '#111827';
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.stroke();

      // Chest glow emblem
      ctx.beginPath();
      ctx.arc(cx, cy + 20, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#8b5cf6';
      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Head & Neck
      // Neck
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - 10, cy - 45, 20, 25);

      // Head
      ctx.beginPath();
      ctx.ellipse(cx, cy - 75, 26, 32, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Visor / Eyes
      ctx.beginPath();
      ctx.roundRect(cx - 18, cy - 80, 36, 10, 5);
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Left Arm (Neutral resting)
      const leftShoulderX = cx - 50;
      const leftShoulderY = cy - 20;
      const leftElbowX = leftShoulderX - 20;
      const leftElbowY = leftShoulderY + 50;
      const leftHandX = leftElbowX + 15;
      const leftHandY = leftElbowY + 40;

      ctx.beginPath();
      ctx.moveTo(leftShoulderX, leftShoulderY);
      ctx.lineTo(leftElbowX, leftElbowY);
      ctx.lineTo(leftHandX, leftHandY);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Left hand base
      ctx.beginPath();
      ctx.arc(leftHandX, leftHandY, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fill();

      // Right Arm (Animated Signing Arm based on currentGesture)
      const rightShoulderX = cx + 50;
      const rightShoulderY = cy - 20;

      let rElbowX = rightShoulderX + 25;
      let rElbowY = rightShoulderY + 35;
      let rHandX = cx + 20;
      let rHandY = cy - 65; // near chin/head

      if (currentGesture === 'HELLO') {
        // Waving hand near temple
        const waveX = Math.sin(t * 6) * 16;
        rHandX = cx + 38 + waveX;
        rHandY = cy - 80;
        rElbowX = rightShoulderX + 35;
        rElbowY = rightShoulderY + 15;
      } else if (currentGesture === 'WATER') {
        // W-shape tapping chin
        const tap = Math.abs(Math.sin(t * 5)) * 12;
        rHandX = cx + 4 + tap;
        rHandY = cy - 50;
        rElbowX = rightShoulderX + 20;
        rElbowY = rightShoulderY + 30;
      } else if (currentGesture === 'HELP') {
        // Fist lifting upward
        const lift = Math.sin(t * 4) * 18;
        rHandX = cx;
        rHandY = cy + 10 - lift;
        rElbowX = rightShoulderX + 15;
        rElbowY = rightShoulderY + 45;
      } else if (currentGesture === 'THANK YOU') {
        // Moving from chin outward
        const sweep = (Math.sin(t * 3.5) + 1) / 2;
        rHandX = cx + 15 + sweep * 35;
        rHandY = cy - 50 + sweep * 30;
        rElbowX = rightShoulderX + 25;
        rElbowY = rightShoulderY + 35;
      } else {
        // Generic active signing arc
        rHandX = cx + Math.sin(t * 4) * 25;
        rHandY = cy - 40 + Math.cos(t * 4) * 15;
      }

      // Draw Right Arm Bones
      ctx.beginPath();
      ctx.moveTo(rightShoulderX, rightShoulderY);
      ctx.lineTo(rElbowX, rElbowY);
      ctx.lineTo(rHandX, rHandY);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Right Hand Palm & Fingers
      ctx.beginPath();
      ctx.arc(rHandX, rHandY, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#c084fc';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw finger rays
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(rHandX, rHandY);
        ctx.lineTo(rHandX + i * 5, rHandY - 14);
        ctx.strokeStyle = '#e9d5ff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isSlowMo, isMirrored, currentGesture]);

  return (
    <div className={`relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col ${className}`}>
      {/* Header */}
      <div className="px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Sign Language Avatar
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-800 font-bold">
          {currentGesture}
        </span>
      </div>

      {/* Canvas */}
      <div className="relative aspect-[4/3] w-full bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          className="w-full h-full object-contain"
        />
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/70 text-[10px] font-mono text-slate-400 border border-slate-800">
          Synthesizing ASL motion
        </div>
      </div>

      {/* Playback Controls */}
      <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title={isPlaying ? 'Pause Avatar' : 'Play Avatar'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
          <button
            onClick={() => {
              animTimeRef.current = 0;
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Replay from start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsSlowMo(!isSlowMo)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition border ${
              isSlowMo
                ? 'bg-violet-950 border-violet-700 text-violet-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isSlowMo ? '0.5x Slow' : '1.0x Normal'}
          </button>
        </div>

        <button
          onClick={() => setIsMirrored(!isMirrored)}
          className={`p-1.5 rounded-lg border transition ${
            isMirrored
              ? 'bg-cyan-950 border-cyan-700 text-cyan-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title="Mirror view"
        >
          <FlipHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
