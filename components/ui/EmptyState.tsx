import { LucideIcon } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: { 
  icon: LucideIcon; 
  title: string; 
  description: string; 
  action?: React.ReactNode;
}) {
  return (
    <div className="surface-card flex flex-col items-center justify-center px-6 py-12 text-center border border-[#DCE5F0]">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#2F6FED] border border-[#DCE5F0]">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-bold text-[#172033]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[#4B5870]">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
