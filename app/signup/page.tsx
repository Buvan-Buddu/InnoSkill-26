'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import InnoSkillLogo from '@/components/brand/InnoSkillLogo';

export default function SignUpPage() {
  const { signup } = useAuth();
  const { speakFeedback } = useVoiceAgent();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Spoken Voice Greeting on Mount & Query Auto-fill & Voice Event Sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qName = params.get('fullName');
      const qEmail = params.get('email');
      if (qName) setFullName(qName);
      if (qEmail) setEmail(qEmail);

      if (qName || qEmail) {
        setTimeout(() => {
          document.getElementById('password')?.focus();
        }, 500);
      }
    }

    const handleVoiceFillName = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.fullName) setFullName(detail.fullName);
    };

    const handleVoiceFillEmail = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.email) setEmail(detail.email);
    };

    const handleVoiceSubmitForm = () => {
      const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement | null;
      if (submitBtn) submitBtn.click();
    };

    window.addEventListener('voice-fill-signup-name', handleVoiceFillName);
    window.addEventListener('voice-fill-signup-email', handleVoiceFillEmail);
    window.addEventListener('voice-submit-signup-form', handleVoiceSubmitForm);

    const greeting = "Hello, welcome to InnoSkill AI. Create your account by entering your full name, email, and password.";
    const timer = setTimeout(() => {
      speakFeedback(greeting);
    }, 600);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('voice-fill-signup-name', handleVoiceFillName);
      window.removeEventListener('voice-fill-signup-email', handleVoiceFillEmail);
      window.removeEventListener('voice-submit-signup-form', handleVoiceSubmitForm);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    const res = await signup(fullName, email, password);
    setSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Failed to create account.');
      speakFeedback(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#F7F9FC] text-[#172033] select-none bg-pearl-grid">
      
      {/* Ambient Pearl Glow */}
      <div className="pointer-events-none absolute -left-20 top-20 h-[32rem] w-[32rem] rounded-full pearl-glow" />

      {/* Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" className="flex items-center group hover:opacity-95 transition" aria-label="Go to Home">
          <InnoSkillLogo variant="header" size="md" />
        </Link>
        <Link href="/login" className="button-secondary text-xs !py-2 !min-h-9">
          Already Have Account?
        </Link>
      </header>

      {/* Main Area */}
      <main className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 py-8 sm:px-10 lg:grid-cols-[1.1fr_460px]">
        
        {/* Left Side: Onboarding Value */}
        <div className="hidden max-w-lg lg:block space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF2FF] border border-[#C8D5E5] text-xs font-bold text-[#2F6FED]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Your Inclusive Journey</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-[#172033] xl:text-5xl">
            Empowering your career with intelligent tools.
          </h1>
          
          <p className="text-base leading-7 text-[#4B5870]">
            Sign up to unlock automated resume scoring, tailored job matching, accessibility accommodation tracking, and guided mock interview practice.
          </p>
          
          <div className="space-y-3 pt-2">
            {[
              'Multimodal voice and visual interaction support',
              'Enterprise SAP SuccessFactors candidate sync',
              'AI-powered interview practice with real-time feedback'
            ].map((bullet, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs font-semibold text-[#4B5870]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EAF2FF] text-[#2F6FED] font-bold text-[10px]">✓</span>
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Signup Card */}
        <div className="surface-card p-8 sm:p-9 shadow-[0_10px_35px_rgba(22,59,115,0.08)] space-y-5 border border-[#DCE5F0] bg-white">
          <div className="space-y-1.5 text-center">
            <span className="text-[11px] text-[#2F6FED] font-bold uppercase tracking-wider bg-[#EAF2FF] px-3.5 py-1 rounded-full border border-[#DCE5F0]">
              Candidate Registration
            </span>
            <h2 className="pt-2 text-2xl font-bold tracking-tight text-[#172033]">
              Create Your Account
            </h2>
            <p className="text-xs font-medium text-[#718096]">
              Set up your profile to personalize your career workspace.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-center text-xs font-bold text-[#D64545]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="fullName" className="block text-xs font-bold text-[#172033]">
                Full name <span className="text-[#2F6FED]">*</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
                <input
                  id="fullName"
                  type="text"
                  required
                  placeholder="Aarav Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-pearl !pl-10"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-bold text-[#172033]">
                Email address <span className="text-[#2F6FED]">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-pearl !pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-bold text-[#172033]">
                Password <span className="text-[#2F6FED]">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-pearl !pl-10"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#172033]">
                Confirm password <span className="text-[#2F6FED]">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-pearl !pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="button-primary w-full mt-2 cursor-pointer"
            >
              <span>{submitting ? 'Creating Account...' : 'Register Candidate Profile'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="border-t border-[#DCE5F0] pt-4 text-center text-xs text-[#718096]">
            Already registered?{' '}
            <Link href="/login" className="font-bold text-[#2F6FED] hover:underline">
              Log in to account
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 py-5 text-center text-xs font-medium text-[#718096] sm:px-10 border-t border-[#DCE5F0]">
        InnoSkill AI • Inclusive Candidate Experience • Privacy-First Data Protection
      </footer>
    </div>
  );
}
