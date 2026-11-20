'use client';

import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '@/services/ai';
import { speechService } from '@/services/speech';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { X, Send, Mic, MicOff, Volume2, VolumeX, Sparkles, Bot } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function PersistentAssistant() {
  const { candidate } = useVoiceAgent();
  const fullName = candidate.profile?.fullName || 'Candidate';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `Hello! I'm your InnoSkill AI Career Companion. Ask me to recommend jobs, evaluate skills, or guide your career preparation.` }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Clean speech synthesis if closing assistant
  useEffect(() => {
    if (!isOpen) {
      speechService.stopSpeaking();
    }
  }, [isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    if (isListening) {
      stopListening();
    }

    const newMessages = [...messages, { role: 'user', content: textToSend } as ChatMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const response = await aiService.chatWithAssistant(
        textToSend,
        {
          fullName: candidate.profile?.fullName || 'Candidate',
          skills: candidate.skills,
          accessibility: candidate.accessibility
        },
        messages
      );

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);

      if (ttsEnabled) {
        speechService.speak(response);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: "I encountered a connection hiccup. Please try asking again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = () => {
    setIsListening(true);
    speechService.startListening(
      (result) => {
        setInput(result);
        setIsListening(false);
        handleSend(result);
      },
      (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
      }
    );
  };

  const stopListening = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 select-none max-w-[calc(100vw-32px)]">
      
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-[#2F6FED] hover:bg-[#245ED0] text-white rounded-2xl shadow-[0_4px_16px_rgba(47,111,237,0.35)] transition-all hover:scale-102 focus:ring-2 focus:ring-[#2F6FED]"
          aria-label="Open AI Career Companion"
        >
          <Bot className="w-5 h-5 text-white" />
          <span className="text-xs font-bold tracking-tight">AI Companion</span>
        </button>
      )}

      {/* Main Chat Panel */}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-96 max-w-sm h-[480px] sm:h-[520px] flex flex-col bg-white border border-[#DCE5F0] rounded-[20px] shadow-[0_10px_35px_rgba(22,59,115,0.14)] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-[#FFFFFF] px-4 py-3.5 flex items-center justify-between text-[#172033] border-b border-[#DCE5F0]">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#EAF2FF] text-[#2F6FED]">
                <Sparkles className="w-4.5 h-4.5" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-[#172033]">AI Career Companion</h3>
                <span className="text-[10px] text-[#2F6FED] font-semibold">{fullName} • Context Active</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className={`p-1.5 rounded-lg transition hover:bg-[#F1F5FA] ${
                  ttsEnabled ? 'text-[#2F6FED] bg-[#EAF2FF]' : 'text-[#718096]'
                }`}
                title={ttsEnabled ? "Mute audio readout" : "Read responses aloud"}
              >
                {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#718096] hover:bg-[#F1F5FA] hover:text-[#172033] transition"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Box */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#F7F9FC]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#2F6FED] text-white rounded-tr-xs shadow-xs'
                      : 'bg-white border border-[#DCE5F0] text-[#172033] rounded-tl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#DCE5F0] rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-xs text-xs text-[#718096] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#2F6FED] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#2F6FED] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#2F6FED] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Preset Helper Prompts */}
          <div className="px-3.5 py-2 bg-white border-t border-[#DCE5F0] flex gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap">
            {[
              { label: '💼 Job matches', prompt: 'What jobs match my current skills?' },
              { label: '🎯 Skill gaps', prompt: 'What skills should I learn next?' },
              { label: '🎙️ Mock interview', prompt: 'How should I practice for upcoming technical interviews?' },
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.prompt)}
                className="text-[11px] font-semibold text-[#4B5870] bg-[#F7F9FC] border border-[#DCE5F0] px-2.5 py-1 rounded-lg hover:border-[#2F6FED] hover:text-[#2F6FED] hover:bg-[#EAF2FF] transition cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Message Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-white border-t border-[#DCE5F0] flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition flex items-center justify-center shrink-0 border cursor-pointer ${
                isListening 
                  ? 'bg-red-50 border-red-200 text-red-500 animate-pulse' 
                  : 'bg-[#F7F9FC] hover:bg-[#EAF2FF] border-[#DCE5F0] text-[#718096] hover:text-[#2F6FED]'
              }`}
              title={isListening ? "Stop voice listening" : "Start voice listening"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your career..."
              className="flex-1 text-xs sm:text-sm bg-[#F7F9FC] border border-[#DCE5F0] rounded-xl px-3.5 py-2.5 focus:border-[#2F6FED] focus:bg-white text-[#172033] placeholder:text-[#A0A9B8]"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-[#2F6FED] text-white hover:bg-[#245ED0] disabled:opacity-40 flex items-center justify-center shrink-0 transition cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
