'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Mic, 
  FileText, 
  Briefcase, 
  Sparkles, 
  MessageSquareText, 
  Compass
} from 'lucide-react';
import InnoSkillLogo from '@/components/brand/InnoSkillLogo';

export default function Home() {
  const router = useRouter();
  const { 
    entryState,
    status, 
    feedback, 
    startZeroTouchVoiceEntry, 
    startAgentListening,
    handleVoiceModeDecision,
    handleLanguageDecision,
    handleAuthMethodDecision,
  } = useVoiceAgent();
  const { isAuthenticated, logout } = useAuth();

  // Automatic Voice Onboarding Entry Greeting on Mount (Non-blocking)
  useEffect(() => {
    const timer = setTimeout(() => {
      startZeroTouchVoiceEntry();
    }, 300);

    const handleFocusPassword = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const query = new URLSearchParams({
        fullName: detail?.fullName || '',
        email: detail?.email || ''
      }).toString();
      router.push(`/signup?${query}`);
    };

    const handleFocusLoginPassword = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const query = new URLSearchParams({
        email: detail?.email || ''
      }).toString();
      router.push(`/login?${query}`);
    };

    window.addEventListener('voice-focus-password-field', handleFocusPassword);
    window.addEventListener('voice-focus-login-password-field', handleFocusLoginPassword);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('voice-focus-password-field', handleFocusPassword);
      window.removeEventListener('voice-focus-login-password-field', handleFocusLoginPassword);
    };
  }, [router, startZeroTouchVoiceEntry]);

  const handleStartVoice = () => {
    startZeroTouchVoiceEntry(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] font-sans flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden select-none bg-pearl-grid">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full pearl-glow pointer-events-none" />

      {/* Multimodal Entry Modal */}
      {(entryState === 'VOICE_MODE_QUESTION' || entryState === 'LANGUAGE_QUESTION' || entryState === 'AUTH_METHOD_QUESTION') && (
        <div 
          className="fixed inset-0 bg-[#163B73]/25 backdrop-blur-xs z-50 flex items-center justify-center p-6 animate-in fade-in duration-200"
          role="dialog"
          aria-labelledby="multimodal-modal-title"
          aria-live="polite"
        >
          <div className="bg-white border border-[#DCE5F0] p-8 sm:p-10 rounded-[20px] max-w-lg w-full space-y-6 text-center shadow-[0_12px_40px_rgba(22,59,115,0.12)]">
            
            <button 
              onClick={() => startAgentListening()} 
              className="w-16 h-16 bg-[#EAF2FF] border border-[#C8D5E5] hover:bg-[#DCE5F0] rounded-2xl flex items-center justify-center mx-auto text-[#2F6FED] cursor-pointer transition focus:ring-4 focus:ring-[#2F6FED]/20"
              title="Click to start or restart voice listening"
              aria-label="Click to start or restart voice listening"
            >
              <Mic className={`w-8 h-8 ${status === 'LISTENING' ? 'animate-bounce text-[#2F6FED]' : 'animate-pulse text-[#2F6FED]'}`} />
            </button>

            <div className="space-y-2">
              <h3 id="multimodal-modal-title" className="text-2xl font-bold text-[#172033] tracking-tight">
                {entryState === 'LANGUAGE_QUESTION' ? 'Select Your Language' : 'Welcome to InnoSkill AI'}
              </h3>
              
              {entryState === 'VOICE_MODE_QUESTION' && (
                <p className="text-sm text-[#4B5870] font-medium">
                  Would you like to proceed with InnoSkill AI voice guidance?
                </p>
              )}

              {entryState === 'LANGUAGE_QUESTION' && (
                <p className="text-sm text-[#4B5870] font-medium">
                  Which language would you like to use? English or Hindi?
                </p>
              )}

              {entryState === 'AUTH_METHOD_QUESTION' && (
                <p className="text-sm text-[#4B5870] font-medium">
                  Do you already have an InnoSkill AI candidate account?
                </p>
              )}
            </div>

            {/* Synchronized Options */}
            {entryState === 'VOICE_MODE_QUESTION' && (
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button
                  onClick={() => handleVoiceModeDecision('yes')}
                  aria-label="Proceed with InnoSkill AI"
                  className="button-primary w-full py-3.5 text-sm"
                >
                  YES
                </button>
                <button
                  onClick={() => handleVoiceModeDecision('no')}
                  aria-label="Decline voice assistant and use text mode"
                  className="button-secondary w-full py-3.5 text-sm"
                >
                  NO
                </button>
              </div>
            )}

            {entryState === 'LANGUAGE_QUESTION' && (
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button
                  onClick={() => handleLanguageDecision('en-IN')}
                  aria-label="Select English language"
                  className="button-primary w-full py-3.5 text-sm flex items-center justify-center gap-2"
                >
                  <span className="text-lg">🇬🇧</span> English
                </button>
                <button
                  onClick={() => handleLanguageDecision('hi-IN')}
                  aria-label="Select Hindi language"
                  className="button-secondary w-full py-3.5 text-sm flex items-center justify-center gap-2"
                >
                  <span className="text-lg">🇮🇳</span> हिंदी
                </button>
              </div>
            )}

            {entryState === 'AUTH_METHOD_QUESTION' && (
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button
                  onClick={() => handleAuthMethodDecision('LOGIN')}
                  className="button-primary w-full py-3.5 text-sm"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleAuthMethodDecision('SIGNUP')}
                  className="button-secondary w-full py-3.5 text-sm"
                >
                  Sign Up
                </button>
              </div>
            )}

            <div className="pt-2 text-xs text-[#718096] font-medium space-y-1">
              {status === 'LISTENING' ? (
                <p className="text-[#2F6FED] font-bold animate-pulse">
                  🎙 Listening... Speak your choice or click an option.
                </p>
              ) : (
                <p className="text-[#D98A00] font-semibold">
                  Click the microphone icon or speak your answer.
                </p>
              )}
              {feedback && <p className="text-[#172033] text-[11px] font-medium">{feedback}</p>}
            </div>

          </div>
        </div>
      )}

      {/* Top Bar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between z-10 py-2">
        <Link href="/" className="flex items-center group hover:opacity-95 transition cursor-pointer select-none" aria-label="InnoSkill AI Home">
          <InnoSkillLogo variant="header" size="md" />
        </Link>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="button-primary text-xs !py-2 !min-h-9"
              >
                Candidate Hub
              </Link>
              <button
                onClick={logout}
                className="button-ghost text-xs !py-2 !min-h-9"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="button-ghost text-xs !py-2 !min-h-9"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="button-primary text-xs !py-2 !min-h-9"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Centered Hero Section */}
      <main className="max-w-3xl mx-auto w-full text-center space-y-8 my-auto z-10 py-12 sm:py-16">
        
        {/* Eyebrow */}
        <div className="inline-block">
          <span className="text-[11px] text-[#2F6FED] font-bold uppercase tracking-[0.16em] bg-[#EAF2FF] px-4 py-1.5 rounded-full border border-[#C8D5E5]">
            Inclusive Multimodal Career Platform
          </span>
        </div>

        {/* Big Clean Editorial Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-[#172033]">
            Your ability. Your career.<br />
            <span className="text-[#2F6FED]">Your way.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#4B5870] font-medium max-w-xl mx-auto">
            &ldquo;How can I help you take your next career step today?&rdquo;
          </p>
        </div>

        {/* Core Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <button
            onClick={handleStartVoice}
            autoFocus
            aria-label="Start Voice Assistant (Press Spacebar or Tap)"
            className="button-primary w-full sm:w-auto px-7 py-3.5 text-sm !rounded-2xl shadow-md"
          >
            <Mic className="w-5 h-5 text-white animate-pulse" />
            <span>Start Voice Assistant (Space or Tap)</span>
          </button>

          <Link
            href="/onboarding"
            className="button-secondary w-full sm:w-auto px-7 py-3.5 text-sm !rounded-2xl"
          >
            <MessageSquareText className="w-4 h-4 text-[#2F6FED]" />
            <span>Use Guided Profile</span>
          </Link>
        </div>

        {/* 4 Core Direct Pathways */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-8">
          {[
            { label: 'Find Jobs', href: '/dashboard/jobs', icon: Briefcase },
            { label: 'Build Resume', href: '/dashboard/resume', icon: FileText },
            { label: 'Career Plan', href: '/dashboard/skills', icon: Compass },
            { label: 'Mock Interview', href: '/dashboard/interview', icon: Sparkles }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="surface-card surface-card-interactive p-4.5 flex flex-col items-center justify-center gap-2.5 hover:border-[#2F6FED]/50 group"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#2F6FED] transition-colors group-hover:bg-[#2F6FED] group-hover:text-white">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold text-[#172033] group-hover:text-[#2F6FED] transition-colors">{item.label}</span>
              </Link>
            );
          })}
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center text-xs text-[#718096] z-10 py-3 border-t border-[#DCE5F0]">
        InnoSkill AI • Inclusive Career Companion • Accessible by Design • WCAG 2.1 AA Compliant
      </footer>

    </div>
  );
}
