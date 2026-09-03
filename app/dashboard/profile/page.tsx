'use client';

import React, { useState, useEffect } from 'react';
import { emptyCandidate, demoCandidate } from '@/database/seed-data';
import { Eye, HelpCircle, Save, Smile, HeartHandshake } from 'lucide-react';

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState(emptyCandidate.profile);
  const [acc, setAcc] = useState(emptyCandidate.accessibility);
  const [skills, setSkills] = useState(emptyCandidate.skills);
  const [targetRoleInput, setTargetRoleInput] = useState('');
  const [newAccommodation, setNewAccommodation] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('openability_candidate');
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
    if (newAccommodation.trim() && !acc.accommodations.includes(newAccommodation.trim())) {
      setAcc(prev => ({ ...prev, accommodations: [...prev.accommodations, newAccommodation.trim()] }));
      setNewAccommodation('');
    }
  };

  const removeAcc = (accToRemove: string) => {
    setAcc(prev => ({ ...prev, accommodations: prev.accommodations.filter(a => a !== accToRemove) }));
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const candidateData = {
        profile,
        accessibility: acc,
        skills
      };
      localStorage.setItem('openability_candidate', JSON.stringify(candidateData));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & SAP Integration Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Accessibility & Profile settings</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
            Modify your communication preference, workspace configuration, and required assistive accommodations.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs shrink-0 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-extrabold text-cyan-300">SAP SuccessFactors Ready</span>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs animate-in fade-in slide-in-from-top-2">
          🎉 Accessibility profile saved successfully! Matches, SAP integration, and AI outputs have updated.
        </div>
      )}

      {/* Main Grid */}
      <form onSubmit={saveProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Profile Form & Target Roles */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Profile Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="font-black border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
              <Smile className="w-5 h-5 text-emerald-400" /> Professional Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleProfileChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-400 focus:outline-none text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Phone Contact</label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleProfileChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-400 focus:outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Experience Years</label>
                <input
                  type="number"
                  name="experienceYears"
                  value={profile.experienceYears || 0}
                  onChange={handleProfileChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-400 focus:outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Education Details</label>
                <input
                  type="text"
                  name="education"
                  value={profile.education || ''}
                  onChange={handleProfileChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-400 focus:outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Professional Bio</label>
              <textarea
                name="bio"
                value={profile.bio || ''}
                onChange={handleProfileChange}
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-400 focus:outline-none text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Target Roles */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-black border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-900 dark:text-white text-sm sm:text-base">
              Target Career Roles
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Frontend Lead, UI Dev"
                value={targetRoleInput}
                onChange={(e) => setTargetRoleInput(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-400 focus:outline-none text-slate-900 dark:text-white placeholder-slate-400"
              />
              <button
                type="button"
                onClick={addRole}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition"
              >
                Add Role
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {profile.targetRoles.map((role) => (
                <span
                  key={role}
                  className="flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800"
                >
                  {role}
                  <button
                    type="button"
                    onClick={() => removeRole(role)}
                    className="text-slate-400 hover:text-red-500 transition font-black ml-1 text-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Accessibility Configurations */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="font-black border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-400" /> Accommodations
            </h3>

            {/* Comm preference */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Communication Mode Preference</label>
              <select
                name="communicationPreference"
                value={acc.communicationPreference}
                onChange={handleAccChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-400 focus:outline-none text-slate-900 dark:text-white"
              >
                <option value="TEXT">Text only (Async messages / transcripts)</option>
                <option value="VOICE">Voice only (TTS synthesis / screen reading)</option>
                <option value="SIGN_LANGUAGE">Sign Language (Video / camera interface)</option>
              </select>
            </div>

            {/* Work setting */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Work Setting Preference</label>
              <select
                name="workPreference"
                value={acc.workPreference}
                onChange={handleAccChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-400 focus:outline-none text-slate-900 dark:text-white"
              >
                <option value="REMOTE">Fully Remote</option>
                <option value="HYBRID">Hybrid Model</option>
                <option value="OFFICE">Office Only</option>
              </select>
            </div>

            {/* Checklist */}
            <div className="space-y-3.5 pt-2">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block border-b border-slate-100 dark:border-slate-800 pb-1">Sensory & Tech Accommodations</span>
              
              <div className="space-y-2.5">
                {[
                  { name: 'screenReaderRequired', label: 'Require Screen Reader Layouts' },
                  { name: 'highContrastRequired', label: 'Require High-Contrast Mode' },
                  { name: 'largeTextRequired', label: 'Require Large Font Scaling' },
                  { name: 'captionsRequired', label: 'Require Captions for Video Call' },
                  { name: 'textCommunicationOnly', label: 'Prefer Text-Only Communication' },
                  { name: 'accessiblePhysicalSpace', label: 'Require Wheelchair Physical Spaces' },
                  { name: 'flexibleHours', label: 'Require Flexible Working Hours' },
                  { name: 'keyboardNavigationOnly', label: 'Require Keyboard-Only Navigation' },
                ].map((item) => (
                  <label key={item.name} className="flex items-center gap-3 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name={item.name}
                      checked={!!(acc as any)[item.name]}
                      onChange={handleAccChange}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-emerald-500 focus:ring-emerald-400 focus:outline-none shrink-0"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom accommodations text */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">Custom Required Accommodations</label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Ergonomic desk setup"
                  value={newAccommodation}
                  onChange={(e) => setNewAccommodation(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-400 focus:outline-none text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addAcc}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {acc.accommodations.map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeAcc(item)}
                      className="text-slate-400 hover:text-red-500 font-black ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 transition focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-lg shadow-emerald-500/20 text-xs sm:text-sm cursor-pointer"
          >
            <Save className="w-4.5 h-4.5" /> Save Accessibility Settings
          </button>
        </div>

      </form>
    </div>
  );
}
