'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import AccessibilityControls from '@/components/layout/AccessibilityControls';
import PersistentAssistant from '@/features/assistant/PersistentAssistant';
import InnoSkillLogo from '@/components/brand/InnoSkillLogo';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { useAuth } from '@/context/AuthContext';
import { Bell, Menu, LogOut, ShieldCheck } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { candidate } = useVoiceAgent();
  const { logout } = useAuth();

  const fullName = candidate.profile?.fullName || 'Candidate';
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'C';

  return (
    <div className="workspace-shell flex h-screen w-screen overflow-hidden bg-[#F7F9FC] text-[#172033]">
      
      {/* Sidebar Navigation */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } shrink-0 transition-transform duration-200 ease-in-out lg:relative lg:flex lg:translate-x-0`}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Mobile Backdrop Mask */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#163B73]/20 backdrop-blur-xs lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Panel Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header — Pearl Blue + White */}
        <header className="relative z-30 flex h-[68px] shrink-0 items-center justify-between border-b border-[#DCE5F0] bg-white px-4 shadow-[0_1px_3px_rgba(22,59,115,0.03)] sm:px-6 md:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="-ml-2 rounded-xl p-2 text-[#718096] transition hover:bg-[#F1F5FA] hover:text-[#172033] lg:hidden"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <Link href="/" className="flex items-center lg:hidden" aria-label="Go to Home page">
              <InnoSkillLogo variant="compact" size="sm" showSubtitle={false} />
            </Link>
            <div className="hidden min-w-0 items-center gap-3 lg:flex">
              <div>
                <h2 className="truncate text-sm font-bold text-[#172033]">Candidate Workspace</h2>
                <p className="flex items-center gap-1.5 text-xs font-medium text-[#718096]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#2F6FED]" /> Inclusive Career Intelligence
                </p>
              </div>
            </div>
          </div>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <AccessibilityControls />

            <button
              className="relative rounded-xl p-2 text-[#718096] transition hover:bg-[#F1F5FA] hover:text-[#2F6FED]"
              aria-label="Notification center"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#2F6FED]" />
            </button>

            <div className="hidden h-5 w-px bg-[#DCE5F0] sm:block" />

            {/* Candidate Avatar Badge */}
            <Link 
              href="/dashboard/profile"
              className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-[#F1F5FA] border border-transparent hover:border-[#DCE5F0]"
              title="View & Edit Profile"
            >
              <span className="hidden text-xs font-bold text-[#172033] transition-colors group-hover:text-[#2F6FED] md:inline">
                {fullName}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EAF2FF] text-xs font-bold uppercase text-[#2F6FED] border border-[#C8D5E5]">
                {initials}
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="rounded-xl p-2 text-[#718096] transition hover:bg-[#FFF5F5] hover:text-[#D64545]"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Main Workspace View */}
        <main className="relative flex-1 overflow-y-auto bg-[#F7F9FC] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-7 animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>

      {/* Floating InnoSkill AI Assistant Button */}
      <PersistentAssistant />
    </div>
  );
}
