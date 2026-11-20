import React from 'react';

interface InnoSkillLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'compact' | 'header';
  showSubtitle?: boolean;
  theme?: 'light' | 'dark';
}

export default function InnoSkillLogo({
  className = '',
  size = 'md',
  variant = 'full',
  showSubtitle = true,
  theme = 'light',
}: InnoSkillLogoProps) {
  const isDark = theme === 'dark';

  // Height presets maintaining original aspect ratio
  const heightMap = {
    sm: 'h-8 sm:h-9',
    md: 'h-9 sm:h-10',
    lg: 'h-11 sm:h-12',
    xl: 'h-14 sm:h-16',
  };

  const iconHeightMap = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
  };

  // Standalone Icon
  if (variant === 'icon') {
    return (
      <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
        <img
          src="/branding/innoskill-ai-icon.png"
          alt="InnoSkill AI"
          className={`${iconHeightMap[size]} w-auto object-contain transition-transform`}
        />
      </div>
    );
  }

  // Header variant with responsive switching:
  if (variant === 'header') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {/* Mobile View: Crisp Standalone Icon + Typography */}
        <div className="flex sm:hidden items-center gap-2">
          <img
            src="/branding/innoskill-ai-icon.png"
            alt="InnoSkill AI"
            className="h-8 w-auto object-contain"
          />
          <span className={`font-extrabold text-sm tracking-tight ${isDark ? 'text-white' : 'text-[#172033]'}`}>
            InnoSkill <span className="text-[#2F6FED] text-xs px-1.5 py-0.5 rounded-md bg-[#EAF2FF] border border-[#DCE5F0] font-black">AI</span>
          </span>
        </div>

        {/* Desktop View: Full Official Horizontal Logo or Icon + Typography */}
        <div className="hidden sm:flex items-center gap-2.5">
          <img
            src="/branding/innoskill-ai-icon.png"
            alt="InnoSkill AI"
            className="h-8 w-auto object-contain"
          />
          <div className="flex items-center gap-1.5">
            <span className={`font-black text-lg tracking-tight ${isDark ? 'text-white' : 'text-[#172033]'}`}>
              InnoSkill
            </span>
            <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-[#EAF2FF] text-[#2F6FED] border border-[#C8D5E5]">
              AI
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant: icon + text
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
        <img
          src="/branding/innoskill-ai-icon.png"
          alt="InnoSkill AI"
          className={`${iconHeightMap[size]} w-auto object-contain flex-shrink-0`}
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black text-base tracking-tight leading-none ${isDark ? 'text-white' : 'text-[#172033]'}`}>
              InnoSkill
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#EAF2FF] text-[#2F6FED] border border-[#DCE5F0]">
              AI
            </span>
          </div>
          {showSubtitle && (
            <span className="text-[9px] font-semibold text-[#718096] tracking-wider uppercase mt-0.5">
              Inclusive Career Companion
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default: Full Official Logo Image
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <picture>
        <source srcSet="/branding/innoskill-ai-logo.webp" type="image/webp" />
        <img
          src="/branding/innoskill-ai-logo.png"
          alt="InnoSkill AI"
          className={`${heightMap[size]} w-auto object-contain`}
        />
      </picture>
    </div>
  );
}
