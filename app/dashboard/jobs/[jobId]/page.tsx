'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { demoCandidate, seedJobs } from '@/database/seed-data';
import { matchingService } from '@/services/matching';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  Building2, 
  Sparkles, 
  Briefcase, 
  Heart,
  ShieldCheck,
  Check,
  ArrowRight
} from 'lucide-react';
import MatchScoreExplain from '@/features/matching/MatchScoreExplain';
import StatusBadge from '@/components/ui/StatusBadge';

export default function JobMatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [candidate, setCandidate] = useState<{ profile: any; accessibility: any; skills: string[] }>(demoCandidate);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  useEffect(() => {
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

  const job = seedJobs.find(j => j.id === jobId);

  if (!job) {
    return (
      <div className="surface-card p-12 text-center border border-[#DCE5F0] bg-white space-y-3">
        <h3 className="text-base font-bold text-[#172033]">Position Not Found</h3>
        <p className="text-xs text-[#718096]">The requested job posting may have been filled or expired.</p>
        <Link href="/dashboard/jobs" className="button-primary text-xs inline-flex mt-2">
          Return to Jobs Board
        </Link>
      </div>
    );
  }

  const matchResult = matchingService.calculateMatch(
    candidate.profile,
    candidate.accessibility,
    candidate.skills,
    job
  );

  const isSaved = savedJobs.includes(job.id);
  const isApplied = appliedJobs.includes(job.id);

  const toggleSave = () => {
    let nextSaved = [...savedJobs];
    if (isSaved) {
      nextSaved = nextSaved.filter(id => id !== job.id);
    } else {
      nextSaved.push(job.id);
    }
    setSavedJobs(nextSaved);
    localStorage.setItem('openability_saved_jobs', JSON.stringify(nextSaved));
  };

  const handleApply = () => {
    if (isApplied) return;
    const nextApplied = [...appliedJobs, job.id];
    setAppliedJobs(nextApplied);
    localStorage.setItem('openability_applied_jobs', JSON.stringify(nextApplied));
    alert(`Successfully applied to ${job.title} at ${job.company}!`);
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[#DCE5F0] pb-4">
        <Link 
          href="/dashboard/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#718096] hover:text-[#2F6FED] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jobs Board</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSave}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition ${
              isSaved 
                ? 'bg-[#EAF2FF] border-[#2F6FED] text-[#2F6FED]' 
                : 'bg-white border-[#DCE5F0] text-[#718096] hover:bg-[#F7F9FC]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved Position' : 'Save'}</span>
          </button>

          <button
            onClick={handleApply}
            disabled={isApplied}
            className="button-primary text-xs !py-2 !min-h-9"
          >
            <span>{isApplied ? 'Application Submitted' : 'Apply for Role'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Job Header & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Overview & Match Details (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Job Banner */}
          <div className="surface-card p-6 sm:p-7 border border-[#DCE5F0] bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F6FED] bg-[#EAF2FF] px-2.5 py-0.5 rounded-full border border-[#C8D5E5]">
                  Requisition Overview
                </span>
                <h1 className="text-2xl font-bold text-[#172033] mt-1.5">
                  {job.title}
                </h1>
                <p className="text-xs text-[#718096]">
                  {job.company} • {job.location} • <span className="font-semibold text-[#172033]">{job.workType}</span>
                </p>
              </div>

              <div className="bg-[#F7F9FC] border border-[#DCE5F0] p-4 rounded-2xl text-center shrink-0">
                <span className="text-3xl font-black text-[#2F6FED]">{matchResult.overallScore}%</span>
                <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mt-0.5">Match Score</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#EAF0F6]">
              <StatusBadge tone="success">
                Workplace Readiness: {job.accessibility?.readinessScore}%
              </StatusBadge>
              {job.salaryRange && (
                <span className="text-xs font-semibold text-[#4B5870] px-2.5 py-0.5 bg-[#F7F9FC] border border-[#DCE5F0] rounded-full">
                  Compensation: {job.salaryRange}
                </span>
              )}
            </div>
          </div>

          {/* Match Score Explain Component */}
          <MatchScoreExplain job={job} matchResult={matchResult} />

          {/* Job Description Card */}
          <div className="surface-card p-6 border border-[#DCE5F0] bg-white space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033]">
              Role Responsibilities & Description
            </h3>
            <p className="text-xs leading-relaxed text-[#4B5870] whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          <div className="surface-card p-6 border border-[#DCE5F0] bg-white space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033]">
              Qualifications & Competencies
            </h3>
            <p className="text-xs leading-relaxed text-[#4B5870] whitespace-pre-line">
              {job.requirements}
            </p>
          </div>

        </div>

        {/* Right Side: Accessibility Verification & Employer Info (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="surface-card p-6 border border-[#DCE5F0] bg-white space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] border-b border-[#DCE5F0] pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2F6FED]" /> Verified Accommodations
            </h3>

            <div className="space-y-2.5 text-xs">
              {[
                { label: 'Remote / Telework Option', val: job.accessibility?.remoteAvailable },
                { label: 'Flexible Work Schedules', val: job.accessibility?.flexibleHours },
                { label: 'Screen Reader Software Compatible', val: job.accessibility?.screenReaderCompatible },
                { label: 'Live Video Closed Captions', val: job.accessibility?.captionSupport },
                { label: 'Text-Based Asynchronous Comms', val: job.accessibility?.textCommunication },
                { label: 'Accessible Interview Environment', val: job.accessibility?.accessibleInterview },
                { label: 'Physical Facility Accessibility', val: job.accessibility?.physicalAccessibility },
              ].map((acc, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#F7F9FC] border border-[#EAF0F6]">
                  <span className="text-[#4B5870] font-medium">{acc.label}</span>
                  {acc.val ? (
                    <span className="text-[#16A36A] font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Supported
                    </span>
                  ) : (
                    <span className="text-[#718096] text-[11px]">Upon request</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-6 border border-[#DCE5F0] bg-white space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] border-b border-[#DCE5F0] pb-2">
              Ready to take the next step?
            </h3>
            <p className="text-xs text-[#4B5870] leading-relaxed">
              Applying attaches your verified accessibility parameters to speed up accommodation approvals.
            </p>
            <button
              onClick={handleApply}
              disabled={isApplied}
              className="button-primary w-full text-xs !py-3"
            >
              <span>{isApplied ? 'Application Recorded' : 'Submit Candidate Application'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
