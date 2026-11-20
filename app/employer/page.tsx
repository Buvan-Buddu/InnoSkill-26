'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { seedJobs } from '@/database/seed-data';
import { matchingService } from '@/services/matching';
import { 
  Building2, 
  Plus, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Briefcase,
  SlidersHorizontal,
  PlusCircle,
  Check
} from 'lucide-react';
import InnoSkillLogo from '@/components/brand/InnoSkillLogo';
import SurfaceCard from '@/components/ui/SurfaceCard';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressBar from '@/components/ui/ProgressBar';

interface EmployerJob {
  id: string;
  title: string;
  company: string;
  description: string;
  workType: 'REMOTE' | 'HYBRID' | 'OFFICE';
  requirements: string;
  location: string;
  skills: string[];
  accessibility: {
    remoteAvailable: boolean;
    flexibleHours: boolean;
    screenReaderCompatible: boolean;
    captionSupport: boolean;
    textCommunication: boolean;
    accessibleInterview: boolean;
    physicalAccessibility: boolean;
    assistiveTechnologySupport: boolean;
    readinessScore: number;
  };
}

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  
  // Job Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [experienceRequired, setExperienceRequired] = useState(2);
  const [workType, setWorkType] = useState<'REMOTE' | 'HYBRID' | 'OFFICE'>('REMOTE');
  
  // Accessibility Toggles
  const [remoteAvailable, setRemoteAvailable] = useState(true);
  const [flexibleHours, setFlexibleHours] = useState(true);
  const [screenReaderCompatible, setScreenReaderCompatible] = useState(false);
  const [captionSupport, setCaptionSupport] = useState(false);
  const [textCommunication, setTextCommunication] = useState(true);
  const [accessibleInterview, setAccessibleInterview] = useState(true);
  const [physicalAccessibility, setPhysicalAccessibility] = useState(false);
  const [assistiveTechnologySupport, setAssistiveTechnologySupport] = useState(true);

  useEffect(() => {
    const formattedSeedJobs: EmployerJob[] = seedJobs.slice(0, 4).map(sj => ({
      id: sj.id,
      title: sj.title,
      company: sj.company,
      description: sj.description,
      workType: sj.workType as any,
      requirements: sj.requirements,
      location: sj.location,
      skills: sj.skills?.map(s => s.skill?.name || '') || [],
      accessibility: {
        remoteAvailable: sj.accessibility?.remoteAvailable || false,
        flexibleHours: sj.accessibility?.flexibleHours || false,
        screenReaderCompatible: sj.accessibility?.screenReaderCompatible || false,
        captionSupport: sj.accessibility?.captionSupport || false,
        textCommunication: sj.accessibility?.textCommunication || false,
        accessibleInterview: sj.accessibility?.accessibleInterview || false,
        physicalAccessibility: sj.accessibility?.physicalAccessibility || false,
        assistiveTechnologySupport: sj.accessibility?.assistiveTechnologySupport || false,
        readinessScore: sj.accessibility?.readinessScore || 70
      }
    }));
    
    setJobs(formattedSeedJobs);
    if (formattedSeedJobs.length > 0) {
      setSelectedJobId(formattedSeedJobs[0].id);
    }
  }, []);

  const calculateReadinessScore = () => {
    const checks = [
      remoteAvailable,
      flexibleHours,
      screenReaderCompatible,
      captionSupport,
      textCommunication,
      accessibleInterview,
      physicalAccessibility,
      assistiveTechnologySupport
    ];
    const trueCount = checks.filter(Boolean).length;
    return Math.round((trueCount / checks.length) * 100);
  };

  const currentReadinessScore = calculateReadinessScore();

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newJob: EmployerJob = {
      id: `job-${Date.now()}`,
      title,
      company: 'Enterprise Partner Corp',
      description,
      workType,
      requirements: `Experience: ${experienceRequired}+ years in relevant field.`,
      location: workType === 'REMOTE' ? 'Remote Worldwide' : 'Tech Hub Campus',
      skills: skillsRequired ? skillsRequired.split(',').map(s => s.trim()) : ['React', 'Accessibility'],
      accessibility: {
        remoteAvailable,
        flexibleHours,
        screenReaderCompatible,
        captionSupport,
        textCommunication,
        accessibleInterview,
        physicalAccessibility,
        assistiveTechnologySupport,
        readinessScore: currentReadinessScore
      }
    };

    const nextJobs = [newJob, ...jobs];
    setJobs(nextJobs);
    setSelectedJobId(newJob.id);

    setTitle('');
    setDescription('');
    setSkillsRequired('');
    setExperienceRequired(2);
    setScreenReaderCompatible(false);
    setCaptionSupport(false);
    setPhysicalAccessibility(false);
    alert(`Successfully posted job "${newJob.title}" with a ${currentReadinessScore}% Accessibility Readiness Score!`);
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const mockCandidates = [
    {
      name: 'Alex Rivera',
      role: 'Frontend UI Specialist',
      skills: ['React', 'TypeScript', 'Web Accessibility (WCAG)', 'HTML5', 'CSS3'],
      score: 94,
      accommodations: ['Text Communication Only', 'Flexible Working Hours']
    },
    {
      name: 'Taylor Sharma',
      role: 'Software Developer',
      skills: ['Python', 'SQL', 'FastAPI', 'Data Analytics', 'Docker'],
      score: 88,
      accommodations: ['Screen Reader Compatible', 'Keyboard-Only Navigation']
    },
    {
      name: 'Jordan Miller',
      role: 'Full Stack Engineer',
      skills: ['JavaScript', 'Node.js', 'PostgreSQL', 'Accessibility Testing'],
      score: 82,
      accommodations: ['Caption Support', 'Wheelchair Physical Space']
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] p-4 sm:p-6 lg:p-8 space-y-6 select-none bg-pearl-grid">
      
      {/* Top Navbar */}
      <header className="flex justify-between items-center bg-white p-4 sm:p-5 rounded-2xl border border-[#DCE5F0] shadow-sm">
        <Link href="/" className="flex items-center gap-3 group hover:opacity-95 transition cursor-pointer select-none" aria-label="Go to Home page">
          <InnoSkillLogo variant="header" size="md" />
          <div className="hidden sm:block border-l border-[#DCE5F0] pl-3">
            <p className="text-[10px] text-[#2F6FED] font-bold uppercase tracking-wider">Enterprise Employer Portal</p>
          </div>
        </Link>
        <Link 
          href="/dashboard"
          className="button-secondary text-xs !py-2 !min-h-9"
        >
          Candidate Command Center
        </Link>
      </header>

      {/* Overview Stat Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Requisitions" value={jobs.length} detail="Live on platform" icon={Briefcase} />
        <StatCard label="Matched Candidates" value="48" detail="Qualified talent pool" icon={Users} />
        <StatCard label="Avg Accessibility Score" value={`${selectedJob?.accessibility.readinessScore || 85}%`} detail="WCAG compliant" icon={ShieldCheck} />
        <StatCard label="Placement Velocity" value="14 Days" detail="35% faster hire" icon={TrendingUp} />
      </section>

      {/* Main Grid: Job Vacancies / Candidates & Job Creation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Requisitions & Ranked Candidates (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Vacancy Selector Card */}
          <SurfaceCard className="p-6 border border-[#DCE5F0] bg-white space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] border-b border-[#DCE5F0] pb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2F6FED]" /> Active Position Requisitions
            </h3>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {jobs.map(j => (
                <button
                  key={j.id}
                  onClick={() => setSelectedJobId(j.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer border ${
                    selectedJobId === j.id
                      ? 'bg-[#EAF2FF] border-[#2F6FED] text-[#2F6FED]'
                      : 'bg-[#F7F9FC] border-[#DCE5F0] text-[#4B5870] hover:bg-[#F1F5FA]'
                  }`}
                >
                  {j.title}
                </button>
              ))}
            </div>

            {selectedJob && (
              <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#EAF0F6] space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-[#172033]">{selectedJob.title}</h4>
                    <span className="text-[#718096]">{selectedJob.location} • {selectedJob.workType}</span>
                  </div>
                  <StatusBadge tone="success">
                    Readiness: {selectedJob.accessibility.readinessScore}%
                  </StatusBadge>
                </div>
                <p className="text-[#4B5870] leading-relaxed line-clamp-2">{selectedJob.description}</p>
              </div>
            )}
          </SurfaceCard>

          {/* Ranked Candidates Card */}
          <SurfaceCard className="p-6 border border-[#DCE5F0] bg-white space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] border-b border-[#DCE5F0] pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2F6FED]" /> Pre-Screened Ability Matches for this Role
            </h3>

            <div className="space-y-3">
              {mockCandidates.map((cand, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[#DCE5F0] bg-white hover:border-[#2F6FED]/40 transition space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#172033]">{cand.name}</h4>
                      <p className="text-xs text-[#718096]">{cand.role}</p>
                    </div>
                    <div className="bg-[#EAF2FF] text-[#2F6FED] border border-[#C8D5E5] px-3 py-1 rounded-xl text-center">
                      <span className="text-sm font-black block leading-none">{cand.score}%</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider">Match</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cand.skills.map((s, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-[#F7F9FC] border border-[#DCE5F0] px-2 py-0.5 rounded-md text-[#4B5870]">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-[#16A36A] font-semibold flex items-center gap-1.5 pt-1 border-t border-[#EAF0F6]">
                    <Check className="w-3.5 h-3.5" />
                    <span>Requested: {cand.accommodations.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>

        </div>

        {/* Right Column: Create Accessible Role Requisition (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          <SurfaceCard className="p-6 border border-[#DCE5F0] bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE5F0] pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#2F6FED]" /> Post Inclusive Requisition
              </h3>
              <span className="text-[11px] font-bold text-[#2F6FED] bg-[#EAF2FF] px-2.5 py-0.5 rounded-full border border-[#DCE5F0]">
                Readiness: {currentReadinessScore}%
              </span>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#172033]">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Accessibility Test Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-pearl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#172033]">Work Mode</label>
                  <select
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value as any)}
                    className="input-pearl"
                  >
                    <option value="REMOTE">Fully Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="OFFICE">Onsite</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#172033]">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    value={experienceRequired}
                    onChange={(e) => setExperienceRequired(parseInt(e.target.value) || 0)}
                    className="input-pearl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#172033]">Required Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, TypeScript, WCAG, JAWS"
                  value={skillsRequired}
                  onChange={(e) => setSkillsRequired(e.target.value)}
                  className="input-pearl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#172033]">Job Description</label>
                <textarea
                  required
                  placeholder="Describe core mission, deliverables, and team dynamics..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="input-pearl !h-auto"
                />
              </div>

              {/* Inclusion Toggles */}
              <div className="space-y-2 pt-2 border-t border-[#DCE5F0]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block">
                  Employer Verified Accommodations
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {[
                    { state: remoteAvailable, set: setRemoteAvailable, label: 'Remote work available' },
                    { state: flexibleHours, set: setFlexibleHours, label: 'Flexible working hours' },
                    { state: screenReaderCompatible, set: setScreenReaderCompatible, label: 'Screen reader software compatible' },
                    { state: captionSupport, set: setCaptionSupport, label: 'Live video captions supported' },
                    { state: textCommunication, set: setTextCommunication, label: 'Text-only asynchronous options' },
                    { state: accessibleInterview, set: setAccessibleInterview, label: 'Accessible mock/real interview' },
                    { state: physicalAccessibility, set: setPhysicalAccessibility, label: 'Wheelchair physical building access' },
                    { state: assistiveTechnologySupport, set: setAssistiveTechnologySupport, label: 'Assistive hardware provided' },
                  ].map((t, idx) => (
                    <label key={idx} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F7F9FC] cursor-pointer text-xs font-semibold text-[#4B5870]">
                      <input
                        type="checkbox"
                        checked={t.state}
                        onChange={(e) => t.set(e.target.checked)}
                        className="h-4 w-4 rounded-md border-[#DCE5F0] text-[#2F6FED] focus:ring-[#2F6FED]"
                      />
                      <span>{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="button-primary w-full !py-3 text-xs mt-2"
              >
                <span>Publish Inclusive Requisition</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </SurfaceCard>

        </div>

      </div>

    </div>
  );
}
