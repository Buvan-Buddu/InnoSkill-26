'use client';

import React from 'react';
import { demoCandidate } from '@/database/seed-data';
import { 
  Award, 
  AlertCircle, 
  AlertTriangle,
  BookOpen, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles,
  Milestone
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import ProgressBar from '@/components/ui/ProgressBar';
import SurfaceCard from '@/components/ui/SurfaceCard';

export default function SkillsPage() {
  const profile = demoCandidate.profile;
  const skills = demoCandidate.skills;

  const targetRole = profile.targetRoles[0] || 'Accessible UI Specialist';
  const currentSkills = skills;
  const missingSkills = ['Node.js', 'PostgreSQL', 'CI/CD Automation (GitHub Actions)', 'GraphQL'];

  const learningPath = {
    timeline: '3 - 6 Months',
    courses: [
      { name: 'Full-Stack Modern Web Engineering', platform: 'Udemy / Coursera', duration: '40 hours', progress: 60 },
      { name: 'Relational Database Architecture with PostgreSQL', platform: 'Pluralsight', duration: '25 hours', progress: 30 },
      { name: 'CI/CD Pipelines & Inclusive Testing', platform: 'GitHub Learning', duration: '15 hours', progress: 0 }
    ],
    certifications: [
      { name: 'IAAP Web Accessibility Specialist (WAS)', status: 'In Preparation', level: 'Industry Standard' },
      { name: 'Cloud Architecture Practitioner', status: 'Recommended', level: 'Foundational' }
    ]
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      
      <PageHeader 
        eyebrow="Career Roadmap" 
        title="Skills Intelligence & Capabilities" 
        description={`Assess your verified capabilities against ${targetRole} and explore your tailored learning timeline.`} 
        icon={Award} 
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Capabilities & Gap Analysis (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <SurfaceCard className="p-6 sm:p-7 border border-[#DCE5F0] bg-white space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE5F0]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#EAF2FF] text-[#2F6FED]">
                  <Award className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-[#172033]">Target Competency Alignment</h3>
                  <p className="text-xs text-[#718096]">Benchmark against industry role requirements.</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#2F6FED] bg-[#EAF2FF] px-2.5 py-1 rounded-lg">
                72% Prepared
              </span>
            </div>

            {/* Side-by-side lists */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Current Verified Skills */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#16A36A] uppercase tracking-wider block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Verified Skills ({currentSkills.length})
                </span>
                <div className="space-y-2">
                  {currentSkills.map((skill, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-xl border border-[#B7F4D8] bg-[#EBFDF5] text-[#16A36A] text-xs font-bold flex items-center justify-between"
                    >
                      <span>{skill}</span>
                      <span className="text-[10px] uppercase font-semibold">Active</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Gaps */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#D98A00] uppercase tracking-wider block flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Focus Gaps ({missingSkills.length})
                </span>
                <div className="space-y-2">
                  {missingSkills.map((skill, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-xl border border-[#FDE5AA] bg-[#FFF9EB] text-[#D98A00] text-xs font-bold flex items-center justify-between"
                    >
                      <span>{skill}</span>
                      <span className="text-[10px] uppercase font-semibold">Priority</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </SurfaceCard>

          {/* Interactive Milestone Timeline */}
          <SurfaceCard className="p-6 border border-[#DCE5F0] bg-white space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] border-b border-[#DCE5F0] pb-2 flex items-center gap-2">
              <Milestone className="w-4 h-4 text-[#2F6FED]" /> Roadmap Milestones
            </h3>

            <div className="space-y-3 pt-1">
              {[
                { phase: 'Month 1 - 2', title: 'Backend & Data Persistence Foundations', desc: 'Complete Node.js runtime and PostgreSQL relational schemas.' },
                { phase: 'Month 3 - 4', title: 'Accessible Architecture & CI/CD', desc: 'Implement automated axe-core accessibility unit tests in GitHub Actions.' },
                { phase: 'Month 5 - 6', title: 'Portfolio Project & WAS Certification', desc: 'Deploy enterprise-accessible capstone and sit for IAAP WAS exam.' },
              ].map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#F7F9FC] border border-[#EAF0F6] space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2F6FED] text-[11px] uppercase">{m.phase}</span>
                    <span className="text-[10px] font-semibold text-[#718096]">Milestone {idx + 1}</span>
                  </div>
                  <h4 className="font-bold text-[#172033] text-sm">{m.title}</h4>
                  <p className="text-[#4B5870] leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>

        </div>

        {/* Guided Learning Plan (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <SurfaceCard className="p-6 border border-[#DCE5F0] bg-white space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#DCE5F0]">
              <span className="p-2 rounded-xl bg-[#EAF2FF] text-[#2F6FED]">
                <BookOpen className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-[#172033]">Recommended Courses</h3>
                <p className="text-[11px] text-[#718096]">Curated curriculum to close key skill gaps.</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {learningPath.courses.map((course, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#F7F9FC] border border-[#EAF0F6] space-y-2.5 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-[#172033]">{course.name}</h4>
                      <p className="text-[#718096] text-[11px]">{course.platform} • {course.duration}</p>
                    </div>
                  </div>
                  <ProgressBar value={course.progress} label="Module Progress" />
                </div>
              ))}
            </div>
          </SurfaceCard>

          {/* Certifications Card */}
          <SurfaceCard className="p-6 border border-[#DCE5F0] bg-white space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] border-b border-[#DCE5F0] pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2F6FED]" /> Target Certifications
            </h3>

            <div className="space-y-2.5 text-xs">
              {learningPath.certifications.map((cert, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#F7F9FC] border border-[#EAF0F6] flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-[#172033]">{cert.name}</h5>
                    <p className="text-[11px] text-[#718096]">{cert.level}</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#2F6FED] bg-[#EAF2FF] px-2 py-0.5 rounded-md border border-[#C8D5E5]">
                    {cert.status}
                  </span>
                </div>
              ))}
            </div>
          </SurfaceCard>

        </div>

      </div>

    </div>
  );
}
