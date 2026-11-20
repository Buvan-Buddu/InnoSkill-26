'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import InnoSkillLogo from '@/components/brand/InnoSkillLogo';

export default function LoginPage() {
  const { login } = useAuth();
  const { speakFeedback, activeLanguage } = useVoiceAgent();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Spoken Voice Greeting on Mount & Query Auto-fill & Voice Event Sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qEmail = params.get('email');
      if (qEmail) {
        setEmail(qEmail);
        setTimeout(() => {
          document.getElementById('password')?.focus();
        }, 500);
      }
    }

    const handleVoiceFillEmail = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.email) {
        setEmail(detail.email);
      }
    };

    const handleVoiceSubmitForm = () => {
      const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement | null;
      if (submitBtn) submitBtn.click();
    };

    window.addEventListener('voice-fill-login-email', handleVoiceFillEmail);
    window.addEventListener('voice-submit-login-form', handleVoiceSubmitForm);

    const greeting = activeLanguage === 'hi-IN'
      ? "नमस्कार, इननोस्किल एआई में आपका पुनः स्वागत है। लॉग इन करने के लिए अपना पंजीकृत ईमेल और पासवर्ड दर्ज करें।"
      : "Hello, welcome back to InnoSkill AI. Please enter your registered email and password to log in.";
    const timer = setTimeout(() => {
      speakFeedback(greeting);
    }, 600);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('voice-fill-login-email', handleVoiceFillEmail);
      window.removeEventListener('voice-submit-login-form', handleVoiceSubmitForm);
    };
  }, [activeLanguage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Invalid credentials.');
      speakFeedback(res.error || 'Invalid credentials.');
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#F7F9FC] text-[#172033] select-none bg-pearl-grid">
      
      {/* Ambient Pearl Glow */}
      <div className="pointer-events-none absolute -right-20 top-20 h-[32rem] w-[32rem] rounded-full pearl-glow" />

      {/* Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" className="flex items-center group hover:opacity-95 transition" aria-label="Go to Home">
          <InnoSkillLogo variant="header" size="md" />
        </Link>
        <Link href="/signup" className="button-secondary text-xs !py-2 !min-h-9">
          Create Account
        </Link>
      </header>

      {/* Login Main Area */}
      <main className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 py-8 sm:px-10 lg:grid-cols-[1.1fr_440px]">
        
        {/* Left Side: Brand Value Proposition */}
        <div className="hidden max-w-lg lg:block space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF2FF] border border-[#C8D5E5] text-xs font-bold text-[#2F6FED]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Inclusive Career Ecosystem</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-[#172033] xl:text-5xl">
            A clearer path to your next opportunity.
          </h1>
          
          <p className="text-base leading-7 text-[#4B5870]">
            Bring your resume, skills, workplace preferences, and career goals into one calm, intelligent workspace built to help you move forward.
          </p>
          
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { title: 'AI Plans', desc: 'Guided paths' },
              { title: 'Accessible', desc: 'WCAG 2.1 AA' },
              { title: 'Enterprise', desc: 'SAP connected' }
            ].map((feature, i) => (
              <div key={i} className="surface-card p-3.5 text-center">
                <span className="text-xs font-bold text-[#172033] block">{feature.title}</span>
                <span className="text-[11px] text-[#718096]">{feature.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="surface-card p-8 sm:p-9 shadow-[0_10px_35px_rgba(22,59,115,0.08)] space-y-6 border border-[#DCE5F0] bg-white">
          <div className="space-y-1.5 text-center">
            <span className="text-[11px] text-[#2F6FED] font-bold uppercase tracking-wider bg-[#EAF2FF] px-3.5 py-1 rounded-full border border-[#DCE5F0]">
              Welcome Back
            </span>
            <h2 className="pt-2 text-2xl font-bold tracking-tight text-[#172033]">
              Log in to InnoSkill
            </h2>
            <p className="text-xs font-medium text-[#718096]">
              Access your career profile, resume scans, and interviews.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-center text-xs font-bold text-[#D64545]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Address */}
            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-xs font-bold text-[#172033]">
                  Password <span className="text-[#2F6FED]">*</span>
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-[#2F6FED] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-pearl !pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="button-primary w-full mt-2 cursor-pointer"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="border-t border-[#DCE5F0] pt-4 text-center text-xs text-[#718096]">
            Don't have an account?{' '}
            <Link href="/signup" className="font-bold text-[#2F6FED] hover:underline">
              Create Candidate Account
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 py-5 text-center text-xs font-medium text-[#718096] sm:px-10 border-t border-[#DCE5F0]">
        InnoSkill AI • Secure End-to-End Authentication • Enterprise Inclusion Companion
      </footer>
    </div>
  );
}
