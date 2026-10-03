/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  runBenchmarkEvaluation, 
  BenchmarkEvaluationResult, 
  getUserCorrections, 
  clearUserCorrections 
} from '../services/classifier';
import { UserCorrectionRecord } from '../types';
import { 
  BarChart3, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  RotateCcw, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Trash2, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

export const InsightsView: React.FC = () => {
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkEvaluationResult | null>(null);
  const [isRunningEval, setIsRunningEval] = useState(false);
  const [corrections, setCorrections] = useState<UserCorrectionRecord[]>([]);

  useEffect(() => {
    // Run measured benchmark on load
    runEvaluation();
    setCorrections(getUserCorrections());
  }, []);

  const runEvaluation = () => {
    setIsRunningEval(true);
    setTimeout(() => {
      const res = runBenchmarkEvaluation();
      setBenchmarkResult(res);
      setIsRunningEval(false);
    }, 200);
  };

  const handleClearCorrections = () => {
    clearUserCorrections();
    setCorrections([]);
  };

  return (
    <div className="space-y-6 text-[#1C1917]">
      {/* Header */}
      <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-3xl p-5 sm:p-6 shadow-md shadow-[#1C1917]/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#6B1D2F] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] shadow-md shadow-[#6B1D2F]/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1C1917] tracking-tight flex items-center space-x-2">
              <span>Model Evaluation &amp; Empirical Benchmark</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#C5A059]/20 text-[#8C6B28] border border-[#C5A059]/40 font-mono font-bold">
                Actual Measured Data
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#6B1D2F] font-bold">
              Rigorous test-split metrics, per-sign F1 scores, unknown detection rates, and live confusion matrix
            </p>
          </div>
        </div>

        <button
          onClick={runEvaluation}
          disabled={isRunningEval}
          className="flex items-center space-x-2 px-4.5 py-2.5 rounded-2xl bg-[#6B1D2F] hover:bg-[#541524] text-[#FAF7F2] text-xs font-black uppercase tracking-wider transition shadow-md shadow-[#6B1D2F]/20 disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-[#C5A059] ${isRunningEval ? 'animate-spin' : ''}`} />
          <span>{isRunningEval ? 'Measuring...' : 'Re-Run Evaluation Benchmark'}</span>
        </button>
      </div>

      {/* Top Level Metric Cards (Requirement 13) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-bold text-[#78716C] block mb-1">
            Overall Accuracy
          </span>
          <span className="text-2xl font-black font-mono text-[#1C1917]">
            {benchmarkResult ? `${benchmarkResult.overallAccuracy}%` : '---'}
          </span>
          <span className="text-[10px] text-[#16A34A] font-bold block mt-1">Validation set</span>
        </div>

        <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-bold text-[#78716C] block mb-1">
            Precision
          </span>
          <span className="text-2xl font-black font-mono text-[#8C6B28]">
            {benchmarkResult ? `${benchmarkResult.overallPrecision}%` : '---'}
          </span>
          <span className="text-[10px] text-[#78716C] block mt-1">Low false alarms</span>
        </div>

        <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-bold text-[#78716C] block mb-1">
            Recall
          </span>
          <span className="text-2xl font-black font-mono text-[#6B1D2F]">
            {benchmarkResult ? `${benchmarkResult.overallRecall}%` : '---'}
          </span>
          <span className="text-[10px] text-[#78716C] block mt-1">True gesture capture</span>
        </div>

        <div className="bg-[#F3ECE1] border-2 border-[#C5A059]/60 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-black text-[#6B1D2F] block mb-1">
            F1-Score
          </span>
          <span className="text-2xl font-black font-mono text-[#6B1D2F]">
            {benchmarkResult ? `${benchmarkResult.overallF1}%` : '---'}
          </span>
          <span className="text-[10px] text-[#8C6B28] font-bold block mt-1">Harmonic balance</span>
        </div>

        <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-bold text-[#78716C] block mb-1">
            Unknown Detection
          </span>
          <span className="text-2xl font-black font-mono text-[#16A34A]">
            {benchmarkResult ? `${benchmarkResult.unknownDetectionRate}%` : '---'}
          </span>
          <span className="text-[10px] text-[#78716C] block mt-1">Random pose rejection</span>
        </div>

        <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-bold text-[#78716C] block mb-1">
            False Recognition
          </span>
          <span className="text-2xl font-black font-mono text-[#57534E]">
            {benchmarkResult ? `${benchmarkResult.falseRecognitionRate}%` : '---'}
          </span>
          <span className="text-[10px] text-[#16A34A] font-bold block mt-1">Conservative gating</span>
        </div>
      </div>

      {/* Main Grid: Per-Sign F1 Score Table + Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (6 cols): Per-Sign Accuracy & F1 Score (Requirement 13) */}
        <div className="lg:col-span-6 bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4DACB]">
            <div>
              <h3 className="text-sm font-black text-[#1C1917] flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-[#6B1D2F]" />
                <span>Per-Sign Evaluation Breakdown</span>
              </h3>
              <p className="text-[11px] text-[#78716C]">
                Calculated on test split ({benchmarkResult?.totalEvaluated || 0} evaluated samples)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 bg-[#FFFFFF] border-b border-[#E4DACB] text-[10px] font-mono uppercase text-[#78716C]">
                <tr>
                  <th className="pb-2">Sign</th>
                  <th className="pb-2 text-right">Precision</th>
                  <th className="pb-2 text-right">Recall</th>
                  <th className="pb-2 text-right">F1 Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DACB]/60 font-mono">
                {benchmarkResult?.perSignMetrics.map((row: { sign: string; precision: number; recall: number; f1: number }) => (
                  <tr key={row.sign} className="hover:bg-[#FAF7F2] transition">
                    <td className="py-2.5 font-bold text-[#1C1917]">
                      {row.sign}
                    </td>
                    <td className="py-2.5 text-right text-[#57534E]">
                      {Math.round(row.precision * 100)}%
                    </td>
                    <td className="py-2.5 text-right text-[#57534E]">
                      {Math.round(row.recall * 100)}%
                    </td>
                    <td className="py-2.5 text-right font-black text-[#6B1D2F]">
                      {Math.round(row.f1 * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (6 cols): Confusion Matrix (Requirement 13) */}
        <div className="lg:col-span-6 bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4DACB]">
            <div>
              <h3 className="text-sm font-black text-[#1C1917] flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#8C6B28]" />
                <span>Confusion Matrix (Core Signs + UNKNOWN)</span>
              </h3>
              <p className="text-[11px] text-[#78716C]">
                Rows: Ground Truth &bull; Columns: Model Prediction
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {benchmarkResult?.confusionMatrix && (
              <table className="w-full text-[10px] font-mono text-center border-collapse">
                <thead>
                  <tr className="border-b border-[#E4DACB] text-[#78716C]">
                    <th className="p-1 text-left font-bold">True \ Pred</th>
                    {benchmarkResult.confusionMatrix.labels.map((lbl: string) => (
                      <th key={lbl} className="p-1 font-bold truncate max-w-[42px]" title={lbl}>
                        {lbl.length > 4 ? lbl.substring(0, 4) : lbl}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DACB]/40">
                  {benchmarkResult.confusionMatrix.labels.map((rowLabel: string, rIdx: number) => (
                    <tr key={rowLabel} className="hover:bg-[#FAF7F2]">
                      <td className="p-1.5 text-left font-bold text-[#1C1917] truncate max-w-[65px]" title={rowLabel}>
                        {rowLabel}
                      </td>
                      {benchmarkResult.confusionMatrix.matrix[rIdx]?.map((val: number, cIdx: number) => {
                        const isDiagonal = rIdx === cIdx;
                        const hasErrors = !isDiagonal && val > 0;
                        return (
                          <td
                            key={cIdx}
                            className={`p-1.5 font-bold ${
                              isDiagonal
                                ? 'bg-[#16A34A]/15 text-[#16A34A] font-black'
                                : hasErrors
                                ? 'bg-[#6B1D2F]/10 text-[#6B1D2F]'
                                : 'text-[#A8A29E]'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* User Feedback & Corrections Loop (Requirement 15) */}
      <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E4DACB]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#F3ECE1] text-[#6B1D2F]">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1C1917]">
                User Correction Feedback Loop
              </h3>
              <p className="text-xs text-[#78716C]">
                Stored real user corrections collected when the AI prediction was corrected ({corrections.length} recorded)
              </p>
            </div>
          </div>

          {corrections.length > 0 && (
            <button
              onClick={handleClearCorrections}
              className="text-xs text-[#6B1D2F] hover:text-[#541524] font-bold flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Stored Corrections</span>
            </button>
          )}
        </div>

        {corrections.length === 0 ? (
          <div className="p-6 bg-[#FAF7F2] rounded-2xl border border-[#E4DACB] text-center text-xs text-[#78716C]">
            <p className="font-medium">No user corrections recorded yet.</p>
            <p className="mt-1">
              When using live recognition, clicking &ldquo;NO&rdquo; on the verification prompt records corrections here to tune model calibration.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {corrections.map(c => (
              <div key={c.id} className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E4DACB] space-y-1 text-xs">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#78716C]">
                  <span>{new Date(c.timestamp).toLocaleTimeString()}</span>
                  <span className="font-bold text-[#8C6B28]">{c.handedness} Hand</span>
                </div>
                <div className="flex items-center space-x-2 pt-1 font-mono">
                  <span className="text-[#6B1D2F] line-through font-bold">{c.predictedSign}</span>
                  <span className="text-[#78716C]">&rarr;</span>
                  <span className="text-[#16A34A] font-black">{c.actualSign}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
