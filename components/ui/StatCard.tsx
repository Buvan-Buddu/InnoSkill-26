import React from 'react';
import { LucideIcon, TrendingUp } from 'lucide-react';
import SurfaceCard from './SurfaceCard';

interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
}

export default function StatCard({ label, value, detail, icon: Icon }: StatCardProps) {
  return (
    <SurfaceCard className="p-5 hover:border-[#C8D5E5] transition-all">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#2F6FED]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <TrendingUp className="h-4 w-4 text-[#A0A9B8]" aria-hidden="true" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#718096]">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-[#172033]">{value}</p>
      {detail && <p className="mt-1 text-xs font-medium text-[#4B5870]">{detail}</p>}
    </SurfaceCard>
  );
}
