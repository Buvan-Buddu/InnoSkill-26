'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { demoCandidate } from '@/database/seed-data';
import { PostHiringAccommodation } from '@/types';
import { 
  Building2, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Download,
  ShieldCheck,
  Plus
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SurfaceCard from '@/components/ui/SurfaceCard';
import StatusBadge from '@/components/ui/StatusBadge';

export default function WorkplaceCompanionPage() {
  const [candidate, setCandidate] = useState(demoCandidate);
  const [accommodations, setAccommodations] = useState<PostHiringAccommodation[]>([
    {
      id: 'acc-req-1',
      candidateProfileId: 'cand-demo',
      title: 'NVDA & JAWS Enterprise Screen Reader Software License',
      category: 'ASSISTIVE_TECH',
      status: 'APPROVED',
      details: 'Full enterprise license for NVDA and JAWS screen readers on work laptop.',
      requestedAt: '2026-08-15'
    },
    {
      id: 'acc-req-2',
      candidateProfileId: 'cand-demo',
      title: 'Asynchronous Text-Based Standup Communication Option',
      category: 'COMMUNICATION',
      status: 'COMPLETED',
      details: 'Option to submit daily standups via Slack/Teams text channels instead of mandatory audio calls.',
      requestedAt: '2026-08-18'
    },
    {
      id: 'acc-req-3',
      candidateProfileId: 'cand-demo',
      title: 'Adjustable Standing Ergonomic Desk & Braille Monitor Mount',
      category: 'PHYSICAL_SPACE',
      status: 'IN_PROGRESS',
      details: 'Electric height-adjustable desk installed on Floor 3 near main elevators.',
      requestedAt: '2026-08-25'
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'ASSISTIVE_TECH' | 'PHYSICAL_SPACE' | 'FLEXIBLE_WORK' | 'COMMUNICATION'>('ASSISTIVE_TECH');
  const [newDetails, setNewDetails] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('innoskill_candidate') || localStorage.getItem('openability_candidate');
      if (stored) {
        try { setCandidate(JSON.parse(stored)); } catch (e) {}
      }
    }
  }, []);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const req: PostHiringAccommodation = {
      id: `acc-req-${Date.now()}`,
      candidateProfileId: candidate.profile.id,
      title: newTitle,
      category: newCategory,
      status: 'REQUESTED',
      details: newDetails || 'Official workplace accommodation request generated via InnoSkill AI.',
      requestedAt: new Date().toISOString().split('T')[0]
    };

    setAccommodations([req, ...accommodations]);
    
    const letter = `OFFICIAL WORKPLACE ACCOMMODATION REQUEST
--------------------------------------------------
Date: ${new Date().toLocaleDateString()}
To: People Operations & HR Department
From: ${candidate.profile.fullName}
Role: ${candidate.profile.targetRoles[0] || 'Software Engineer'}

Subject: Workplace Accommodation Request — ${newTitle}

Dear HR Team,

I am writing to formally request a workplace accommodation under our company's inclusion policy.

Requested Item / Arrangement:
${newTitle} (${newCategory.replace('_', ' ')})

Justification and Details:
${newDetails || 'This arrangement enables optimal productivity and accessibility standards.'}

Thank you for your ongoing support in maintaining an accessible workspace.

Sincerely,
${candidate.profile.fullName}
`;

    setGeneratedLetter(letter);
    setNewTitle('');
    setNewDetails('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <StatusBadge tone="success">Completed</StatusBadge>;
      case 'APPROVED':
        return <StatusBadge tone="info">Approved</StatusBadge>;
      case 'IN_PROGRESS':
        return <StatusBadge tone="warning">In Progress</StatusBadge>;
      default:
        return <StatusBadge tone="neutral">Requested</StatusBadge>;
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      
      <PageHeader 
        eyebrow="Employment Support" 
        title="Workplace Accommodation Companion" 
        description="Submit formal accommodation requests, track HR approval statuses, and generate official documentation letters." 
        icon={Building2} 
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Accommodations List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex items-center justify-between text-xs text-[#718096] px-1">
            <span className="font-bold text-[#172033]">Active Accommodation Requests ({accommodations.length})</span>
            <span className="text-[#16A36A] font-semibold">HR Sync Enabled</span>
          </div>

          <div className="space-y-3.5">
            {accommodations.map((acc) => (
              <SurfaceCard key={acc.id} className="p-5 border border-[#DCE5F0] bg-white space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-[#172033]">{acc.title}</h4>
                    <span className="text-[10px] text-[#718096] font-semibold uppercase tracking-wider block mt-0.5">
                      Category: {acc.category.replace('_', ' ')} • Submitted: {acc.requestedAt}
                    </span>
                  </div>
                  {getStatusBadge(acc.status)}
                </div>

                <p className="text-xs text-[#4B5870] leading-relaxed">
                  {acc.details}
                </p>
              </SurfaceCard>
            ))}
          </div>

          {/* Letter Preview Modal Card if generated */}
          {generatedLetter && (
            <SurfaceCard className="p-6 border border-[#2F6FED]/30 bg-[#F4F8FF] space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#2F6FED] flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Generated Accommodation Letter
                </h4>
                <button
                  onClick={() => {
                    const blob = new Blob([generatedLetter], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `accommodation_request_${Date.now()}.txt`;
                    a.click();
                  }}
                  className="button-primary text-xs !py-1.5 !min-h-9"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Text Letter</span>
                </button>
              </div>
              <pre className="p-4 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#172033] font-mono whitespace-pre-wrap max-h-56 overflow-y-auto">
                {generatedLetter}
              </pre>
            </SurfaceCard>
          )}

        </div>

        {/* Right Column: New Request Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          <SurfaceCard className="p-6 border border-[#DCE5F0] bg-white space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] border-b border-[#DCE5F0] pb-2 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#2F6FED]" /> Request Accommodation
            </h3>

            <form onSubmit={handleCreateRequest} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#172033]">Request Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomic chair, JAWS license"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input-pearl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#172033]">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="input-pearl"
                >
                  <option value="ASSISTIVE_TECH">Assistive Technology</option>
                  <option value="PHYSICAL_SPACE">Physical Space / Ergonomics</option>
                  <option value="FLEXIBLE_WORK">Flexible Hours / Remote</option>
                  <option value="COMMUNICATION">Communication & Meetings</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#172033]">Details & Specifications</label>
                <textarea
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="Specify equipment make, model, or requested schedule..."
                  rows={3}
                  className="input-pearl !h-auto"
                />
              </div>

              <button
                type="submit"
                className="button-primary w-full !py-2.5 text-xs mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Official Request</span>
              </button>
            </form>
          </SurfaceCard>

        </div>

      </div>

    </div>
  );
}
