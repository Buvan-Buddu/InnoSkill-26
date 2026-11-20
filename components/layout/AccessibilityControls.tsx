'use client';

import React, { useState, useEffect } from 'react';
import { accessibilityService } from '@/services/accessibility';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { Eye, Type, Volume2, Keyboard, Check, Mic } from 'lucide-react';

export default function AccessibilityControls() {
  const { voiceFirstMode, setVoiceFirstMode } = useVoiceAgent();
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Sync with DOM classes on mount / update
    accessibilityService.applyProfile({
      highContrastRequired: highContrast,
      largeTextRequired: largeText,
      keyboardNavigationOnly: keyboardNav,
    });
  }, [highContrast, largeText, keyboardNav]);

  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const toggleLargeText = () => setLargeText(prev => !prev);
  const toggleSound = () => setSoundEnabled(prev => !prev);
  const toggleKeyboardNav = () => setKeyboardNav(prev => !prev);

  return (
    <div className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#DCE5F0] bg-[#EAF2FF] text-[#2F6FED] hover:bg-[#DCE5F0]/60 focus:ring-2 focus:ring-[#2F6FED] text-xs sm:text-sm font-bold transition shadow-xs"
        aria-label="Accessibility settings"
        aria-expanded={open}
      >
        <Eye className="w-4 h-4 text-[#2F6FED]" />
        <span>Accessibility</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-76 rounded-2xl border border-[#DCE5F0] bg-white p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE5F0] mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#172033]">Accessibility Preferences</h3>
            <span className="text-[10px] font-semibold text-[#718096] bg-[#F1F5FA] px-2 py-0.5 rounded-md">WCAG 2.1 AA</span>
          </div>
          
          <div className="space-y-2.5">
            <button
              onClick={() => setVoiceFirstMode(!voiceFirstMode)}
              role="switch"
              aria-checked={voiceFirstMode}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-sm font-medium transition cursor-pointer ${
                voiceFirstMode 
                  ? 'border-[#2F6FED] bg-[#EAF2FF] text-[#2F6FED] font-bold' 
                  : 'border-[#EAF0F6] bg-white hover:bg-[#F7F9FC] text-[#172033]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Mic className="w-4 h-4 text-[#2F6FED]" />
                <div>
                  <div className="font-bold text-xs">Voice-First Mode</div>
                  <div className="text-[10px] text-[#718096]">Speak & listen career navigation</div>
                </div>
              </div>
              {voiceFirstMode && <Check className="w-4 h-4 text-[#2F6FED] stroke-[3]" />}
            </button>

            <button
              onClick={toggleHighContrast}
              role="switch"
              aria-checked={highContrast}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-sm font-medium transition cursor-pointer ${
                highContrast 
                  ? 'border-[#2F6FED] bg-[#EAF2FF] text-[#2F6FED] font-bold' 
                  : 'border-[#EAF0F6] bg-white hover:bg-[#F7F9FC] text-[#172033]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-[#2F6FED]" />
                <div>
                  <div className="font-bold text-xs">High Contrast</div>
                  <div className="text-[10px] text-[#718096]">Maximizes color separation</div>
                </div>
              </div>
              {highContrast && <Check className="w-4 h-4 text-[#2F6FED] stroke-[3]" />}
            </button>

            <button
              onClick={toggleLargeText}
              role="switch"
              aria-checked={largeText}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-sm font-medium transition cursor-pointer ${
                largeText 
                  ? 'border-[#2F6FED] bg-[#EAF2FF] text-[#2F6FED] font-bold' 
                  : 'border-[#EAF0F6] bg-white hover:bg-[#F7F9FC] text-[#172033]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Type className="w-4 h-4 text-[#2F6FED]" />
                <div>
                  <div className="font-bold text-xs">Large Text</div>
                  <div className="text-[10px] text-[#718096]">Enlarge system typography</div>
                </div>
              </div>
              {largeText && <Check className="w-4 h-4 text-[#2F6FED] stroke-[3]" />}
            </button>

            <button
              onClick={toggleKeyboardNav}
              role="switch"
              aria-checked={keyboardNav}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-sm font-medium transition cursor-pointer ${
                keyboardNav 
                  ? 'border-[#2F6FED] bg-[#EAF2FF] text-[#2F6FED] font-bold' 
                  : 'border-[#EAF0F6] bg-white hover:bg-[#F7F9FC] text-[#172033]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Keyboard className="w-4 h-4 text-[#2F6FED]" />
                <div>
                  <div className="font-bold text-xs">Keyboard Focus</div>
                  <div className="text-[10px] text-[#718096]">Enhanced navigation borders</div>
                </div>
              </div>
              {keyboardNav && <Check className="w-4 h-4 text-[#2F6FED] stroke-[3]" />}
            </button>

            <button
              onClick={toggleSound}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-sm font-medium transition cursor-pointer ${
                soundEnabled 
                  ? 'border-[#2F6FED] bg-[#EAF2FF] text-[#2F6FED] font-bold' 
                  : 'border-[#EAF0F6] bg-white hover:bg-[#F7F9FC] text-[#172033]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-[#2F6FED]" />
                <div>
                  <div className="font-bold text-xs">Audio Prompts</div>
                  <div className="text-[10px] text-[#718096]">Enable spoken instructions</div>
                </div>
              </div>
              {soundEnabled && <Check className="w-4 h-4 text-[#2F6FED] stroke-[3]" />}
            </button>
          </div>
          
          <div className="mt-3 pt-3 border-t border-[#DCE5F0] text-[10px] text-center text-[#718096]">
            Preferences apply instantly to this session
          </div>
        </div>
      )}
    </div>
  );
}
