'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { aiService } from '@/services/ai';
import { speechService } from '@/services/speech';
import { demoCandidate } from '@/database/seed-data';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RotateCcw,
  Send,
  CheckCircle2,
  Volume1
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SurfaceCard from '@/components/ui/SurfaceCard';
import StatusBadge from '@/components/ui/StatusBadge';

type MicStatus = 'Ready' | 'Listening' | 'Processing' | 'Speaking';

export default function VoicePage() {
  const [candidate, setCandidate] = useState<{ profile: any; accessibility: any; skills: string[] }>(demoCandidate);
  const [status, setStatus] = useState<MicStatus>('Ready');
  const [userTranscript, setUserTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    setSpeechSupported(speechService.isSpeechSupported());

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('innoskill_candidate') || localStorage.getItem('openability_candidate');
      if (stored) {
        try {
          setCandidate(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }

    return () => {
      speechService.stopSpeaking();
      speechService.stopListening();
    };
  }, []);

  const handleStartListening = () => {
    if (!speechSupported) {
      alert('Speech Recognition is not supported by your browser. Please type your query in the fallback box below.');
      return;
    }

    speechService.stopSpeaking();
    setStatus('Listening');
    setUserTranscript('');
    
    speechService.startListening(
      (result) => {
        setStatus('Processing');
        setUserTranscript(result);
        processVoiceRequest(result);
      },
      (error) => {
        console.error('Speech recognition error:', error);
        setStatus('Ready');
      }
    );
  };

  const handleStopListening = () => {
    speechService.stopListening();
    setStatus('Ready');
  };

  const processVoiceRequest = async (text: string) => {
    setStatus('Processing');
    try {
      const response = await aiService.chatWithAssistant(
        text,
        {
          fullName: candidate.profile.fullName,
          skills: candidate.skills,
          accessibility: candidate.accessibility
        },
        []
      );
      
      setAiResponse(response);
      setStatus('Speaking');
      
      speechService.speak(response, () => {
        setStatus('Ready');
      });
    } catch (e) {
      console.error(e);
      setAiResponse("I had trouble analyzing your voice query. Please try again.");
      setStatus('Ready');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    setUserTranscript(manualInput);
    processVoiceRequest(manualInput);
    setManualInput('');
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      
      <PageHeader 
        eyebrow="Hands-Free Interface" 
        title="Voice Career Assistant" 
        description="Interact with the platform using natural conversational voice. Ask for job matches, role requirements, or interview tips." 
        icon={Volume2} 
      />

      {/* Main Voice Interactive Studio */}
      <div className="max-w-2xl mx-auto space-y-6">
        
        <SurfaceCard className="p-8 sm:p-10 border border-[#DCE5F0] bg-white text-center space-y-6 shadow-md">
          
          {/* Status Badge */}
          <div className="flex justify-center">
            {status === 'Ready' && <StatusBadge tone="neutral">Engine Ready</StatusBadge>}
            {status === 'Listening' && <StatusBadge tone="danger">Listening to Voice Input...</StatusBadge>}
            {status === 'Processing' && <StatusBadge tone="info">Processing Natural Language...</StatusBadge>}
            {status === 'Speaking' && <StatusBadge tone="success">Speaking Response Aloud...</StatusBadge>}
          </div>

          {/* Central Large Microphone Button */}
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              {status === 'Listening' && (
                <div className="absolute inset-0 rounded-full bg-[#2F6FED]/20 animate-ping" />
              )}
              {status === 'Speaking' && (
                <div className="absolute inset-0 rounded-full bg-[#16A36A]/20 animate-pulse" />
              )}
              <button
                onClick={status === 'Listening' ? handleStopListening : handleStartListening}
                className={`w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                  status === 'Listening'
                    ? 'bg-red-500 text-white shadow-red-200'
                    : status === 'Speaking'
                    ? 'bg-[#16A36A] text-white'
                    : 'bg-[#2F6FED] text-white hover:bg-[#245ED0] hover:scale-105 shadow-[#2F6FED]/25'
                }`}
                aria-label={status === 'Listening' ? "Stop listening" : "Start speaking"}
              >
                {status === 'Listening' ? (
                  <MicOff className="w-12 h-12" />
                ) : status === 'Speaking' ? (
                  <Volume1 className="w-12 h-12" />
                ) : (
                  <Mic className="w-12 h-12" />
                )}
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#172033]">
                {status === 'Listening' 
                  ? 'Listening... Speak your question now' 
                  : status === 'Processing' 
                  ? 'Analyzing candidate profile & query...' 
                  : status === 'Speaking' 
                  ? 'Playing synthesized audio response' 
                  : 'Tap microphone to start conversation'}
              </h3>
              <p className="text-xs text-[#718096] mt-1">
                Indian English (`en-IN`) & global speech synthesis supported
              </p>
            </div>
          </div>

          {/* Spoken Transcript Card */}
          {userTranscript && (
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DCE5F0] text-left space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">Your Question</span>
              <p className="text-xs font-semibold text-[#172033]">{userTranscript}</p>
            </div>
          )}

          {/* AI Response Card */}
          {aiResponse && (
            <div className="p-5 rounded-2xl bg-[#EAF2FF] border border-[#C8D5E5] text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F6FED] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Spoken AI Response
                </span>
                <button
                  onClick={() => speechService.speak(aiResponse)}
                  className="text-xs font-bold text-[#2F6FED] hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay Audio</span>
                </button>
              </div>
              <p className="text-xs leading-relaxed text-[#172033] font-medium">
                {aiResponse}
              </p>
            </div>
          )}

          {/* Text Fallback Input */}
          <form onSubmit={handleManualSubmit} className="pt-3 border-t border-[#DCE5F0] flex gap-2">
            <input
              type="text"
              placeholder="Or type your voice query here..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="input-pearl text-xs flex-1"
            />
            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="button-primary text-xs !py-2 !px-4"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </SurfaceCard>

      </div>

    </div>
  );
}
