'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Mail, ArrowLeft, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import InnoSkillLogo from '@/components/brand/InnoSkillLogo';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [devToken, setDevToken] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    const res = await forgotPassword(email);
    setSubmitting(false);

    if (res.success) {
      setMessage(res.message || 'Password reset request processed.');
      if ((res as any).devResetToken) {
        setDevToken((res as any).devResetToken);
      }
    } else {
      setError(res.error || 'Failed to process password reset.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden select-none bg-pearl-grid">
      
      {/* Ambient Pearl Glow */}
      <div className="pointer-events-none absolute -right-20 top-20 h-[30rem] w-[30rem] rounded-full pearl-glow" />

      {/* Header */}
      <header className="max-w-md mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center group hover:opacity-95 transition" aria-label="Go to Home">
          <InnoSkillLogo variant="header" size="md" />
        </Link>
      </header>

      {/* Main Card */}
      <main className="max-w-md mx-auto w-full space-y-6 my-auto z-10 py-8">
        <div className="surface-card p-8 sm:p-9 shadow-[0_10px_35px_rgba(22,59,115,0.08)] space-y-6 border border-[#DCE5F0] bg-white">
          <div className="space-y-1.5 text-center">
            <span className="text-[11px] text-[#2F6FED] font-bold uppercase tracking-wider bg-[#EAF2FF] px-3.5 py-1 rounded-full border border-[#DCE5F0]">
              Account Recovery
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-[#172033] pt-1">
              Reset Your Password
            </h2>
            <p className="text-xs text-[#718096]">
              Enter your registered email address to receive password reset instructions.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-bold text-[#D64545]">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-[#B7F4D8] bg-[#EBFDF5] p-3 text-center text-xs font-bold text-[#16A36A] flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}

          {devToken && (
            <div className="rounded-xl border border-[#C8D5E5] bg-[#F4F8FF] p-3 text-xs space-y-1.5">
              <span className="font-bold text-[#2F6FED] block">Development Reset Link</span>
              <p className="text-[11px] text-[#4B5870]">Use this direct link to simulate reset link delivery:</p>
              <Link
                href={`/reset-password?token=${devToken}`}
                className="text-[11px] font-bold text-[#2F6FED] underline break-all block"
              >
                /reset-password?token={devToken}
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-bold text-[#172033]">
                Email address
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

            <button
              type="submit"
              disabled={submitting}
              className="button-primary w-full mt-2 cursor-pointer"
            >
              <span>{submitting ? 'Sending Request...' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="border-t border-[#DCE5F0] pt-4 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2F6FED] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md mx-auto w-full text-center text-xs text-[#718096] z-10 py-2 border-t border-[#DCE5F0]">
        InnoSkill AI • Account Security Services
      </footer>
    </div>
  );
}
