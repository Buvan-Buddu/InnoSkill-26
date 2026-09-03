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
  Sliders,
  Check,
  Building2,
  TrendingUp,
  Award
} from 'lucide-react';
import { seedJobs } from '@/database/seed-data';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { SapStatusCard } from '@/components/sap/SapStatusCard';

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
      ? `नमस्कार ${firstName}! आपके ओपनएबिलिटी करियर कमांड सेंटर में आपका स्वागत है। यहां आप नौकरी खोज सकते हैं, रिज्यूमे का विश्लेषण कर सकते हैं, मॉक इंटरव्यू का अभ्यास कर सकते हैं और अपनी प्रोफाइल संभाल सकते हैं। आप बोलकर भी इस ऐप को कंट्रोल कर सकते हैं।`
      : `Welcome to your OpenAbility career command center, ${firstName}! Here you can explore job opportunities, analyze your resume, practice mock interviews, and manage your profile. You can control this application using your voice at any time.`;

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
        setGreeting('Good night');
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
    <div className="space-y-8 select-none max-w-6xl mx-auto pb-12">
      
      {/* TOP WELCOME & CONTEXT BANNER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
              Target Role: {targetRole}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Non-Discriminatory Audit Passed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-xl font-medium">
            Let's move your career forward. Your profile matches are filtered according to your accessibility preferences.
          </p>
        </div>

        {/* Profile Completion Indicator */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4.5 rounded-2xl shrink-0 w-full md:w-64 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">Profile Completion</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">85%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[85%]" />
          </div>
          <Link
            href="/dashboard/profile"
            className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 transition pt-0.5"
          >
            Complete profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* SAP ENTERPRISE INTEGRATION STATUS CARD */}
      <SapStatusCard />

      {/* QUICK ACTIONS SECTION */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Action 1: Resume */}
          <Link
            href="/dashboard/resume"
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 rounded-2xl space-y-3 transition hover:shadow-md group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <FileText className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-emerald-400 transition">Resume Intelligence</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">Improve & scan my resume</p>
            </div>
          </Link>

          {/* Action 2: Jobs */}
          <Link
            href="/dashboard/jobs"
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 rounded-2xl space-y-3 transition hover:shadow-md group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-emerald-400 transition">Jobs Board</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">Ability-first job matching</p>
            </div>
          </Link>

          {/* Action 3: Career Roadmap */}
          <Link
            href="/dashboard/skills"
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 rounded-2xl space-y-3 transition hover:shadow-md group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Compass className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-emerald-400 transition">Career & Skills</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">View skill roadmap</p>
            </div>
          </Link>

          {/* Action 4: Mock Interview */}
          <Link
            href="/dashboard/interview"
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 rounded-2xl space-y-3 transition hover:shadow-md group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Mic className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-emerald-400 transition">Mock Interview</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">Voice practice session</p>
            </div>
          </Link>

        </div>
      </div>

      {/* 2-COLUMN SECTION: CAREER SNAPSHOT & PROGRESS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CAREER SNAPSHOT CARD */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Your Career Snapshot</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Personalized profile match analysis</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-black text-xs rounded-full border border-emerald-200 dark:border-emerald-500/30">
              78% Profile Match
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="space-y-1">
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Target Role:</span>
              <p className="font-black text-slate-900 dark:text-white text-sm">{targetRole}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Workplace Preference:</span>
              <p className="font-black text-slate-900 dark:text-white text-sm">{profile?.workPreference || 'Remote'}</p>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Top Verified Skills:</span>
            <div className="flex flex-wrap gap-2">
              {displaySkills.map((sk, idx) => (
                <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-extrabold rounded-lg border border-slate-200 dark:border-slate-700">
                  {sk}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <Link
              href="/dashboard/profile"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" /> View Career Profile
            </Link>
          </div>
        </div>

        {/* PROGRESS & ACCESSIBILITY STATUS COLUMN */}
        <div className="space-y-6">
          
          {/* ACCESSIBILITY PREFERENCES STATUS CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Accessibility Preferences</h3>
              <Sliders className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Remote work guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Screen-reader compatible</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Flexible working hours</span>
              </div>
            </div>

            <Link
              href="/dashboard/profile"
              className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline block pt-1"
            >
              Manage preferences →
            </Link>
          </div>

          {/* YOUR PROGRESS SECTION */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Your Progress</h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-800 dark:text-slate-200 font-bold">
                  <span>Resume</span>
                  <span className="text-emerald-400">80%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[80%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-800 dark:text-slate-200 font-bold">
                  <span>Skills Roadmap</span>
                  <span className="text-emerald-400">70%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[70%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-800 dark:text-slate-200 font-bold">
                  <span>Career Profile</span>
                  <span className="text-emerald-400">90%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[90%]" />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* RECOMMENDED FOR YOU JOB FEED */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Recommended for you</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Based on your skills, goals, and accessibility preferences.</p>
          </div>
          <Link
            href="/dashboard/jobs"
            className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 transition"
          >
            Explore all jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <Link
              key={job.id}
              href={`/dashboard/jobs/${job.id}`}
              className="p-5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 rounded-2xl space-y-4 transition hover:shadow-sm group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/30">
                    {job.workType || 'Remote · Full-time'}
                  </span>
                  <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                    82% Match
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-emerald-400 transition">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">{job.company}</p>
                </div>
                <div className="space-y-1.5 pt-1 text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Remote work
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Screen-reader friendly
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-black text-emerald-600 dark:text-emerald-400 group-hover:underline">
                <span>View job</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
