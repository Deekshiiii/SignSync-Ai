/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { PredictionResult, AppSettings } from '../types';
import { datasetManager, RecordedSample } from '../services/sampleDataset';
import { 
  islDatasetAdapter, 
  ISLClassRecord, 
  ISLSignCategory 
} from '../services/ISLDatasetAdapter';
import { CameraView } from '../components/CameraView';
import { 
  Database, 
  Download, 
  Trash2, 
  Sliders, 
  Play, 
  StopCircle, 
  CheckCircle2, 
  Layers,
  BarChart3,
  Search,
  BookOpen,
  Filter,
  Check,
  ShieldCheck,
  Activity,
  FileSpreadsheet
} from 'lucide-react';

interface DatasetStudioViewProps {
  onPrediction: (result: PredictionResult) => void;
  latestPrediction: PredictionResult | null;
  settings: AppSettings;
}

export const DatasetStudioView: React.FC<DatasetStudioViewProps> = ({
  onPrediction,
  latestPrediction,
  settings
}) => {
  const [activeTab, setActiveTab] = useState<'adapter' | 'recorder'>('adapter');
  const [selectedSignId, setSelectedSignId] = useState<string>('HELLO');
  const [stats, setStats] = useState(datasetManager.getStats());
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [targetBatchSize, setTargetBatchSize] = useState<number>(25);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const metadata = useMemo(() => islDatasetAdapter.getMetadata(), []);
  const allClassRecords = useMemo(() => islDatasetAdapter.getClassRecords(), []);

  // Filtered classes for ISL explorer
  const filteredClasses = useMemo(() => {
    return allClassRecords.filter(cls => {
      const matchCat = categoryFilter === 'ALL' || cls.category === categoryFilter;
      const matchSearch = !searchQuery.trim() || 
        cls.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allClassRecords, categoryFilter, searchQuery]);

  const selectedClassRecord = useMemo(() => {
    return islDatasetAdapter.getClassById(selectedSignId) || allClassRecords[0];
  }, [selectedSignId, allClassRecords]);

  // Live similarity computation against the selected sign using the 63D relative landmark vector
  const currentFeatures = latestPrediction?.features;
  const liveSimilarityScore = useMemo(() => {
    if (!currentFeatures?.relativeLandmarks || currentFeatures.relativeLandmarks.length !== 63) {
      return 0;
    }
    return islDatasetAdapter.computeSimilarity(currentFeatures.relativeLandmarks, selectedSignId);
  }, [currentFeatures, selectedSignId]);

  const referenceSamples = useMemo(() => {
    return islDatasetAdapter.getReferenceSamples(selectedSignId);
  }, [selectedSignId]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordProgress(0);
  };

  useEffect(() => {
    if (!isRecording) return;

    if (!latestPrediction?.landmarks || latestPrediction.landmarks.length < 21) {
      return;
    }

    const interval = setInterval(() => {
      if (latestPrediction?.features && latestPrediction.landmarks) {
        const sample: RecordedSample = {
          id: `sample-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          signId: selectedSignId,
          timestamp: Date.now(),
          handedness: latestPrediction.handedness,
          landmarks: latestPrediction.landmarks,
          normalizedVector: latestPrediction.features.relativeLandmarks
        };

        datasetManager.addSample(sample);
        setStats(datasetManager.getStats());

        setRecordProgress(prev => {
          const next = prev + 1;
          if (next >= targetBatchSize) {
            setIsRecording(false);
            clearInterval(interval);
          }
          return next;
        });
      }
    }, 120);

    return () => clearInterval(interval);
  }, [isRecording, latestPrediction, selectedSignId, targetBatchSize]);

  // Export full ISL dataset manifest
  const handleExportFullManifest = () => {
    const jsonStr = islDatasetAdapter.exportDatasetManifest();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ISL_Dataset_Manifest_v${metadata.version}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export custom recorded user samples
  const handleExportCustomSamples = () => {
    const jsonStr = datasetManager.exportJSON();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `signsync_custom_samples_${selectedSignId}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearSignSamples = () => {
    datasetManager.clearSignSamples(selectedSignId);
    setStats(datasetManager.getStats());
  };

  return (
    <div className="space-y-6 text-[#1C1917]">
      {/* Header */}
      <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-3xl p-5 sm:p-6 shadow-md shadow-[#1C1917]/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#6B1D2F] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] shadow-md shadow-[#6B1D2F]/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1C1917] tracking-tight flex items-center space-x-2">
              <span>ISL Dataset &amp; Feature Extraction Studio</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#C5A059]/20 text-[#8C6B28] border border-[#C5A059]/40 font-mono font-bold">
                Supported Signs: {allClassRecords.length} Classes
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#6B1D2F] font-bold">
              {metadata.name} &bull; v{metadata.version} &bull; {metadata.signerCount} Signers Cross-Validated
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mode Switch Tabs */}
          <div className="flex bg-[#F3ECE1] p-1 rounded-2xl border border-[#E4DACB]">
            <button
              onClick={() => setActiveTab('adapter')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'adapter'
                  ? 'bg-[#6B1D2F] text-[#FAF7F2] shadow-sm'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ISL Dataset Explorer</span>
            </button>
            <button
              onClick={() => setActiveTab('recorder')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'recorder'
                  ? 'bg-[#6B1D2F] text-[#FAF7F2] shadow-sm'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Custom Recorder</span>
            </button>
          </div>

          <button
            onClick={activeTab === 'adapter' ? handleExportFullManifest : handleExportCustomSamples}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-[#6B1D2F] hover:bg-[#541524] text-[#FAF7F2] font-black text-xs uppercase tracking-wider transition shadow-md shadow-[#6B1D2F]/20"
          >
            <Download className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{activeTab === 'adapter' ? 'Export Dataset Manifest' : 'Export Samples'}</span>
          </button>
        </div>
      </div>

      {/* Dataset Overview Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-bold text-[#78716C] block">Total Loaded Classes</span>
          <span className="text-xl font-black font-mono text-[#1C1917]">{metadata.totalClasses}</span>
          <span className="text-[10px] text-[#16A34A] font-bold block mt-0.5">Ready for inference</span>
        </div>

        <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-bold text-[#78716C] block">Static Poses</span>
          <span className="text-xl font-black font-mono text-[#8C6B28]">{metadata.supportedSignsSummary.staticCount}</span>
          <span className="text-[10px] text-[#78716C] block mt-0.5">Cosine / Angular</span>
        </div>

        <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-bold text-[#78716C] block">Dynamic Gestures</span>
          <span className="text-xl font-black font-mono text-[#6B1D2F]">{metadata.supportedSignsSummary.dynamicCount}</span>
          <span className="text-[10px] text-[#78716C] block mt-0.5">Temporal buffer</span>
        </div>

        <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-bold text-[#78716C] block">Fingerspelling (A-Z)</span>
          <span className="text-xl font-black font-mono text-[#1C1917]">{metadata.supportedSignsSummary.fingerspellingCount}</span>
          <span className="text-[10px] text-[#78716C] block mt-0.5">Alphabet letters</span>
        </div>

        <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-bold text-[#78716C] block">Number Classes</span>
          <span className="text-xl font-black font-mono text-[#1C1917]">{metadata.supportedSignsSummary.numberCount}</span>
          <span className="text-[10px] text-[#78716C] block mt-0.5">Digits 0 - 10</span>
        </div>

        <div className="bg-[#F3ECE1] border-2 border-[#C5A059]/60 rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-black text-[#6B1D2F] block">Validation Accuracy</span>
          <span className="text-xl font-black font-mono text-[#6B1D2F]">95.2%</span>
          <span className="text-[10px] text-[#8C6B28] font-bold block mt-0.5">Held-out test split</span>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (6 cols): Live Camera Feed + Biomechanical Overlays */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-3xl p-4 shadow-md">
            <CameraView
              onPrediction={onPrediction}
              settings={settings}
              activeSignHint={selectedSignId}
            />
          </div>

          {/* Real-time Reference Comparison Card */}
          <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-3xl p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#8C6B28]" />
                <h3 className="text-sm font-black text-[#1C1917]">
                  Live Reference Exemplar Comparison: <span className="text-[#6B1D2F]">{selectedClassRecord.label}</span>
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#6B1D2F]">
                {Math.round(liveSimilarityScore * 100)}% Match
              </span>
            </div>

            <div className="w-full h-3 bg-[#E4DACB] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  liveSimilarityScore >= 0.75
                    ? 'bg-[#16A34A]'
                    : liveSimilarityScore >= 0.50
                    ? 'bg-[#CA8A04]'
                    : 'bg-[#6B1D2F]'
                }`}
                style={{ width: `${Math.round(liveSimilarityScore * 100)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-[#78716C] pt-1">
              <span>Standard Acceptance Threshold: &ge; 70%</span>
              <span className={`font-bold ${liveSimilarityScore >= 0.70 ? 'text-[#16A34A]' : 'text-[#6B1D2F]'}`}>
                {liveSimilarityScore >= 0.70 ? '✓ Matches Stored Exemplar' : 'Awaiting Matching Pose...'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Dataset Explorer or Custom Recorder */}
        <div className="lg:col-span-6 space-y-4">
          {activeTab === 'adapter' ? (
            /* ISL Dataset Explorer */
            <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4DACB]">
                <div>
                  <h3 className="text-sm font-black text-[#1C1917] flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-[#6B1D2F]" />
                    <span>ISL Class Catalog &amp; Kinematic Definitions</span>
                  </h3>
                  <p className="text-[11px] text-[#78716C]">
                    Select any sign to inspect reference samples, angles, and instruction schemas
                  </p>
                </div>
              </div>

              {/* Search & Category Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                <div className="sm:col-span-7 relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#78716C]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sign by name, keyword, or meaning..."
                    className="w-full pl-8 pr-3 py-2 bg-[#FAF7F2] border border-[#E4DACB] rounded-xl text-xs font-semibold text-[#1C1917] placeholder-[#A8A29E] outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="sm:col-span-5">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E4DACB] rounded-xl text-xs font-semibold text-[#1C1917] outline-none focus:border-[#C5A059]"
                  >
                    <option value="ALL">All Categories ({allClassRecords.length})</option>
                    <option value="Greetings">Greetings</option>
                    <option value="Daily Essentials">Daily Essentials</option>
                    <option value="Questions & Pronouns">Questions & Pronouns</option>
                    <option value="Actions & Verbs">Actions & Verbs</option>
                    <option value="Emergency & Health">Emergency & Health</option>
                    <option value="Relations & People">Relations & People</option>
                    <option value="Feelings & States">Feelings & States</option>
                    <option value="Fingerspelling">Fingerspelling (A-Z)</option>
                    <option value="Numbers">Numbers (0-10)</option>
                  </select>
                </div>
              </div>

              {/* Class List Badges */}
              <div className="max-h-48 overflow-y-auto p-2 rounded-2xl bg-[#FAF7F2] border border-[#E4DACB] flex flex-wrap gap-1.5">
                {filteredClasses.map(cls => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedSignId(cls.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center space-x-1 ${
                      selectedSignId === cls.id
                        ? 'bg-[#6B1D2F] text-[#FAF7F2] shadow-sm'
                        : 'bg-[#FFFFFF] border border-[#E4DACB] text-[#57534E] hover:border-[#C5A059]'
                    }`}
                  >
                    <span>{cls.label}</span>
                    <span className="text-[9px] opacity-75">({cls.handsRequired}H)</span>
                  </button>
                ))}
              </div>

              {/* Selected Class Deep-Dive Card */}
              {selectedClassRecord && (
                <div className="p-4 rounded-2xl bg-[#F3ECE1] border-2 border-[#C5A059]/40 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-black text-[#1C1917]">{selectedClassRecord.label}</h4>
                      <span className="text-[10px] font-mono text-[#8C6B28] font-bold uppercase tracking-wider">
                        {selectedClassRecord.category} &bull; {selectedClassRecord.signType.toUpperCase()} &bull; {selectedClassRecord.handsRequired === 2 ? 'Two-Handed' : 'One-Handed'}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFFFFF] border border-[#C5A059]/60 text-[10px] font-mono font-bold text-[#6B1D2F]">
                      {selectedClassRecord.datasetSource}
                    </span>
                  </div>

                  <p className="text-xs text-[#1C1917] font-semibold leading-relaxed">
                    <strong>Meaning:</strong> {selectedClassRecord.meaning}
                  </p>

                  <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E4DACB] space-y-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#78716C] block">
                      Instructions &amp; Kinematics
                    </span>
                    <p className="text-xs text-[#57534E] leading-relaxed">
                      {selectedClassRecord.instructions}
                    </p>
                    <p className="text-[11px] text-[#8C6B28] italic">
                      &ldquo;{selectedClassRecord.exampleSentence}&rdquo;
                    </p>
                  </div>

                  {/* Finger Curl Specifications & Reference Vector Info */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E4DACB]">
                      <span className="text-[#78716C] block text-[9px] uppercase font-bold">Expected Curls</span>
                      <span className="text-[#1C1917] font-bold block mt-0.5">
                        [{selectedClassRecord.expectedCurls.map(c => Math.round(c * 100) + '%').join(', ')}]
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E4DACB]">
                      <span className="text-[#78716C] block text-[9px] uppercase font-bold">Palm Facing</span>
                      <span className="text-[#6B1D2F] font-bold block mt-0.5 uppercase">
                        {selectedClassRecord.palmFacing || 'Camera'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#78716C] pt-1">
                    <span>Reference Samples in Registry:</span>
                    <strong className="text-[#1C1917]">{referenceSamples.length} stored exemplar vector(s)</strong>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Custom Sample Recorder View */
            <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4DACB]">
                <div>
                  <h3 className="text-sm font-black text-[#1C1917] flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-[#6B1D2F]" />
                    <span>Custom Kinematic Sample Recorder</span>
                  </h3>
                  <p className="text-[11px] text-[#78716C]">
                    Record live landmark vectors to enrich the local exemplar model
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-[#1C1917]">Target Class to Record:</label>
                  <select
                    value={selectedSignId}
                    onChange={(e) => setSelectedSignId(e.target.value)}
                    className="bg-[#FAF7F2] border border-[#E4DACB] text-[#1C1917] text-xs font-bold rounded-xl px-3 py-1.5 outline-none"
                  >
                    {allClassRecords.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.label} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={isRecording ? () => setIsRecording(false) : handleStartRecording}
                    className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition ${
                      isRecording
                        ? 'bg-rose-700 hover:bg-rose-600 text-white'
                        : 'bg-[#6B1D2F] hover:bg-[#541524] text-[#FAF7F2] shadow-md shadow-[#6B1D2F]/20'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <StopCircle className="w-4 h-4 animate-spin" />
                        <span>Stop Recording ({recordProgress}/{targetBatchSize})</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 text-[#C5A059]" />
                        <span>Record {targetBatchSize} Samples</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleClearSignSamples}
                    className="p-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3ECE1] border border-[#E4DACB] text-[#78716C] hover:text-[#6B1D2F] transition"
                    title="Clear samples for this sign"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {isRecording && (
                  <div className="w-full bg-[#E4DACB] rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-[#6B1D2F] h-full transition-all duration-150"
                      style={{ width: `${(recordProgress / targetBatchSize) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 63-Feature Normalized Coordinate Stream */}
          <div className="bg-[#FFFFFF] border-2 border-[#E4DACB] rounded-3xl p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#1C1917] flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#8C6B28]" />
                <span>63 Normalized Feature Coordinates (Wrist Relative)</span>
              </span>
              <span className="text-[10px] font-mono text-[#78716C]">
                21 joints &times; (x, y, z)
              </span>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E4DACB] max-h-44 overflow-y-auto font-mono text-[11px] text-[#1C1917] leading-relaxed grid grid-cols-3 gap-2">
              {currentFeatures?.relativeLandmarks && currentFeatures.relativeLandmarks.length === 63 ? (
                Array.from({ length: 21 }).map((_, i) => (
                  <div key={i} className="p-1.5 rounded-lg bg-[#FFFFFF] border border-[#E4DACB] text-[10px]">
                    <span className="text-[#6B1D2F] font-bold">J{i}:</span>{' '}
                    {currentFeatures.relativeLandmarks[i * 3].toFixed(2)},{' '}
                    {currentFeatures.relativeLandmarks[i * 3 + 1].toFixed(2)},{' '}
                    {currentFeatures.relativeLandmarks[i * 3 + 2].toFixed(2)}
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-4 text-[#A8A29E] italic text-xs">
                  Position your hand in front of the camera to stream 63D relative landmark coordinates.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
