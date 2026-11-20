'use client';

import React, { useState, useEffect } from 'react';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { 
  Mic, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  FileText,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';

export default function VoiceAgentWidget() {
  const {
    status,
    transcript,
    voiceLogs,
    clearVoiceLogs,
    feedback,
    ttsEnabled,
    setTtsEnabled,
    startAgentListening,
    toggleAgentListening,
    replayLastSpeech
  } = useVoiceAgent();

  const [expanded, setExpanded] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lastToastText, setLastToastText] = useState('');

  // Auto-trigger live spoken text toast when transcript changes
  useEffect(() => {
    if (transcript && transcript.trim()) {
      const timer = setTimeout(() => {
        setLastToastText(transcript);
        setShowToast(true);
      }, 0);
      const hideTimer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [transcript]);

  // Custom event listener to open and trigger the voice agent from navigation
  useEffect(() => {
    const handleOpenAgent = () => {
      setExpanded(true);
      setTimeout(() => {
        startAgentListening();
      }, 100);
    };

    window.addEventListener('open-voice-agent', handleOpenAgent);
    return () => {
      window.removeEventListener('open-voice-agent', handleOpenAgent);
    };
  }, [startAgentListening]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleAgentListening();
    }
  };

  const copyLogsToClipboard = () => {
    if (voiceLogs.length === 0) return;
    const formatted = voiceLogs
      .map((log) => `[${log.timestamp}] ${log.source === 'user' ? 'User' : 'Assistant'}: ${log.text}`)
      .join('\n');
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusText = () => {
    switch (status) {
      case 'LISTENING': return 'Listening...';
      case 'PROCESSING': return 'Processing intent...';
      case 'EXECUTING': return 'Navigating...';
      case 'CONFIRMING': return 'Awaiting response...';
      case 'ERROR': return 'Connection error';
      default: return 'Voice Control';
    }
  };

  return (
    <>
      {/* Spoken Text Overlay Toast Banner */}
      {showToast && lastToastText && (
        <div 
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] max-w-lg w-[90%] bg-white border border-[#C8D5E5] text-[#172033] px-4 py-3 rounded-2xl shadow-[0_10px_30px_rgba(22,59,115,0.12)] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#2F6FED]">
              <Mic className="w-4 h-4 animate-pulse" />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">Live Voice Input</span>
              <p className="text-xs font-semibold text-[#172033] truncate">{lastToastText}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                setExpanded(true);
                setShowLogs(true);
                setShowToast(false);
              }}
              className="px-2.5 py-1 text-[10px] font-bold bg-[#EAF2FF] hover:bg-[#DCE5F0] text-[#2F6FED] rounded-lg transition"
            >
              Logs
            </button>
            <button
              onClick={() => setShowToast(false)}
              className="p-1 text-[#718096] hover:text-[#172033] rounded-lg"
              aria-label="Close Toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Controller Widget (Bottom Left to avoid collision with PersistentAssistant on bottom right) */}
      <div className="fixed bottom-6 left-4 sm:left-6 z-[99] select-none max-w-[calc(100vw-32px)]">
        
        {/* Collapsed Pill */}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-white border border-[#DCE5F0] text-[#172033] rounded-2xl hover:border-[#2F6FED] hover:bg-[#F4F8FF] shadow-[0_4px_14px_rgba(22,59,115,0.08)] transition-all cursor-pointer focus:ring-2 focus:ring-[#2F6FED]"
            aria-label="Open Voice Agent Console"
          >
            <div className="relative">
              <Mic className={`w-4 h-4 ${status === 'LISTENING' ? 'text-red-500 animate-pulse' : 'text-[#2F6FED]'}`} />
              {status === 'LISTENING' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </div>
            <span className="text-xs font-bold tracking-tight text-[#172033]">Voice Engine</span>
            {voiceLogs.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#EAF2FF] text-[#2F6FED] rounded-md border border-[#C8D5E5]">
                {voiceLogs.length}
              </span>
            )}
          </button>
        )}

        {/* Expanded Voice Agent Drawer */}
        {expanded && (
          <div 
            className="w-[calc(100vw-32px)] sm:w-84 max-w-sm bg-white border border-[#DCE5F0] text-[#172033] rounded-[20px] p-4 sm:p-5 shadow-[0_12px_40px_rgba(22,59,115,0.14)] space-y-4 animate-in slide-in-from-bottom-4 duration-200"
            role="dialog"
            aria-label="Voice Agent Interface"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#DCE5F0] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#EAF2FF] text-[#2F6FED]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-xs tracking-tight text-[#172033]">Voice Navigation Engine</h3>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    showLogs ? 'bg-[#EAF2FF] text-[#2F6FED]' : 'text-[#718096] hover:bg-[#F1F5FA]'
                  }`}
                  title="Toggle Voice Logs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{voiceLogs.length}</span>
                </button>

                <button
                  onClick={() => setExpanded(false)}
                  className="p-1.5 hover:bg-[#F1F5FA] rounded-lg text-[#718096] hover:text-[#172033] transition"
                  aria-label="Collapse Voice Agent Console"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* View 1: Voice Control & Microphone */}
            {!showLogs && (
              <>
                <div className="p-5 bg-[#F7F9FC] rounded-2xl border border-[#EAF0F6] flex flex-col items-center justify-center text-center space-y-3">
                  <button
                    onClick={toggleAgentListening}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition border shadow-xs cursor-pointer focus:ring-2 focus:ring-[#2F6FED] ${
                      status === 'LISTENING'
                        ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                        : 'bg-[#2F6FED] border-[#2F6FED] text-white hover:bg-[#245ED0]'
                    }`}
                    aria-label={status === 'LISTENING' ? "Mute Microphone" : "Activate Microphone"}
                  >
                    <Mic className="w-6 h-6" />
                  </button>

                  <div>
                    <span className="text-xs font-bold text-[#172033]">{getStatusText()}</span>
                    <p className="text-[10px] text-[#718096] mt-0.5">Press spacebar or click to speak</p>
                  </div>
                </div>

                {feedback && (
                  <div className="bg-[#EAF2FF] border border-[#C8D5E5] p-3 rounded-xl text-xs font-medium text-[#163B73] leading-relaxed">
                    {feedback}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#DCE5F0]">
                  <button
                    onClick={() => setTtsEnabled(!ttsEnabled)}
                    className="flex items-center gap-1.5 text-[#718096] hover:text-[#2F6FED] transition font-medium"
                  >
                    {ttsEnabled ? <Volume2 className="w-4 h-4 text-[#2F6FED]" /> : <VolumeX className="w-4 h-4" />}
                    <span>{ttsEnabled ? 'Audio Output On' : 'Audio Output Off'}</span>
                  </button>
                  <button
                    onClick={replayLastSpeech}
                    className="flex items-center gap-1 text-[#718096] hover:text-[#2F6FED] transition font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Repeat</span>
                  </button>
                </div>
              </>
            )}

            {/* View 2: Logs */}
            {showLogs && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">Spoken Utterances</span>
                  <div className="flex gap-2">
                    <button
                      onClick={copyLogsToClipboard}
                      className="text-[10px] font-semibold text-[#2F6FED] hover:underline flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-[#16A36A]" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={clearVoiceLogs}
                      className="text-[10px] font-semibold text-[#D64545] hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-44 overflow-y-auto space-y-2 text-xs p-2 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl scrollbar-none">
                  {voiceLogs.length === 0 ? (
                    <p className="text-[11px] text-[#A0A9B8] text-center py-4">No utterances recorded yet.</p>
                  ) : (
                    voiceLogs.map((log, idx) => (
                      <div key={idx} className="p-2 bg-white rounded-lg border border-[#DCE5F0] text-[11px]">
                        <div className="flex justify-between text-[9px] text-[#718096] mb-0.5">
                          <span className="font-bold text-[#2F6FED] uppercase">{log.source}</span>
                          <span>{log.timestamp}</span>
                        </div>
                        <p className="text-[#172033] font-medium">{log.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </>
  );
}
