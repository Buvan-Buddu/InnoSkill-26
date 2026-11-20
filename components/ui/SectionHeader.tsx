import React from 'react';

export default function SectionHeader({ 
  title, 
  description, 
  action 
}: { 
  title: string; 
  description?: string; 
  action?: React.ReactNode; 
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-[#172033]">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-[#4B5870]">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
