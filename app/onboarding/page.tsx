'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles,
  Mic,
  CheckCircle2,
  SlidersHorizontal,
  Eye,
  Type,
  Keyboard,
  Volume2,
  Building2,
  Briefcase
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import InnoSkillLogo from '@/components/brand/InnoSkillLogo';

interface SkillItem {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
}

export default function OnboardingPage() {
  const router = useRouter();
  const auth = useAuth();
  const { 
    startVoiceOnboarding, 
    startAgentListening, 
    stopAgentListening, 
    onboardingStep, 
    feedback, 
    transcript, 
    status 
  } = useVoiceAgent();
  const [step, setStep] = useState(1);

  // STEP 1: Basic Profile (Pre-filled from Signup)
  const [fullName, setFullName] = useState(auth.user?.fullName || '');
  const [email, setEmail] = useState(auth.user?.email || '');
  const [education, setEducation] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [targetCareer, setTargetCareer] = useState('');
  const [preferredJobTitles, setPreferredJobTitles] = useState('');

  useEffect(() => {
    if (auth.user?.fullName) setFullName(auth.user.fullName);
    if (auth.user?.email) setEmail(auth.user.email);
  }, [auth.user]);

  // STEP 2: Skills
  const [skills, setSkills] = useState<SkillItem[]>([
    { name: 'React', level: 'Intermediate' },
    { name: 'TypeScript', level: 'Intermediate' }
  ]);
  const [skillInput, setSkillInput] = useState('');
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate');

  // STEP 3: Communication Preferences
  const [commPrefs, setCommPrefs] = useState<string[]>(['TEXT']);

  // STEP 4: Accessibility Support Preferences
  const [screenReader, setScreenReader] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [captions, setCaptions] = useState(false);
  const [textCommunication, setTextCommunication] = useState(false);
  const [flexibleHours, setFlexibleHours] = useState(false);
  const [remoteWork, setRemoteWork] = useState(false);
  const [physicalWorkplace, setPhysicalWorkplace] = useState(false);
  const [accessibleInterview, setAccessibleInterview] = useState(true);
  const [assistiveTech, setAssistiveTech] = useState(false);
  const [otherAccommodation, setOtherAccommodation] = useState('');

  // STEP 5: Work Preferences
  const [workPrefs, setWorkPrefs] = useState<string[]>(['REMOTE']);

  // Success screen trigger
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Listen to voice actions for form filling and selection
  useEffect(() => {
    const handleVoiceFill = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.name) {
        setFullName(detail.name);
        setStep(1);
      }
      if (detail.email) {
        setEmail(detail.email);
        setStep(1);
      }
      if (detail.education) {
        setEducation(detail.education);
        setStep(1);
      }
      if (detail.targetCareer) {
        setTargetCareer(detail.targetCareer);
        setStep(1);
      }
    };

    const handleVoiceSelect = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.skill) {
        if (!skills.some(s => s.name.toLowerCase() === detail.skill.toLowerCase())) {
          setSkills(prev => [...prev, { name: detail.skill, level: 'Intermediate' }]);
        }
        setStep(2);
      }
      if (detail.commPref) {
        toggleCommPref(detail.commPref);
        setStep(3);
      }
      if (detail.workPref) {
        toggleWorkPref(detail.workPref);
        setStep(5);
      }
    };

    const handleVoiceSubmit = () => {
      const submitBtn = document.getElementById('onboarding-submit-btn');
      if (submitBtn) {
        submitBtn.click();
      }
    };

    window.addEventListener('voice-fill-profile', handleVoiceFill);
    window.addEventListener('voice-select-option', handleVoiceSelect);
    window.addEventListener('voice-submit-onboarding', handleVoiceSubmit);

    return () => {
      window.removeEventListener('voice-fill-profile', handleVoiceFill);
      window.removeEventListener('voice-select-option', handleVoiceSelect);
      window.removeEventListener('voice-submit-onboarding', handleVoiceSubmit);
    };
  }, [skills]);

  const isStep1Valid = fullName.trim() !== '' && email.trim() !== '' && targetCareer.trim() !== '';

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.some(s => s.name.toLowerCase() === skillInput.trim().toLowerCase())) {
      setSkills(prev => [...prev, { name: skillInput.trim(), level: skillLevel }]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  };

  const toggleCommPref = (pref: string) => {
    setCommPrefs(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const toggleWorkPref = (pref: string) => {
    setWorkPrefs(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const handleNext = () => {
    if (step === 1 && !isStep1Valid) return;
    setStep(prev => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const accommodations: string[] = [];
    if (screenReader) accommodations.push('Screen Reader Compatibility');
    if (keyboardNavigation) accommodations.push('Keyboard Only Navigation');
    if (captions) accommodations.push('Captions for Video Calls');
    if (textCommunication) accommodations.push('Text Only Asynchronous Chat');
    if (flexibleHours) accommodations.push('Flexible Work Schedules');
    if (remoteWork) accommodations.push('Fully Remote Option');
    if (physicalWorkplace) accommodations.push('Wheelchair Physical Access');
    if (accessibleInterview) accommodations.push('Accessible Online Interview');
    if (assistiveTech) accommodations.push('Assistive Tech Inputs');
    if (otherAccommodation.trim()) accommodations.push(otherAccommodation.trim());

    const finalRoles = preferredJobTitles ? preferredJobTitles.split(',').map(s => s.trim()) : [targetCareer || 'Software Developer'];
    const finalSkills = skills.map(s => s.name);

    const profileData = {
      fullName,
      targetRoles: finalRoles,
      experienceYears: Number(experienceYears),
      education: education || 'Higher Education Candidate',
      onboardingCompleted: true,
      onboardingStep: 'COMPLETE',
      skills: finalSkills
    };

    const accData = {
      communicationPreference: commPrefs[0] || 'VOICE',
      screenReaderRequired: screenReader,
      captionsRequired: captions,
      textCommunicationOnly: textCommunication,
      workPreference: workPrefs[0] || 'REMOTE',
      sharingPreferences: false,
      accommodations
    };

    Promise.all([
      fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      }),
      fetch('/api/user/accessibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accData)
      })
    ]).then(() => {
      auth.setOnboardingState(true, 'COMPLETE');
      setSubmitting(false);
      setSuccess(true);
    }).catch((err) => {
      console.error(err);
      auth.setOnboardingState(true, 'COMPLETE');
      setSubmitting(false);
      setSuccess(true);
    });
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const stepsList = [
    { num: 1, label: 'Profile' },
    { num: 2, label: 'Skills' },
    { num: 3, label: 'Communication' },
    { num: 4, label: 'Support' },
    { num: 5, label: 'Preferences' },
    { num: 6, label: 'Review' }
  ];

  return (
    <div className="min-h-screen w-screen bg-[#F7F9FC] text-[#172033] flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden select-none bg-pearl-grid">
      
      {/* Ambient Pearl Glow */}
      <div className="absolute top-10 left-10 w-80 h-80 rounded-full pearl-glow pointer-events-none" />

      {/* Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-[#DCE5F0] pb-4 z-10 shrink-0">
        <Link href="/" className="flex items-center group hover:opacity-95 transition cursor-pointer select-none" aria-label="Go to Home page">
          <InnoSkillLogo variant="header" size="md" />
        </Link>
        <div className="text-xs text-[#2F6FED] font-bold bg-[#EAF2FF] px-3.5 py-1.5 rounded-full border border-[#DCE5F0]">
          Step {step} of 6
        </div>
      </header>

      {/* Voice-First Onboarding Prompt Card */}
      <div className="max-w-xl mx-auto w-full surface-card p-4.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10 mt-4 border border-[#C8D5E5] bg-white">
        <div className="space-y-1">
          <span className="font-bold text-[#2F6FED] flex items-center gap-1.5 text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#2F6FED]" /> Voice-First Profile Setup
          </span>
          <p className="text-[#4B5870] text-xs">
            Prefer voice conversation? Complete this setup naturally via conversational audio.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            startVoiceOnboarding();
          }}
          className="button-secondary text-xs shrink-0 cursor-pointer !py-2 !min-h-9"
        >
          <Mic className="w-3.5 h-3.5 text-[#2F6FED] animate-pulse" />
          <span>Start Voice Mode</span>
        </button>
      </div>

      {/* Active Voice Onboarding Console Overlay */}
      {onboardingStep !== 'OFF' && (
        <div className="max-w-xl mx-auto w-full bg-white border-2 border-[#2F6FED] p-6 rounded-[20px] z-20 mt-4 space-y-4 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-[#DCE5F0] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F6FED] animate-ping" />
              <span className="font-bold text-xs text-[#2F6FED] uppercase tracking-wider">
                Voice Assistant Active — Step: {onboardingStep}
              </span>
            </div>
            <button
              onClick={stopAgentListening}
              className="text-xs text-[#718096] hover:text-[#172033] font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="bg-[#F7F9FC] p-4 rounded-xl border border-[#DCE5F0] space-y-1">
            <span className="text-[10px] text-[#718096] uppercase font-bold tracking-wider">Assistant Spoke</span>
            <p className="text-sm font-bold text-[#172033] leading-relaxed">
              {feedback || "Listening to your answer..."}
            </p>
          </div>

          {transcript && (
            <div className="bg-white p-3 rounded-xl border border-[#DCE5F0] space-y-1">
              <span className="text-[10px] text-[#718096] uppercase font-bold tracking-wider">You Said</span>
              <p className="text-xs font-semibold text-[#4B5870]">{transcript}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={startAgentListening}
              className={`button-primary w-full py-3 text-xs ${
                status === 'LISTENING' ? 'animate-pulse' : ''
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{status === 'LISTENING' ? 'Listening... Speak Now' : 'Tap to Speak Answer'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Wizard Area */}
      <main className="max-w-xl mx-auto w-full my-auto z-10 py-6">
        
        {/* Progress Tracker Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {stepsList.map((item, idx) => (
              <React.Fragment key={item.num}>
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === item.num 
                        ? 'bg-[#2F6FED] text-white shadow-xs' 
                        : step > item.num 
                        ? 'bg-[#EAF2FF] text-[#2F6FED] border border-[#C8D5E5]' 
                        : 'bg-[#F1F5FA] text-[#A0A9B8] border border-[#DCE5F0]'
                    }`}
                  >
                    {step > item.num ? <Check className="w-3.5 h-3.5" /> : item.num}
                  </div>
                  <span className={`text-[10px] mt-1 font-semibold hidden sm:block ${
                    step === item.num ? 'text-[#2F6FED]' : 'text-[#718096]'
                  }`}>
                    {item.label}
                  </span>
                </div>
                {idx < stepsList.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all ${
                    step > item.num ? 'bg-[#2F6FED]' : 'bg-[#DCE5F0]'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Dynamic Step Panels */}
        <div className="surface-card p-6 sm:p-8 space-y-6 shadow-md border border-[#DCE5F0] bg-white">
          
          {/* STEP 1: Basic Profile */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#172033]">Personal & Career Identity</h2>
                <p className="text-xs text-[#718096]">Let&apos;s establish your basic career preferences and details.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#172033]">
                    Full Name <span className="text-[#2F6FED]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Patel"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-pearl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#172033]">
                    Email Address <span className="text-[#2F6FED]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="maya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-pearl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#172033]">
                    Target Career Goal / Primary Role <span className="text-[#2F6FED]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Accessibility UI Specialist, Python Developer"
                    value={targetCareer}
                    onChange={(e) => setTargetCareer(e.target.value)}
                    className="input-pearl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172033]">Experience (Years)</label>
                    <input
                      type="number"
                      min="0"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Math.max(0, parseInt(e.target.value) || 0))}
                      className="input-pearl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#172033]">Education</label>
                    <input
                      type="text"
                      placeholder="e.g. B.S. Computer Science"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className="input-pearl"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Skills */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#172033]">Core Capabilities & Skills</h2>
                <p className="text-xs text-[#718096]">Add key technical and soft skills to train matching engines.</p>
              </div>

              <form onSubmit={addSkill} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. React, Python, SQL"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="input-pearl flex-1"
                />
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value as any)}
                  className="input-pearl !w-auto"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
                <button
                  type="submit"
                  className="button-primary !px-4"
                  title="Add skill"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#718096]">
                  Active Skills ({skills.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 bg-[#EAF2FF] border border-[#C8D5E5] text-[#2F6FED] px-3 py-1.5 rounded-xl text-xs font-semibold"
                    >
                      <span>{s.name}</span>
                      <span className="text-[10px] text-[#718096]">({s.level})</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(idx)}
                        className="text-[#718096] hover:text-[#D64545] transition cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Communication Preferences */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#172033]">Communication Preferences</h2>
                <p className="text-xs text-[#718096]">Select how you prefer to communicate with interviewers and employers.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'TEXT', label: 'Text & Chat', desc: 'Asynchronous text messaging' },
                  { id: 'VOICE', label: 'Spoken Voice', desc: 'Real-time spoken dialogue' },
                  { id: 'SIGN_LANGUAGE', label: 'Sign Language', desc: 'Camera video recognition' }
                ].map((item) => {
                  const isSelected = commPrefs.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCommPref(item.id)}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                        isSelected 
                          ? 'border-[#2F6FED] bg-[#EAF2FF] shadow-xs' 
                          : 'border-[#DCE5F0] bg-white hover:border-[#C8D5E5]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#2F6FED]' : 'text-[#172033]'}`}>
                          {item.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#2F6FED]" />}
                      </div>
                      <p className="text-[11px] text-[#718096] leading-relaxed">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Accessibility Support */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#172033]">Workplace & Interview Support</h2>
                <p className="text-xs text-[#718096]">Select accommodations you need during applications and on the job.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {[
                  { state: screenReader, set: setScreenReader, label: 'Screen Reader Support' },
                  { state: keyboardNavigation, set: setKeyboardNavigation, label: 'Keyboard-Only Navigation' },
                  { state: captions, set: setCaptions, label: 'Live Video Captions' },
                  { state: textCommunication, set: setTextCommunication, label: 'Text-Only Standups' },
                  { state: flexibleHours, set: setFlexibleHours, label: 'Flexible Work Hours' },
                  { state: remoteWork, set: setRemoteWork, label: 'Full Remote Option' },
                  { state: physicalWorkplace, set: setPhysicalWorkplace, label: 'Wheelchair Physical Access' },
                  { state: accessibleInterview, set: setAccessibleInterview, label: 'Accessible Mock Interviews' },
                  { state: assistiveTech, set: setAssistiveTech, label: 'Assistive Tech Compatibility' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => item.set(!item.state)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      item.state 
                        ? 'border-[#2F6FED] bg-[#EAF2FF] text-[#2F6FED]' 
                        : 'border-[#DCE5F0] bg-white text-[#4B5870] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.state ? <Check className="w-4 h-4 text-[#2F6FED]" /> : <span className="w-4 h-4 rounded-md border border-[#DCE5F0]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Work Preferences */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#172033]">Work Arrangement Preference</h2>
                <p className="text-xs text-[#718096]">Indicate your preferred working location model.</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'REMOTE', label: 'Remote', desc: 'Work from anywhere' },
                  { id: 'HYBRID', label: 'Hybrid', desc: 'Blend of office & home' },
                  { id: 'OFFICE', label: 'Onsite', desc: 'Office environment' },
                ].map((item) => {
                  const isSelected = workPrefs.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleWorkPref(item.id)}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                        isSelected 
                          ? 'border-[#2F6FED] bg-[#EAF2FF] shadow-xs' 
                          : 'border-[#DCE5F0] bg-white hover:border-[#C8D5E5]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#2F6FED]' : 'text-[#172033]'}`}>
                          {item.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#2F6FED]" />}
                      </div>
                      <p className="text-[11px] text-[#718096]">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Review & Finalize */}
          {step === 6 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#172033]">Profile Verification Summary</h2>
                <p className="text-xs text-[#718096]">Review your candidate settings before completing onboarding.</p>
              </div>

              <div className="bg-[#F7F9FC] border border-[#DCE5F0] rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex justify-between border-b border-[#DCE5F0] pb-2">
                  <span className="text-[#718096]">Name:</span>
                  <span className="font-bold text-[#172033]">{fullName}</span>
                </div>
                <div className="flex justify-between border-b border-[#DCE5F0] pb-2">
                  <span className="text-[#718096]">Target Career:</span>
                  <span className="font-bold text-[#2F6FED]">{targetCareer}</span>
                </div>
                <div className="flex justify-between border-b border-[#DCE5F0] pb-2">
                  <span className="text-[#718096]">Skills Count:</span>
                  <span className="font-bold text-[#172033]">{skills.length} skills listed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718096]">Work Model:</span>
                  <span className="font-bold text-[#172033]">{workPrefs.join(', ')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Footer Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-[#DCE5F0]">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="button-secondary text-xs disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={step === 1 && !isStep1Valid}
                className="button-primary text-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="onboarding-submit-btn"
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="button-primary text-xs cursor-pointer"
              >
                <span>{submitting ? 'Finalizing Profile...' : 'Complete Profile & Launch'}</span>
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </main>

      {/* Success Modal Dialogue */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#163B73]/30 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="surface-card p-8 rounded-[20px] max-w-sm w-full text-center space-y-4 border border-[#DCE5F0] shadow-2xl bg-white">
            <CheckCircle2 className="w-14 h-14 text-[#16A36A] mx-auto animate-bounce" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#172033]">You&apos;re all set!</h3>
              <p className="text-xs text-[#4B5870]">
                Your candidate profile has been initialized with customized accessibility and career parameters.
              </p>
            </div>
            <button
              onClick={handleGoToDashboard}
              className="button-primary w-full py-3 text-xs cursor-pointer"
            >
              Enter Candidate Command Center
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-[#718096] z-10 py-2 border-t border-[#DCE5F0]">
        InnoSkill AI • Inclusive Onboarding Protocol
      </footer>
    </div>
  );
}
