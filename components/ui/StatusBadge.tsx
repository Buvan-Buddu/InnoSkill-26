import React from 'react';

interface StatusBadgeProps {
  children: React.ReactNode;
  tone?: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
}

const tones = {
  success: 'bg-[#EBFDF5] text-[#16A36A] border-[#B7F4D8]',
  info: 'bg-[#EAF2FF] text-[#2F6FED] border-[#C8D5E5]',
  warning: 'bg-[#FFF9EB] text-[#D98A00] border-[#FDE5AA]',
  danger: 'bg-[#FFF5F5] text-[#D64545] border-[#FED7D7]',
  neutral: 'bg-[#F1F5FA] text-[#4B5870] border-[#DCE5F0]',
};

export default function StatusBadge({ children, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${tones[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}
