/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CameraView } from '../components/CameraView';
import { PredictionResult, AppSettings, SceneDetection } from '../types';
import { COMMON_SCENE_OBJECTS, enrichSentenceWithSceneContext } from '../services/sceneAI';
import { Eye, Sparkles, MapPin, CheckCircle2, ArrowRight, Compass, Layers } from 'lucide-react';
import { ttsService } from '../services/ttsService';

interface SceneUnderstandingViewProps {
  onPrediction: (result: PredictionResult) => void;
  latestPrediction: PredictionResult | null;
  settings: AppSettings;
}

export const SceneUnderstandingView: React.FC<SceneUnderstandingViewProps> = ({
  onPrediction,
  latestPrediction,
  settings
}) => {
  const [selectedScene, setSelectedScene] = useState<SceneDetection | null>(COMMON_SCENE_OBJECTS[0]);
  const [testSignSentence, setTestSignSentence] = useState('Where is the bus?');

  const enrichment = enrichSentenceWithSceneContext(testSignSentence, selectedScene);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#101726] border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
              <span>Scene AI & Environmental Perception</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                Multimodal Context
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Correlates visual objects (buses, hospitals, signs, restrooms) with live sign queries
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Camera with Scene perception boundary */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative">
            <CameraView
              onPrediction={onPrediction}
              settings={settings}
            />

            {/* Overlaid Detected Object Bounding Box in Camera */}
            {selectedScene && (
              <div className="absolute top-12 right-6 p-2.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-500 text-xs font-mono text-cyan-300 shadow-xl pointer-events-none flex items-center space-x-2">
                <span className="text-base">{selectedScene.icon}</span>
                <div>
                  <span className="font-bold block">{selectedScene.objectName}</span>
                  <span className="text-[10px] text-slate-400">Confidence: {Math.round(selectedScene.confidence * 100)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Environmental Object Detection Picker */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulated Environmental Sightings:</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_SCENE_OBJECTS.map(obj => (
                <button
                  key={obj.id}
                  onClick={() => setSelectedScene(obj)}
                  className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                    selectedScene?.id === obj.id
                      ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-xl">{obj.icon}</span>
                  <div className="truncate text-xs">
                    <span className="font-bold block truncate">{obj.objectName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {Math.round(obj.confidence * 100)}% Match
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Contextual Fusion Output */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-[#0e1422] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Multimodal Perception Fusion</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Scene AI Active
              </span>
            </div>

            {/* Raw Sign vs Scene AI Context */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] font-mono uppercase block mb-1">
                  1. Raw Sign Input
                </span>
                <p className="text-slate-200 font-bold">&ldquo;{testSignSentence}&rdquo;</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] font-mono uppercase block mb-1">
                  2. Scene Perception Feature
                </span>
                <p className="text-cyan-300 font-bold flex items-center space-x-1.5">
                  <span>{selectedScene?.icon}</span>
                  <span>{selectedScene?.objectName}</span>
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-cyan-950/40 to-indigo-950/40 rounded-2xl border border-cyan-500/40 space-y-2">
                <span className="text-cyan-400 text-[10px] font-mono uppercase font-black block">
                  3. Fused Natural Context Interpretation
                </span>
                <p className="text-xl font-extrabold text-white leading-snug">
                  &ldquo;{enrichment.enrichedSentence}&rdquo;
                </p>
                {enrichment.isEnriched && (
                  <p className="text-[11px] text-cyan-300 font-mono mt-1">
                    {enrichment.contextExplanation}
                  </p>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => ttsService.speak(enrichment.enrichedSentence)}
              className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/25"
            >
              🔊 Speak Contextual Sentence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
