'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  FileText, 
  Compass, 
  Sparkles, 
  Mic, 
  ArrowRight, 
  CheckCircle2, 
  User,
  TrendingUp,
  Award,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  Clock
} from 'lucide-react';
import { seedJobs } from '@/database/seed-data';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { SapStatusCard } from '@/components/sap/SapStatusCard';
import ActionCard from '@/components/ui/ActionCard';
import ProgressBar from '@/components/ui/ProgressBar';
import SectionHeader from '@/components/ui/SectionHeader';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import SurfaceCard from '@/components/ui/SurfaceCard';

export default function CandidateDashboard() {
  const { candidate, speakFeedback, activeLanguage } = useVoiceAgent();
  const profile = candidate.profile;
  const skills = candidate.skills;

  const [filteredJobs, setFilteredJobs] = useState(seedJobs.slice(0, 3));
  const [greeting, setGreeting] = useState<string>('Welcome');
  const fullName = profile?.fullName || 'Candidate';
  const firstName = fullName.split(' ')[0] || 'Candidate';
  const targetRole = profile?.targetRoles?.[0] || 'Software Developer';
  const displaySkills = skills.length > 0 ? skills.slice(0, 4) : ['Python', 'Problem Solving', 'SQL'];

  // Spoken Page Introduction on Mount
  useEffect(() => {
    const introMsg = activeLanguage === 'hi-IN'
      ? `नमस्कार ${firstName}! आपके इननोस्किल एआई करियर कमांड सेंटर में आपका स्वागत है। यहां आप नौकरी खोज सकते हैं, रिज्यूमे का विश्लेषण कर सकते हैं, मॉक इंटरव्यू का अभ्यास कर सकते हैं और अपनी प्रोफाइल संभाल सकते हैं।`
      : `Welcome to your InnoSkill AI career command center, ${firstName}! Here you can explore job opportunities, analyze your resume, and practice mock interviews.`;

    const timer = setTimeout(() => {
      speakFeedback(introMsg);
    }, 800);
    return () => clearTimeout(timer);
  }, [activeLanguage, firstName]);

  useEffect(() => {
    const calculateGreeting = () => {
      const hours = new Date().getHours();
      if (hours >= 5 && hours < 12) {
        setGreeting('Good morning');
      } else if (hours >= 12 && hours < 17) {
        setGreeting('Good afternoon');
      } else if (hours >= 17 && hours < 21) {
        setGreeting('Good evening');
      } else {
        setGreeting('Good evening');
      }
    };
    
    calculateGreeting();
    const interval = setInterval(calculateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (skills.length > 0) {
      const matched = seedJobs.filter(j => 
        j.skills && j.skills.some(s => skills.some(cs => (s.skill?.name || '').toLowerCase().includes(cs.toLowerCase())))
      );
      setFilteredJobs(matched.length > 0 ? matched.slice(0, 3) : seedJobs.slice(0, 3));
    }
  }, [skills]);

  return (
    <div className="select-none space-y-8 pb-12">
      
      {/* Welcome & Overview Banner */}
      <section className="surface-card p-6 sm:p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border border-[#DCE5F0]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="info">Target: {targetRole}</StatusBadge>
            <StatusBadge tone="success">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Accessibility Audit Passed
            </StatusBadge>
          </div>
          <h1 className="page-title text-2xl sm:text-3xl lg:text-4xl text-[#172033]">
            {greeting}, {firstName}
          </h1>
          <p className="page-description max-w-2xl text-[#4B5870]">
            Your inclusive career intelligence workspace is active. Resume parsing, skill gap analysis, and tailored jobs are synced.
          </p>
        </div>

        {/* Profile Strength Widget */}
        <div className="w-full max-w-xs bg-[#F7F9FC] border border-[#EAF0F6] rounded-2xl p-4.5 space-y-3 shrink-0">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#4B5870]">Profile Strength</span>
            <span className="text-[#2F6FED] font-extrabold">85%</span>
          </div>
          <ProgressBar value={85} label="" showValue={false} />
          <Link 
            href="/dashboard/profile" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2F6FED] hover:text-[#245ED0] transition-colors"
          >
            <span>Review Profile & Accommodations</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Enterprise Integration Diagnostic Strip */}
      <SapStatusCard />

      {/* Quick Action Pathways */}
      <section className="space-y-4">
        <SectionHeader 
          title="What would you like to do?" 
          description="Direct access to your core AI career tools." 
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          <ActionCard 
            href="/dashboard/resume" 
            title="Resume Intelligence" 
            description="Scan, score, and optimize your resume." 
            icon={FileText} 
          />
          <ActionCard 
            href="/dashboard/jobs" 
            title="Jobs Board" 
            description="Explore ability-matched opportunities." 
            icon={Briefcase} 
          />
          <ActionCard 
            href="/dashboard/skills" 
            title="Skills Roadmap" 
            description="Personalized path for your next role." 
            icon={Compass} 
          />
          <ActionCard 
            href="/dashboard/interview" 
            title="Mock Interview" 
            description="Practice voice answers with AI scoring." 
            icon={Mic} 
          />
          <ActionCard 
            href="/dashboard/assistant" 
            title="AI Companion" 
            description="Ask for conversational career coaching." 
            icon={Sparkles} 
          />
        </div>
      </section>

      {/* High-Level Career Intelligence Metrics */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Profile Strength" value="85%" detail="High completeness" icon={User} />
        <StatCard label="Resume Score" value="82" detail="ATS optimized" icon={FileText} />
        <StatCard label="Verified Skills" value={skills.length || 4} detail="Skills in profile" icon={Award} />
        <StatCard label="Job Matches" value={filteredJobs.length} detail="Curated for you" icon={TrendingUp} />
      </section>

      {/* Career Snapshot & Progress Breakdown */}
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <SurfaceCard className="p-6 space-y-5 border border-[#DCE5F0]">
          <SectionHeader 
            title="Career Snapshot" 
            description="Your current direction and verified credentials." 
            action={
              <Link href="/dashboard/profile" className="text-xs font-bold text-[#2F6FED] hover:underline">
                Edit Details
              </Link>
            } 
          />
          <div className="grid gap-4 border-t border-[#DCE5F0] pt-4 sm:grid-cols-2 text-xs">
            <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl">
              <p className="font-bold text-[#718096] uppercase tracking-wider text-[10px]">Primary Goal</p>
              <p className="mt-1 font-bold text-sm text-[#172033]">{targetRole}</p>
            </div>
            <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl">
              <p className="font-bold text-[#718096] uppercase tracking-wider text-[10px]">Work Preference</p>
              <p className="mt-1 font-bold text-sm text-[#172033]">{profile?.workPreference || 'Remote'}</p>
            </div>
          </div>
          <div className="border-t border-[#DCE5F0] pt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">Active Capabilities</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {displaySkills.map((skill, index) => (
                <span key={index} className="rounded-xl bg-[#EAF2FF] border border-[#C8D5E5] px-3 py-1 text-xs font-semibold text-[#2F6FED]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6 space-y-5 border border-[#DCE5F0]">
          <SectionHeader 
            title="Preparation Milestones" 
            description="Track readiness across areas." 
          />
          <div className="space-y-4 pt-1">
            <ProgressBar value={82} label="Resume ATS Alignment" />
            <ProgressBar value={70} label="Target Skills Mastery" />
            <ProgressBar value={90} label="Accessibility Accommodation Profile" />
          </div>
        </SurfaceCard>
      </section>

      {/* Recommended Opportunities */}
      <section className="space-y-4">
        <SectionHeader 
          title="Recommended Opportunities" 
          description="Curated matches based on your skills, goals, and verified accessibility standards." 
          action={
            <Link href="/dashboard/jobs" className="button-secondary text-xs !py-1.5 !min-h-9">
              <span>View All Openings</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          } 
        />
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <Link 
              key={job.id} 
              href={`/dashboard/jobs/${job.id}`} 
              className="surface-card surface-card-interactive flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border border-[#DCE5F0] hover:border-[#2F6FED]/50 group"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-bold text-sm text-[#172033] group-hover:text-[#2F6FED] transition-colors truncate">
                    {job.title}
                  </h3>
                  <StatusBadge tone="success">84% Match</StatusBadge>
                  {job.accessibility?.readinessScore && (
                    <StatusBadge tone="info">Readiness: {job.accessibility.readinessScore}%</StatusBadge>
                  )}
                </div>
                <p className="text-xs text-[#718096]">
                  {job.company} <span className="mx-1 text-[#DCE5F0]">•</span> {job.location} <span className="mx-1 text-[#DCE5F0]">•</span> {job.workType || 'Remote'}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-[#2F6FED] group-hover:translate-x-1 transition-transform">
                <span>View Details</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
