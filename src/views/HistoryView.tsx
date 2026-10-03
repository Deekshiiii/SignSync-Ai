/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TranslationHistoryItem } from '../types';
import { 
  History as HistoryIcon, 
  Volume2, 
  Trash2, 
  Download, 
  Search, 
  Calendar, 
  Clock, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';

interface HistoryViewProps {
  history: TranslationHistoryItem[];
  onSpeak: (text: string) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSpeak,
  onClearHistory,
  onDeleteItem
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = history.filter(item => {
    const textMatch = item.generatedSentence.toLowerCase().includes(searchTerm.toLowerCase());
    const signsMatch = item.signs.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return textMatch || signsMatch;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `signsync_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Time', 'Signs', 'Generated Sentence', 'Confidence'];
    const rows = history.map(h => [
      h.id,
      new Date(h.timestamp).toLocaleDateString(),
      new Date(h.timestamp).toLocaleTimeString(),
      `"${h.signs.join(' -> ')}"`,
      `"${h.generatedSentence.replace(/"/g, '""')}"`,
      `${Math.round(h.confidence * 100)}%`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `signsync_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <HistoryIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
              <span>Translation History</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                {history.length} Saved Records
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Audit log of recognized sign sequences and synthesized sentences
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          {history.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
              <button
                onClick={onClearHistory}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-800/60 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by recognized word or sentence (e.g., 'water', 'help')..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/60 transition"
        />
      </div>

      {/* History List */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <HistoryIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300 mb-1">
            {searchTerm ? 'No matching translation records' : 'No translation history yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? 'Try searching for a different keyword or clear your query.'
              : 'Sign sequences confirmed in the Dashboard or Kiosk will be logged here with timestamps and voice replay.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4.5 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div className="space-y-2 flex-1 min-w-0">
                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="flex items-center space-x-1 text-slate-400 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center space-x-1 text-slate-400 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold">
                    {Math.round(item.confidence * 100)}% Confidence
                  </span>
                </div>

                {/* Sign Sequence Flow */}
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold mr-1">
                    Signs:
                  </span>
                  {item.signs.map((s, idx) => (
                    <React.Fragment key={idx}>
                      <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 text-xs font-semibold">
                        {s}
                      </span>
                      {idx < item.signs.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Final Generated Sentence */}
                <div className="text-base font-bold text-white tracking-tight">
                  &ldquo;{item.generatedSentence}&rdquo;
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 self-end md:self-center">
                <button
                  onClick={() => onSpeak(item.generatedSentence)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-xs font-bold border border-cyan-500/30 transition"
                  title="Speak sentence aloud"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Speak</span>
                </button>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 border border-slate-700/60 transition"
                  title="Delete record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
