'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { demoCandidate, seedJobs } from '@/database/seed-data';
import { matchingService } from '@/services/matching';
import { Job } from '@/types';
import { 
  Search, 
  SlidersHorizontal, 
  Briefcase, 
  Heart, 
  Check, 
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Building2,
  ArrowRight
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import SurfaceCard from '@/components/ui/SurfaceCard';

export default function JobsPage() {
  const router = useRouter();
  
  const [candidate, setCandidate] = useState<{ profile: any; accessibility: any; skills: string[] }>(demoCandidate);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom Filter State
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [workTypeFilter, setWorkTypeFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'SAP' | 'DIRECT'>('ALL');

  // SAP Integration State
  const [sapJobs, setSapJobs] = useState<any[]>([]);
  const [sapStatus, setSapStatus] = useState<{ isConfigured: boolean; isConnected: boolean; message: string; count: number }>({
    isConfigured: false,
    isConnected: false,
    message: 'Checking SAP Integration...',
    count: 0
  });

  // Saved / Applied State
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/sap/status')
      .then(res => res.json())
      .then(data => {
        setSapStatus({
          isConfigured: Boolean(data.isConfigured),
          isConnected: Boolean(data.isConnected),
          message: data.message || 'SAP Status Loaded',
          count: data.jobCount || 0
        });
      })
      .catch(() => {
        setSapStatus({
          isConfigured: false,
          isConnected: false,
          message: 'SAP integration unconfigured.',
          count: 0
        });
      });

    fetch('/api/sap/jobs')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.jobs)) {
          setSapJobs(data.jobs);
        }
      })
      .catch(() => {});

    if (typeof window !== 'undefined') {
      const storedProfile = localStorage.getItem('innoskill_candidate') || localStorage.getItem('openability_candidate');
      if (storedProfile) {
        try {
          setCandidate(JSON.parse(storedProfile));
        } catch (e) {
          console.error(e);
        }
      }
      
      const saved = localStorage.getItem('openability_saved_jobs');
      if (saved) {
        try {
          setSavedJobs(JSON.parse(saved));
        } catch (e) {}
      }

      const applied = localStorage.getItem('openability_applied_jobs');
      if (applied) {
        try {
          setAppliedJobs(JSON.parse(applied));
        } catch (e) {}
      }
    }
  }, []);

  const toggleSave = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    let nextSaved = [...savedJobs];
    if (nextSaved.includes(jobId)) {
      nextSaved = nextSaved.filter(id => id !== jobId);
    } else {
      nextSaved.push(jobId);
    }
    setSavedJobs(nextSaved);
    localStorage.setItem('openability_saved_jobs', JSON.stringify(nextSaved));
  };

  const handleApply = (e: React.MouseEvent, jobTitle: string, company: string, jobId: string) => {
    e.preventDefault();
    if (appliedJobs.includes(jobId)) return;
    const nextApplied = [...appliedJobs, jobId];
    setAppliedJobs(nextApplied);
    localStorage.setItem('openability_applied_jobs', JSON.stringify(nextApplied));
    alert(`Application submitted to ${jobTitle} at ${company}!`);
  };

  // Combine standard and SAP jobs
  const combinedJobs: Job[] = [
    ...seedJobs,
    ...sapJobs.map(sj => ({
      id: sj.id,
      title: sj.title,
      company: sj.company,
      description: sj.description,
      requirements: sj.description || '',
      location: sj.location,
      workType: (sj.workType as any) || 'REMOTE',
      createdAt: new Date(),
      updatedAt: new Date(),
      isSapSource: true,
      skills: (sj.skills as any) || [],
      accessibility: (sj.accessibility as any) || { readinessScore: 88, verificationStatus: 'VERIFIED' }
    } as unknown as Job))
  ];

  // Filter jobs
  const filteredJobs = combinedJobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesWorkType = workTypeFilter === 'ALL' || job.workType === workTypeFilter;
    const matchesSource = sourceFilter === 'ALL' || (sourceFilter === 'SAP' && (job as any).isSapSource) || (sourceFilter === 'DIRECT' && !(job as any).isSapSource);

    return matchesSearch && matchesWorkType && matchesSource;
  });

  return (
    <div className="space-y-6 pb-12 select-none">
      
      <PageHeader 
        eyebrow="Opportunity Discovery" 
        title="Inclusive Jobs Board" 
        description="Explore ability-matched opportunities evaluated against your skills, accommodations, and workplace readiness standards." 
        icon={Briefcase} 
      />

      {/* Filter and Search Bar */}
      <div className="surface-card p-4 sm:p-5 border border-[#DCE5F0] bg-white space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#718096]" />
            <input
              type="text"
              placeholder="Search by role title, keyword, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-pearl !pl-10 text-xs sm:text-sm"
            />
          </div>

          {/* Work Mode Filter */}
          <select
            value={workTypeFilter}
            onChange={(e) => setWorkTypeFilter(e.target.value)}
            className="input-pearl !w-auto text-xs"
          >
            <option value="ALL">All Work Modes</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="OFFICE">Office</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as any)}
            className="input-pearl !w-auto text-xs"
          >
            <option value="ALL">All Requisition Sources</option>
            <option value="DIRECT">Direct Platform</option>
            <option value="SAP">SAP SuccessFactors</option>
          </select>

        </div>
      </div>

      {/* Main Grid: Job Listings & Job Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Job Listings Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#718096] px-1">
            <span>Showing <strong className="text-[#172033]">{filteredJobs.length}</strong> available positions</span>
            {sapStatus.isConnected && (
              <span className="flex items-center gap-1.5 text-[#16A36A] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#16A36A]" /> SAP Live Sync Active
              </span>
            )}
          </div>

          <div className="space-y-3.5">
            {filteredJobs.map((job) => {
              const matchResult = matchingService.calculateMatch(
                candidate.profile,
                candidate.accessibility,
                candidate.skills,
                job
              );

              const isSaved = savedJobs.includes(job.id);
              const isApplied = appliedJobs.includes(job.id);

              return (
                <div 
                  key={job.id} 
                  className="surface-card surface-card-interactive p-6 border border-[#DCE5F0] bg-white space-y-4 transition-all hover:border-[#2F6FED]/50 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link 
                          href={`/dashboard/jobs/${job.id}`}
                          className="font-bold text-base text-[#172033] group-hover:text-[#2F6FED] transition-colors truncate"
                        >
                          {job.title}
                        </Link>
                        
                        {(job as any).isSapSource && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EAF2FF] text-[#2F6FED] border border-[#C8D5E5]">
                            SAP Requisition
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#718096]">
                        {job.company} • {job.location} • <span className="font-semibold text-[#172033]">{job.workType}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start shrink-0">
                      <div className="bg-[#EAF2FF] text-[#2F6FED] border border-[#C8D5E5] px-3 py-1.5 rounded-xl text-center">
                        <span className="text-sm font-black block leading-none">{matchResult.overallScore}%</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider block mt-0.5">Match</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#4B5870] line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skills & Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#EAF0F6]">
                    {job.skills?.slice(0, 4).map((s: any, idx: number) => {
                      const skillName = typeof s === 'string' ? s : s.skill?.name || '';
                      return (
                        <span key={idx} className="bg-[#F7F9FC] text-[#4B5870] border border-[#DCE5F0] px-2.5 py-1 rounded-lg text-[11px] font-medium">
                          {skillName}
                        </span>
                      );
                    })}

                    {job.accessibility?.readinessScore && (
                      <span className="ml-auto text-[11px] font-bold text-[#16A36A] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Workplace Readiness: {job.accessibility.readinessScore}%</span>
                      </span>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#DCE5F0]">
                    <button
                      onClick={(e) => toggleSave(e, job.id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                        isSaved 
                          ? 'bg-[#EAF2FF] border-[#2F6FED] text-[#2F6FED]' 
                          : 'bg-white border-[#DCE5F0] text-[#718096] hover:bg-[#F7F9FC]'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/dashboard/jobs/${job.id}`}
                        className="button-secondary text-xs !py-1.5 !min-h-9"
                      >
                        Match Breakdown
                      </Link>
                      <button
                        onClick={(e) => handleApply(e, job.title, job.company, job.id)}
                        disabled={isApplied}
                        className="button-primary text-xs !py-1.5 !min-h-9"
                      >
                        <span>{isApplied ? 'Applied' : 'Apply Now'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Job Intelligence Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="surface-card p-6 border border-[#DCE5F0] bg-white space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] border-b border-[#DCE5F0] pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2F6FED]" /> Ability Matching Engine
            </h3>
            <p className="text-xs text-[#4B5870] leading-relaxed">
              InnoSkill AI matches candidate skill proficiency, workplace accommodations, and career velocity directly with employer requisitions.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl flex items-center justify-between">
                <span className="text-[#718096]">Active Candidate:</span>
                <span className="font-bold text-[#172033]">{candidate.profile?.fullName || 'Candidate'}</span>
              </div>
              <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl flex items-center justify-between">
                <span className="text-[#718096]">Target Role:</span>
                <span className="font-bold text-[#2F6FED]">{candidate.profile?.targetRoles?.[0] || 'Software Professional'}</span>
              </div>
            </div>
          </div>

          <div className="surface-card p-6 border border-[#DCE5F0] bg-white space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] border-b border-[#DCE5F0] pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2F6FED]" /> SAP Live Connector
            </h3>
            <p className="text-xs text-[#4B5870] leading-relaxed">
              Connected to enterprise SAP SuccessFactors HCM OData v2 requisition feed.
            </p>
            <Link 
              href="/dashboard/integrations/sap"
              className="button-secondary w-full text-xs !py-2"
            >
              Enterprise Diagnostics
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
