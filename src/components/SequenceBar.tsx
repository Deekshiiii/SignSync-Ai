/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SequenceItem } from '../types';
import { SIGN_DEFINITIONS } from '../data/signs';
import { ArrowRight, RotateCcw, Trash2, Plus, Sparkles, X } from 'lucide-react';

interface SequenceBarProps {
  sequence: SequenceItem[];
  onUndo: () => void;
  onClear: () => void;
  onRemoveItem: (index: number) => void;
  onAddManualSign: (sign: string) => void;
}

export const SequenceBar: React.FC<SequenceBarProps> = ({
  sequence,
  onUndo,
  onClear,
  onRemoveItem,
  onAddManualSign
}) => {
  const [showPicker, setShowPicker] = useState(false);

  // Common MVP test chains
  const quickPresets = [
    { label: 'I WANT WATER', signs: ['I', 'WANT', 'WATER'] },
    { label: 'I NEED HELP', signs: ['I', 'HELP'] },
    { label: 'YOU HELP ME', signs: ['YOU', 'HELP', 'I'] },
    { label: 'THANK YOU', signs: ['THANK YOU'] },
    { label: 'MORE FOOD', signs: ['MORE', 'FOOD'] },
    { label: 'PLEASE HELP', signs: ['PLEASE', 'HELP'] }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Sign Sequence Buffer
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-400 font-bold">
            {sequence.length} {sequence.length === 1 ? 'Sign' : 'Signs'}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Quick presets button */}
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold transition border border-slate-700/60"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showPicker ? 'Close Picker' : 'Quick Add'}</span>
          </button>

          {/* Undo */}
          <button
            onClick={onUndo}
            disabled={sequence.length === 0}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 text-xs font-semibold transition border border-slate-700/60"
            title="Undo last sign"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Clear */}
          <button
            onClick={onClear}
            disabled={sequence.length === 0}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none text-slate-400 text-xs font-semibold transition border border-slate-700/60"
            title="Clear sequence"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Sequence Stream */}
      <div className="min-h-[58px] bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center overflow-x-auto gap-2">
        {sequence.length === 0 ? (
          <div className="w-full text-center py-2 text-xs text-slate-500 italic flex items-center justify-center space-x-2">
            <span>No signs in buffer. Perform a sign in camera or click &ldquo;Quick Add&rdquo;.</span>
          </div>
        ) : (
          sequence.map((item, index) => (
            <React.Fragment key={item.id}>
              <div className="group relative flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/70 text-cyan-200 text-xs font-bold shadow-sm whitespace-nowrap">
                <span>{item.sign}</span>
                <span className="text-[10px] font-mono text-cyan-400/80 font-normal">
                  {Math.round(item.confidence * 100)}%
                </span>
                <button
                  onClick={() => onRemoveItem(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-400 ml-1"
                  title="Remove this sign"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {index < sequence.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
              )}
            </React.Fragment>
          ))
        )}
      </div>

      {/* Quick Add / Preset Palette Drawer */}
      {showPicker && (
        <div className="p-3 bg-slate-950 rounded-xl border border-cyan-900/40 animate-in fade-in duration-150">
          {/* Quick MVP Chains */}
          <div className="mb-2.5">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1.5">
              MVP Test Sentences:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickPresets.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => {
                    preset.signs.forEach(s => onAddManualSign(s));
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-900/50 hover:text-cyan-200 text-slate-300 font-semibold border border-slate-700/60 transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Individual signs dictionary */}
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1.5">
              Individual Vocabulary Signs:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {SIGN_DEFINITIONS.map(sign => (
                <button
                  key={sign.id}
                  onClick={() => onAddManualSign(sign.name)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-cyan-800 transition"
                >
                  + {sign.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
