'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import InnoSkillLogo from '@/components/brand/InnoSkillLogo';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const queryToken = searchParams?.get('token');
    if (queryToken) {
      setToken(queryToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing password reset token.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const res = await resetPassword(token, newPassword);
    setSubmitting(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      setError(res.error || 'Failed to reset password.');
    }
  };

  return (
    <div className="surface-card p-8 sm:p-9 shadow-[0_10px_35px_rgba(22,59,115,0.08)] space-y-6 border border-[#DCE5F0] bg-white">
      <div className="space-y-1.5 text-center">
        <span className="text-[11px] text-[#2F6FED] font-bold uppercase tracking-wider bg-[#EAF2FF] px-3.5 py-1 rounded-full border border-[#DCE5F0]">
          Set New Password
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-[#172033] pt-1">
          Create New Password
        </h2>
        <p className="text-xs text-[#718096]">
          Enter your new password to regain access to your account.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-bold text-[#D64545]">
          {error}
        </div>
      )}

      {success ? (
        <div className="rounded-xl border border-[#B7F4D8] bg-[#EBFDF5] p-5 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-[#16A36A] mx-auto animate-bounce" />
          <h4 className="font-bold text-sm text-[#172033]">Password reset successful!</h4>
          <p className="text-xs text-[#4B5870]">Redirecting you to the sign in page...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="token" className="block text-xs font-bold text-[#172033]">
              Reset Token
            </label>
            <input
              id="token"
              type="text"
              required
              placeholder="Paste token or enter from link"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="input-pearl"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="newPassword" className="block text-xs font-bold text-[#172033]">
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
              <input
                id="newPassword"
                type="password"
                required
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-pearl !pl-10"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#172033]">
              Confirm new password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
              <input
                id="confirmPassword"
                type="password"
                required
                placeholder="Re-enter new password"
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
            <span>{submitting ? 'Updating Password...' : 'Save New Password'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      <div className="border-t border-[#DCE5F0] pt-4 text-center">
        <Link href="/login" className="text-xs font-bold text-[#2F6FED] hover:underline">
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden select-none bg-pearl-grid">
      {/* Ambient Pearl Glow */}
      <div className="pointer-events-none absolute -left-20 top-20 h-[30rem] w-[30rem] rounded-full pearl-glow" />

      {/* Header */}
      <header className="max-w-md mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center group hover:opacity-95 transition" aria-label="Go to Home">
          <InnoSkillLogo variant="header" size="md" />
        </Link>
      </header>

      {/* Main Card */}
      <main className="max-w-md mx-auto w-full space-y-6 my-auto z-10 py-8">
        <Suspense fallback={<div className="surface-card p-8 text-center text-xs font-bold text-[#718096]">Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="max-w-md mx-auto w-full text-center text-xs text-[#718096] z-10 py-2 border-t border-[#DCE5F0]">
        InnoSkill AI • Password Security Services
      </footer>
    </div>
  );
}
