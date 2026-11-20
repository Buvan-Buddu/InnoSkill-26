'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { aiService } from '@/services/ai';
import PageHeader from '@/components/ui/PageHeader';
import { speechService } from '@/services/speech';
import { demoCandidate } from '@/database/seed-data';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  User, 
  Award, 
  ShieldCheck, 
  Bot,
  Briefcase
} from 'lucide-react';
import SurfaceCard from '@/components/ui/SurfaceCard';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AssistantPage() {
  const [candidate, setCandidate] = useState<{ profile: any; accessibility: any; skills: string[] }>(demoCandidate);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: "Hello! I am your InnoSkill AI Career Companion. Review your candidate stats on the right and ask me questions about suitable jobs, skill gap closure, or interview preparation." 
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
      speechService.stopListening();
    };
  }, []);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
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

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (ttsEnabled) {
        speechService.speak(response);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: "I ran into a temporary issue connecting to the inference engine. Please try again."
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechService.startListening(
        (transcript) => {
          setInput(transcript);
          setIsListening(false);
          handleSend(transcript);
        },
        (error) => {
          console.error(error);
          setIsListening(false);
        }
      );
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      
      <PageHeader 
        eyebrow="Interactive Coaching" 
        title="AI Career Companion Workspace" 
        description="Collaborate with your dedicated AI advisor on resume refinements, career pivots, and accommodation negotiation strategies." 
        icon={Bot} 
      />

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[calc(100vh-230px)] min-h-[580px]">
        
        {/* Chat Conversation Area (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col h-full surface-card border border-[#DCE5F0] bg-white overflow-hidden shadow-sm">
          
          {/* Conversation Header */}
          <div className="px-6 py-4 border-b border-[#DCE5F0] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#EAF2FF] text-[#2F6FED]">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-[#172033]">Adaptive Career Dialogue</h3>
                <span className="text-[10px] text-[#16A36A] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]" /> Active Session
                </span>
              </div>
            </div>

            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                ttsEnabled 
                  ? 'bg-[#EAF2FF] border-[#2F6FED] text-[#2F6FED]' 
                  : 'bg-white border-[#DCE5F0] text-[#718096] hover:bg-[#F7F9FC]'
              }`}
              title="Toggle audio response playback"
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{ttsEnabled ? 'Audio Speech On' : 'Audio Speech Off'}</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#F7F9FC]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-5 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-[#2F6FED] text-white rounded-tr-xs'
                      : 'bg-white border border-[#DCE5F0] text-[#172033] rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#DCE5F0] rounded-2xl rounded-tl-xs px-5 py-3 shadow-xs text-xs text-[#718096] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#2F6FED] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#2F6FED] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#2F6FED] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Starter Suggestions Strip */}
          <div className="px-5 py-2.5 bg-white border-t border-[#DCE5F0] flex gap-2 overflow-x-auto scrollbar-none whitespace-nowrap">
            {[
              { label: '💼 Recommend positions', prompt: 'Which active jobs best match my skills and accommodations?' },
              { label: '🎯 Close skill gaps', prompt: 'What specific skills should I learn to qualify for senior roles?' },
              { label: '📝 Resume advice', prompt: 'How can I highlight my accessibility accommodation achievements?' },
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.prompt)}
                className="text-[11px] font-semibold text-[#4B5870] bg-[#F7F9FC] border border-[#DCE5F0] px-3 py-1 rounded-xl hover:border-[#2F6FED] hover:text-[#2F6FED] hover:bg-[#EAF2FF] transition cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Message Composer Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-4 bg-white border-t border-[#DCE5F0] flex items-center gap-2.5"
          >
            <button
              type="button"
              onClick={handleToggleListening}
              className={`p-3 rounded-xl transition flex items-center justify-center shrink-0 border cursor-pointer ${
                isListening 
                  ? 'bg-red-50 border-red-300 text-red-600 animate-pulse' 
                  : 'bg-[#F7F9FC] hover:bg-[#EAF2FF] border-[#DCE5F0] text-[#718096] hover:text-[#2F6FED]'
              }`}
              title={isListening ? "Stop voice input" : "Speak question"}
            >
              {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your AI companion anything about your career path..."
              className="flex-1 input-pearl text-xs sm:text-sm"
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className="button-primary !py-2.5 !px-4"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Candidate Context Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-5 h-full flex flex-col">
          
          <SurfaceCard className="p-6 border border-[#DCE5F0] bg-white space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] border-b border-[#DCE5F0] pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#2F6FED]" /> Active Candidate Context
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl">
                <span className="text-[10px] font-bold text-[#718096] uppercase">Name</span>
                <p className="font-bold text-[#172033] mt-0.5">{candidate.profile?.fullName || 'Candidate'}</p>
              </div>

              <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl">
                <span className="text-[10px] font-bold text-[#718096] uppercase">Target Trajectory</span>
                <p className="font-bold text-[#2F6FED] mt-0.5">{candidate.profile?.targetRoles?.[0] || 'Software Professional'}</p>
              </div>

              <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl">
                <span className="text-[10px] font-bold text-[#718096] uppercase">Preferred Mode</span>
                <p className="font-bold text-[#172033] mt-0.5">{candidate.accessibility?.workPreference || 'Remote'}</p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6 border border-[#DCE5F0] bg-white space-y-3 flex-1">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] border-b border-[#DCE5F0] pb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#2F6FED]" /> Verified Competencies
            </h3>
            
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((s, idx) => (
                <span key={idx} className="bg-[#EAF2FF] border border-[#C8D5E5] text-[#2F6FED] px-2.5 py-1 rounded-lg text-xs font-semibold">
                  {s}
                </span>
              ))}
            </div>
          </SurfaceCard>

        </div>

      </div>

    </div>
  );
}
