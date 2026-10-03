/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AlertOctagon, 
  Volume2, 
  Maximize2, 
  MapPin, 
  X, 
  Check, 
  FileText 
} from 'lucide-react';
import { ttsService } from '../services/ttsService';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedSign?: string;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  detectedSign = 'HELP'
}) => {
  const [selectedPhrase, setSelectedPhrase] = useState('I need immediate assistance.');
  const [locationShared, setLocationShared] = useState(false);
  const [locationCoords, setLocationCoords] = useState<string | null>(null);
  const [isLoudSpeaking, setIsLoudSpeaking] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!isOpen) return null;

  const emergencyPhrases = [
    'I need immediate assistance.',
    'I am having a medical emergency. Please call an ambulance.',
    'I cannot hear or speak. Please assist me immediately.',
    'Please contact my emergency contact.',
    'I am allergic and need my medication right away.'
  ];

  const handleSpeakLoudly = () => {
    setIsLoudSpeaking(true);
    ttsService.speak(selectedPhrase, {
      rate: 0.9,
      pitch: 1.1,
      onEnd: () => setIsLoudSpeaking(false)
    });
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationCoords(`${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`);
          setLocationShared(true);
        },
        (err) => {
          console.warn('Geolocation permission denied or failed:', err);
          setLocationCoords('Location permission denied by browser.');
          setLocationShared(true);
        }
      );
    } else {
      setLocationCoords('Geolocation not supported on this device.');
      setLocationShared(true);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/80 backdrop-blur-md animate-in fade-in duration-200 ${
      isFullScreen ? 'p-0' : ''
    }`}>
      <div className={`relative w-full max-w-xl bg-[#FAF7F2] border-2 border-[#6B1D2F] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-[#1C1917] ${
        isFullScreen ? 'h-full max-w-none rounded-none' : 'max-h-[92vh]'
      }`}>
        {/* Urgent Burgundy Strobe Header */}
        <div className="bg-[#6B1D2F] text-[#FAF7F2] p-5 flex items-center justify-between border-b border-[#C5A059]/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#541524] text-[#C5A059] border border-[#C5A059]/40 flex items-center justify-center animate-pulse shadow-md">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-[#FAF7F2] flex items-center space-x-2">
                <span>EMERGENCY COMMUNICATION</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A059]/20 text-[#FAF7F2] border border-[#C5A059]/50 font-mono font-bold uppercase">
                  Active
                </span>
              </h2>
              <p className="text-xs text-[#FAF7F2]/80">
                Priority high-visibility interface for urgent assistance
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-xl text-[#FAF7F2]/80 hover:text-white hover:bg-[#541524] transition"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen Alert'}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#FAF7F2]/80 hover:text-white hover:bg-[#541524] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big Alert Message Display */}
        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#6B1D2F] text-center shadow-md">
            <span className="text-[10px] uppercase font-mono font-bold text-[#6B1D2F] block mb-1">
              Trigger Gesture: {detectedSign} (Emergency Confidence 96%)
            </span>
            <p className="text-2xl sm:text-3xl font-black text-[#1C1917] leading-tight drop-shadow-xs">
              &ldquo;{selectedPhrase}&rdquo;
            </p>
          </div>

          {/* Emergency Phrases Picker */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B1D2F] block mb-2">
              Select Immediate Phrase:
            </span>
            <div className="space-y-1.5">
              {emergencyPhrases.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhrase(phrase)}
                  className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition border ${
                    selectedPhrase === phrase
                      ? 'bg-[#F3ECE1] border-[#6B1D2F] text-[#6B1D2F] shadow-sm'
                      : 'bg-[#FFFFFF] border-[#E4DACB] text-[#57534E] hover:bg-[#FAF7F2]'
                  }`}
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Loud Speak Button */}
            <button
              onClick={handleSpeakLoudly}
              className={`flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider text-[#FAF7F2] shadow-lg transition ${
                isLoudSpeaking
                  ? 'bg-[#541524] animate-pulse'
                  : 'bg-[#6B1D2F] hover:bg-[#541524] shadow-[#6B1D2F]/30'
              }`}
            >
              <Volume2 className="w-4 h-4 text-[#C5A059]" />
              <span>🔊 Speak Loudly</span>
            </button>

            {/* Location Share Button */}
            <button
              onClick={handleShareLocation}
              className={`flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition border ${
                locationShared
                  ? 'bg-[#F3ECE1] border-[#16A34A] text-[#16A34A]'
                  : 'bg-[#FFFFFF] hover:bg-[#FAF7F2] text-[#1C1917] border-[#E4DACB]'
              }`}
            >
              {locationShared ? <Check className="w-4 h-4 text-[#16A34A]" /> : <MapPin className="w-4 h-4 text-[#6B1D2F]" />}
              <span>{locationShared ? 'Location Ready' : 'Share Location*'}</span>
            </button>
          </div>

          {/* Location info notice */}
          {locationCoords && (
            <div className="p-3 bg-[#FFFFFF] rounded-2xl border border-[#E4DACB] text-xs text-[#1C1917] flex items-center space-x-2 font-mono">
              <MapPin className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
              <span>GPS: {locationCoords}</span>
            </div>
          )}

          {/* Medical Information Card */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E4DACB] text-xs space-y-2">
            <span className="font-bold text-[#6B1D2F] flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#C5A059]" />
              <span>Emergency Accessibility Profile:</span>
            </span>
            <div className="grid grid-cols-2 gap-2 text-[#57534E] text-[11px]">
              <div>
                <span className="text-[#78716C] block font-medium">Communication:</span>
                <span className="text-[#1C1917] font-bold">Deaf / Sign Language User</span>
              </div>
              <div>
                <span className="text-[#78716C] block font-medium">Primary Language:</span>
                <span className="text-[#1C1917] font-bold">ASL / English</span>
              </div>
              <div>
                <span className="text-[#78716C] block font-medium">Emergency Contact:</span>
                <span className="text-[#1C1917] font-bold">+1 (555) 019-2834 (Family)</span>
              </div>
              <div>
                <span className="text-[#78716C] block font-medium">Medical Alert:</span>
                <span className="text-[#6B1D2F] font-bold">No known drug allergies</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E4DACB] bg-[#F7F2EB] flex items-center justify-between text-xs">
          <span className="text-[#78716C] text-[11px]">
            *Location sharing requires explicit browser consent.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#FFFFFF] border border-[#E4DACB] hover:bg-[#FAF7F2] text-[#1C1917] font-semibold transition"
          >
            Dismiss Alert
          </button>
        </div>
      </div>
    </div>
  );
};
