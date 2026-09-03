'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { demoCandidate, seedJobs } from '@/database/seed-data';
import { matchingService } from '@/services/matching';
import { 
  Search, 
  SlidersHorizontal, 
  Briefcase, 
  Accessibility, 
  Heart, 
  Check, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

export default function JobsPage() {
  const router = useRouter();
  
  // Load candidate profile dynamically from localStorage
  const [candidate, setCandidate] = useState<{ profile: any; accessibility: any; skills: string[] }>(demoCandidate);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom Filter State
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [skillFilter, setSkillFilter] = useState('ALL');
  const [workTypeFilter, setWorkTypeFilter] = useState('ALL');
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [minReadinessScore, setMinReadinessScore] = useState(0);

  // Saved / Applied State
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Profile
      const storedProfile = localStorage.getItem('openability_candidate');
      if (storedProfile) {
        try {
          setCandidate(JSON.parse(storedProfile));
        } catch (e) {
          console.error(e);
        }
      }
      
      // Saved state
      const saved = localStorage.getItem('openability_saved_jobs');
      if (saved) {
        try {
          setSavedJobs(JSON.parse(saved));
        } catch (e) {}
      }

      // Applied state
      const applied = localStorage.getItem('openability_applied_jobs');
      if (applied) {
        try {
          setAppliedJobs(JSON.parse(applied));
        } catch (e) {}
      }
    }
  }, []);

  useEffect(() => {
    const handleVoiceSearch = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.role) {
        setSearchTerm(detail.role);
      }
      if (detail.remoteOnly || detail.remote) {
        setWorkTypeFilter('REMOTE');
      }
    };

    const handleVoiceAction = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const cmd = detail.command;
      const idx = detail.index ?? 0;

      const calculated = seedJobs.map(job => {
        const match = matchingService.calculateMatch(
          candidate.profile,
          candidate.accessibility,
          candidate.skills,
          job
        );
        return { job, match };
      });
      
      const filtered = calculated.filter(({ job, match }) => {
        const titleMatch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase());
        const workTypeMatch = workTypeFilter === 'ALL' || job.workType === workTypeFilter;
        return titleMatch && workTypeMatch;
      });

      if (filtered.length > idx) {
        const targetJob = filtered[idx].job;
        if (cmd === 'open') {
          router.push(`/dashboard/jobs/${targetJob.id}`);
        } else if (cmd === 'save') {
          toggleSave(targetJob.id);
        } else if (cmd === 'apply') {
          handleApply(targetJob.id, targetJob.company);
        }
      }
    };

    window.addEventListener('voice-job-search', handleVoiceSearch);
    window.addEventListener('voice-job-action', handleVoiceAction);

    return () => {
      window.removeEventListener('voice-job-search', handleVoiceSearch);
      window.removeEventListener('voice-job-action', handleVoiceAction);
    };
  }, [candidate, searchTerm, workTypeFilter, savedJobs, appliedJobs]);

  const toggleSave = (jobId: string) => {
    let nextSaved = [...savedJobs];
    if (nextSaved.includes(jobId)) {
      nextSaved = nextSaved.filter(id => id !== jobId);
    } else {
      nextSaved.push(jobId);
    }
    setSavedJobs(nextSaved);
    localStorage.setItem('openability_saved_jobs', JSON.stringify(nextSaved));
  };

  const handleApply = (jobId: string, companyName: string) => {
    if (appliedJobs.includes(jobId)) return;
    const nextApplied = [...appliedJobs, jobId];
    setAppliedJobs(nextApplied);
    localStorage.setItem('openability_applied_jobs', JSON.stringify(nextApplied));
    alert(`Successfully applied to job at ${companyName}!`);
  };

  // Perform dynamic matching score vectors calculations for all jobs
  const jobsWithCalculatedMatches = seedJobs.map(job => {
    const match = matchingService.calculateMatch(
      candidate.profile,
      candidate.accessibility,
      candidate.skills,
      job
    );
    return { job, match };
  });

  // Filter listings
  const filteredMatches = jobsWithCalculatedMatches.filter(({ job, match }) => {
    const titleMatch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       job.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const roleMatch = roleFilter === 'ALL' || job.title.toLowerCase().includes(roleFilter.toLowerCase());
    
    const skillMatch = skillFilter === 'ALL' || 
                       job.skills?.some(js => js.skill?.name.toLowerCase() === skillFilter.toLowerCase());
    
    const workTypeMatch = workTypeFilter === 'ALL' || job.workType === workTypeFilter;
    
    const matchScoreOk = match.overallScore >= minMatchScore;
    const readinessScoreOk = (job.accessibility?.readinessScore || 0) >= minReadinessScore;

    return titleMatch && roleMatch && skillMatch && workTypeMatch && matchScoreOk && readinessScoreOk;
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Ability-First Matching</h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
          OpenAbility AI matches your professional capabilities and accessibility needs against employer configurations.
        </p>
      </div>

      {/* Filter Toolbar Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search positions or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none text-slate-900 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
          
          {/* Work Setting dropdown */}
          <select
            value={workTypeFilter}
            onChange={(e) => setWorkTypeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="ALL">All Work Types</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="OFFICE">Office</option>
          </select>
        </div>

        {/* Detailed Criteria Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          
          {/* Filter by target role */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Role Category</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Roles</option>
              <option value="Engineer">Engineer / Developer</option>
              <option value="Architect">Architect</option>
              <option value="Consultant">Consultant</option>
              <option value="Designer">Designer</option>
            </select>
          </div>

          {/* Filter by target skill */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Required Skill</label>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Skills</option>
              <option value="React">React</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Python">Python</option>
              <option value="Web Accessibility">Web Accessibility</option>
            </select>
          </div>

          {/* Min Match Score */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Min Match: {minMatchScore}%</label>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-100 dark:bg-slate-950 rounded-lg h-2"
            />
          </div>

          {/* Min Readiness Score */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Min Readiness: {minReadinessScore}%</label>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={minReadinessScore}
              onChange={(e) => setMinReadinessScore(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-100 dark:bg-slate-950 rounded-lg h-2"
            />
          </div>

        </div>
      </div>

      {/* Grid List of Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMatches.length > 0 ? (
          filteredMatches.map(({ job, match }) => {
            const hasSaved = savedJobs.includes(job.id);
            const hasApplied = appliedJobs.includes(job.id);

            return (
              <div 
                key={job.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                {/* Header detail */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 min-w-0">
                      <h3 className="font-black text-base text-slate-900 dark:text-white truncate">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-bold truncate">
                        {job.company} • {job.location}
                      </p>
                    </div>

                    <div className="bg-slate-950 text-white border border-emerald-500/30 px-3.5 py-2 rounded-xl text-center shrink-0">
                      <span className="text-lg font-black text-emerald-400">{match.overallScore}%</span>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mt-0.5">Match</span>
                    </div>
                  </div>

                  {/* Vectors progress score grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Skills:</span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100">{match.skillScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Work Pref:</span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100">{match.workPreferenceScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Experience:</span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100">{match.experienceScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Accessibility:</span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100">{match.accessibilityScore}%</span>
                    </div>
                  </div>

                  {/* Readiness tag indicator */}
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Accessibility className="w-4 h-4 text-emerald-400" /> Accessibility Readiness
                    </span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {job.accessibility?.readinessScore}%
                    </span>
                  </div>
                </div>

                {/* Actions footer */}
                <div className="bg-slate-50 dark:bg-slate-950/60 p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleSave(job.id)}
                      className={`p-2.5 rounded-xl border transition focus:outline-none ${
                        hasSaved 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title={hasSaved ? "Unsave Job" : "Save Job"}
                    >
                      <Heart className={`w-4 h-4 ${hasSaved ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={() => handleApply(job.id, job.company)}
                      disabled={hasApplied}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white disabled:opacity-50 rounded-xl text-xs font-bold transition focus:outline-none border border-slate-700"
                    >
                      {hasApplied ? 'Applied' : 'Apply'}
                    </button>
                  </div>

                  <Link
                    href={`/dashboard/jobs/${job.id}`}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1 focus:outline-none shadow-md shadow-emerald-500/20"
                  >
                    <span>View Match</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="md:col-span-2 p-12 text-center text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl">
            No job matches conform to filters. Adjust slide values or keyword filters.
          </div>
        )}
      </div>

    </div>
  );
}
