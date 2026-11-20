'use client';

import React, { useState, useEffect } from 'react';
import { emptyCandidate } from '@/database/seed-data';
import { 
  User, 
  Save, 
  Briefcase, 
  SlidersHorizontal, 
  Eye, 
  MessageSquare, 
  Plus, 
  Trash2, 
  CheckCircle2,
  ShieldCheck,
  Check
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import ProgressBar from '@/components/ui/ProgressBar';

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState(emptyCandidate.profile);
  const [acc, setAcc] = useState(emptyCandidate.accessibility);
  const [skills, setSkills] = useState(emptyCandidate.skills);
  const [targetRoleInput, setTargetRoleInput] = useState('');
  const [newAccommodation, setNewAccommodation] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('innoskill_candidate') || localStorage.getItem('openability_candidate');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data.profile) setProfile(data.profile);
          if (data.accessibility) setAcc(data.accessibility);
          if (data.skills) setSkills(data.skills);
        } catch (e) {
          console.error(e);
        }
      }
    }

    const handleVoiceFill = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.name) {
        setProfile(prev => ({ ...prev, fullName: detail.name }));
      }
      if (detail.phone) {
        setProfile(prev => ({ ...prev, phone: detail.phone }));
      }
      if (detail.education) {
        setProfile(prev => ({ ...prev, education: detail.education }));
      }
      if (detail.careerGoal) {
        setProfile(prev => ({ ...prev, targetRoles: [...prev.targetRoles, detail.careerGoal] }));
      }
    };

    const handleVoiceSelectPref = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.workPreference) {
        setAcc(prev => ({ ...prev, workPreference: detail.workPreference }));
      }
      if (detail.communicationPreference) {
        setAcc(prev => ({ ...prev, communicationPreference: detail.communicationPreference }));
      }
    };

    const handleVoiceSelectAcc = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const opt = detail.option;
      if (opt) {
        setAcc(prev => ({ ...prev, [opt]: !(prev as any)[opt] }));
      }
    };

    window.addEventListener('voice-fill-profile', handleVoiceFill);
    window.addEventListener('voice-select-preference', handleVoiceSelectPref);
    window.addEventListener('voice-select-accommodation', handleVoiceSelectAcc);

    return () => {
      window.removeEventListener('voice-fill-profile', handleVoiceFill);
      window.removeEventListener('voice-select-preference', handleVoiceSelectPref);
      window.removeEventListener('voice-select-accommodation', handleVoiceSelectAcc);
    };
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAccChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setAcc(prev => ({ ...prev, [name]: val }));
  };

  const addRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetRoleInput.trim() && !profile.targetRoles.includes(targetRoleInput.trim())) {
      setProfile(prev => ({ ...prev, targetRoles: [...prev.targetRoles, targetRoleInput.trim()] }));
      setTargetRoleInput('');
    }
  };

  const removeRole = (roleToRemove: string) => {
    setProfile(prev => ({ ...prev, targetRoles: prev.targetRoles.filter(r => r !== roleToRemove) }));
  };

  const addAcc = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccommodation.trim()) {
      setAcc(prev => ({ ...prev, accommodations: [...prev.accommodations, newAccommodation.trim()] }));
      setNewAccommodation('');
    }
  };

  const removeAcc = (accToRemove: string) => {
    setAcc(prev => ({ ...prev, accommodations: prev.accommodations.filter(a => a !== accToRemove) }));
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const candidateData = {
      profile,
      accessibility: acc,
      skills
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('innoskill_candidate', JSON.stringify(candidateData));
      localStorage.setItem('openability_candidate', JSON.stringify(candidateData));
    }

    try {
      await Promise.all([
        fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        }),
        fetch('/api/user/accessibility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(acc)
        })
      ]);
    } catch (e) {
      console.error(e);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = profile.fullName
    ? profile.fullName.split(' ').map((n: string) => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
    : 'CA';

  return (
    <div className="space-y-6 pb-12 select-none">
      
      <PageHeader 
        eyebrow="Candidate Details" 
        title="Profile & Accessibility Settings" 
        description="Manage your professional summary, verified skills, communication modes, and workplace accommodation requests." 
        icon={User} 
      />

      {/* Top Profile Summary Card */}
      <section className="surface-card p-6 sm:p-7 border border-[#DCE5F0] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF2FF] text-xl font-black uppercase text-[#2F6FED] border border-[#C8D5E5]">
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#172033]">{profile.fullName || 'Candidate'}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EBFDF5] text-[#16A36A] border border-[#B7F4D8]">
                Verified
              </span>
            </div>
            <p className="text-xs text-[#4B5870]">
              {profile.targetRoles?.[0] || 'Software Professional'} • {profile.education || 'Higher Education'}
            </p>
            <p className="text-xs text-[#718096]">
              {profile.phone || 'Phone not set'} • {profile.experienceYears || 0} years experience
            </p>
          </div>
        </div>

        {/* Profile Strength */}
        <div className="w-full sm:w-64 bg-[#F7F9FC] border border-[#EAF0F6] rounded-2xl p-4 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#4B5870]">Profile Strength</span>
            <span className="text-[#2F6FED]">85%</span>
          </div>
          <ProgressBar value={85} showValue={false} />
          <span className="text-[10px] text-[#718096] block">High completeness for job matching</span>
        </div>
      </section>

      {saved && (
        <div className="p-4 rounded-2xl border border-[#B7F4D8] bg-[#EBFDF5] text-[#16A36A] font-bold text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile and accommodation preferences saved successfully!</span>
        </div>
      )}

      {/* Main Grid */}
      <form onSubmit={saveProfile} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Personal & Professional Information (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Personal & Professional */}
          <div className="surface-card p-6 space-y-4 border border-[#DCE5F0] bg-white">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#DCE5F0]">
              <span className="p-2 rounded-xl bg-[#EAF2FF] text-[#2F6FED]">
                <User className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-[#172033]">Personal & Professional Details</h3>
                <p className="text-[11px] text-[#718096]">Identity information shared with potential employers.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#172033]">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleProfileChange}
                  className="input-pearl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#172033]">Phone Contact</label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleProfileChange}
                  className="input-pearl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#172033]">Experience (Years)</label>
                <input
                  type="number"
                  name="experienceYears"
                  value={profile.experienceYears || 0}
                  onChange={handleProfileChange}
                  className="input-pearl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#172033]">Education Institution / Degree</label>
                <input
                  type="text"
                  name="education"
                  value={profile.education || ''}
                  onChange={handleProfileChange}
                  className="input-pearl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#172033]">Executive Summary / Bio</label>
              <textarea
                name="bio"
                value={profile.bio || ''}
                onChange={handleProfileChange}
                rows={3}
                className="input-pearl !h-auto"
                placeholder="Brief introduction of your career strengths and goals..."
              />
            </div>
          </div>

          {/* Section 2: Career Goals & Target Roles */}
          <div className="surface-card p-6 space-y-4 border border-[#DCE5F0] bg-white">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#DCE5F0]">
              <span className="p-2 rounded-xl bg-[#EAF2FF] text-[#2F6FED]">
                <Briefcase className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-[#172033]">Target Career Roles</h3>
                <p className="text-[11px] text-[#718096]">Roles used to train ability matching and recommendations.</p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Accessibility UI Specialist, Cloud Architect"
                value={targetRoleInput}
                onChange={(e) => setTargetRoleInput(e.target.value)}
                className="input-pearl flex-1"
              />
              <button
                type="button"
                onClick={addRole}
                className="button-primary !px-4"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {profile.targetRoles.map((role: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 bg-[#EAF2FF] border border-[#C8D5E5] text-[#2F6FED] px-3 py-1.5 rounded-xl text-xs font-semibold"
                >
                  <span>{role}</span>
                  <button
                    type="button"
                    onClick={() => removeRole(role)}
                    className="text-[#718096] hover:text-[#D64545] transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Preferences & Accommodations (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section 3: Communication & Work Preferences */}
          <div className="surface-card p-6 space-y-4 border border-[#DCE5F0] bg-white">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#DCE5F0]">
              <span className="p-2 rounded-xl bg-[#EAF2FF] text-[#2F6FED]">
                <SlidersHorizontal className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-[#172033]">Communication & Work Style</h3>
                <p className="text-[11px] text-[#718096]">Your preferred operational models.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#172033]">Communication Mode</label>
                <select
                  name="communicationPreference"
                  value={acc.communicationPreference}
                  onChange={handleAccChange}
                  className="input-pearl"
                >
                  <option value="TEXT">Text & Asynchronous Chat</option>
                  <option value="VOICE">Spoken Voice (Audio)</option>
                  <option value="SIGN_LANGUAGE">Sign Language (Visual)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#172033]">Work Arrangement</label>
                <select
                  name="workPreference"
                  value={acc.workPreference}
                  onChange={handleAccChange}
                  className="input-pearl"
                >
                  <option value="REMOTE">Fully Remote</option>
                  <option value="HYBRID">Hybrid (Remote + Office)</option>
                  <option value="ONSITE">Onsite Office</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Specific Workplace Accommodations */}
          <div className="surface-card p-6 space-y-4 border border-[#DCE5F0] bg-white">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#DCE5F0]">
              <span className="p-2 rounded-xl bg-[#EAF2FF] text-[#2F6FED]">
                <Eye className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-[#172033]">Accommodations & Support</h3>
                <p className="text-[11px] text-[#718096]">Synced to SAP SuccessFactors requisitions.</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { name: 'screenReaderRequired', label: 'Screen reader required' },
                { name: 'highContrastRequired', label: 'High contrast layout mode' },
                { name: 'largeTextRequired', label: 'Large text typography scaling' },
                { name: 'captionsRequired', label: 'Closed captions for video calls' },
                { name: 'textCommunicationOnly', label: 'Text-only communication preference' },
                { name: 'accessiblePhysicalSpace', label: 'Wheelchair / physical facility access' },
                { name: 'flexibleHours', label: 'Flexible working hours' },
                { name: 'keyboardNavigationOnly', label: 'Keyboard-only navigation support' },
              ].map((item) => (
                <label
                  key={item.name}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F7F9FC] transition cursor-pointer text-xs font-semibold text-[#172033]"
                >
                  <input
                    type="checkbox"
                    name={item.name}
                    checked={Boolean((acc as any)[item.name])}
                    onChange={handleAccChange}
                    className="h-4 w-4 rounded-md border-[#DCE5F0] text-[#2F6FED] focus:ring-[#2F6FED]"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            {/* Custom Accommodations List */}
            <div className="pt-2 border-t border-[#DCE5F0] space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block">
                Additional Accommodation Items
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Ergonomic keyboard, NVDA license"
                  value={newAccommodation}
                  onChange={(e) => setNewAccommodation(e.target.value)}
                  className="input-pearl flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={addAcc}
                  className="button-secondary !px-3 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {acc.accommodations.map((a: string, idx: number) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-2 rounded-lg bg-[#F7F9FC] border border-[#EAF0F6] text-xs font-medium text-[#4B5870]"
                  >
                    <span>{a}</span>
                    <button
                      type="button"
                      onClick={() => removeAcc(a)}
                      className="text-[#718096] hover:text-[#D64545] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Save Action */}
          <button
            type="submit"
            className="button-primary w-full py-3.5 text-sm cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Accommodations</span>
          </button>

        </div>

      </form>

    </div>
  );
}
