/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupportedLanguage, AppSettings } from '../types';
import { SUPPORTED_LANGUAGES, translateSentence } from '../services/multilingual';
import { ttsService } from '../services/ttsService';
import { Globe2, Volume2, ArrowRight, Copy, Check, Sparkles, Languages as LanguagesIcon } from 'lucide-react';

interface LanguagesViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

export const LanguagesView: React.FC<LanguagesViewProps> = ({
  settings,
  onUpdateSettings
}) => {
  const [testPhrase, setTestPhrase] = useState('I need water.');
  const [copied, setCopied] = useState(false);

  const translatedResult = translateSentence(testPhrase, settings.outputLanguage);

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const samplePhrases = [
    'I need help.',
    'I want water.',
    'Hello, my name is Deekshitha.',
    'Thank you very much.',
    'Where is the hospital?',
    'Please help me.'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#101726] border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
              <span>Multilingual Speech &amp; Text Engine</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                6 Indic &amp; Global Languages
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Sign Language &rarr; English Natural Sentence &rarr; Regional Native Speech Synthesis
            </p>
          </div>
        </div>
      </div>

      {/* Language Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Output Language Picker */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
            <LanguagesIcon className="w-4 h-4" />
            <span>Target Spoken Output Language</span>
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {SUPPORTED_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => onUpdateSettings({ outputLanguage: lang.code })}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-1 ${
                  settings.outputLanguage === lang.code
                    ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="font-bold text-xs block text-slate-200">{lang.name}</span>
                <span className="text-[11px] font-mono text-cyan-400 font-semibold">{lang.nativeName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Translation Test Bench */}
        <div className="bg-[#0e1422] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Side-by-Side Translation Pipeline</span>
              </span>
            </div>

            {/* Quick Test Chips */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {samplePhrases.map(p => (
                <button
                  key={p}
                  onClick={() => setTestPhrase(p)}
                  className={`text-[11px] px-2.5 py-1 rounded-xl border transition ${
                    testPhrase === p
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Original vs Translated */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Original (English Sign Sequence)
                </span>
                <p className="text-base font-bold text-white">&ldquo;{testPhrase}&rdquo;</p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-indigo-950/40 border border-cyan-500/40">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block mb-1">
                  Translated Output ({SUPPORTED_LANGUAGES.find(l => l.code === settings.outputLanguage)?.name})
                </span>
                <p className="text-2xl font-black text-white leading-tight">
                  &ldquo;{translatedResult}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center space-x-2 pt-2">
            <button
              onClick={() => ttsService.speak(translatedResult)}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/25"
            >
              <Volume2 className="w-4 h-4" />
              <span>🔊 Speak in {SUPPORTED_LANGUAGES.find(l => l.code === settings.outputLanguage)?.name}</span>
            </button>
            <button
              onClick={handleCopy}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Copy translation"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
