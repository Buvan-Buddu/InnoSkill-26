'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  Award, 
  Briefcase, 
  Mic, 
  X,
  Bot,
  Volume2,
  Hand,
  Building2,
  Plug,
  Building,
} from 'lucide-react';
import InnoSkillLogo from '@/components/brand/InnoSkillLogo';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  description: string;
}

const mainItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Career Hub' },
  { name: 'Profile', href: '/dashboard/profile', icon: User, description: 'Accommodations' },
  { name: 'Resume', href: '/dashboard/resume', icon: FileText, description: 'Builder & Scanner' },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase, description: 'Ability Matching' },
  { name: 'Skills', href: '/dashboard/skills', icon: Award, description: 'Roadmaps' },
  { name: 'Interview', href: '/dashboard/interview', icon: Mic, description: 'Voice Practice' },
];

const toolItems: SidebarItem[] = [
  { name: 'AI Assistant', href: '/dashboard/assistant', icon: Bot, description: 'Guidance' },
  { name: 'Voice Assistant', href: '/dashboard/voice', icon: Volume2, description: 'Voice control' },
  { name: 'Sign Language', href: '/dashboard/sign-language', icon: Hand, description: 'Vision workspace' },
];

const workspaceItems: SidebarItem[] = [
  { name: 'Workplace', href: '/dashboard/workplace', icon: Building2, description: 'Support' },
  { name: 'Integrations', href: '/dashboard/integrations/sap', icon: Plug, description: 'Connected tools' },
  { name: 'Employer Portal', href: '/employer', icon: Building, description: 'Enterprise hiring' },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const [candidateName, setCandidateName] = React.useState('Candidate');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('innoskill_candidate') || localStorage.getItem('openability_candidate');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data.profile?.fullName) {
            setCandidateName(data.profile.fullName);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const initials = candidateName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'IS';

  return (
    <aside className="flex h-full w-[268px] select-none flex-col border-r border-[#DCE5F0] bg-white text-[#172033]" aria-label="Dashboard navigation">
      
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#DCE5F0] bg-white px-5 py-5">
        <Link href="/" className="group flex items-center" aria-label="Go to Home page">
          <InnoSkillLogo variant="header" size="sm" showSubtitle={false} />
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#718096] hover:bg-[#F1F5FA] hover:text-[#172033]"
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3.5 py-5 scrollbar-none">
        <NavGroup label="Career Workspace" items={mainItems} pathname={pathname} onClose={onClose} />
        <NavGroup label="AI Capabilities" items={toolItems} pathname={pathname} onClose={onClose} />
        <NavGroup label="Enterprise & Tools" items={workspaceItems} pathname={pathname} onClose={onClose} />
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-[#DCE5F0] bg-[#F7F9FC] p-4">
        <Link 
          href="/dashboard/profile" 
          className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-white border border-transparent hover:border-[#DCE5F0] hover:shadow-sm" 
          onClick={onClose}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF2FF] text-xs font-bold uppercase text-[#2F6FED] border border-[#C8D5E5]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-[#172033] group-hover:text-[#2F6FED] transition-colors">{candidateName}</p>
            <p className="truncate text-[10px] font-medium text-[#718096]">Candidate account</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function NavGroup({ label, items, pathname, onClose }: { label: string; items: SidebarItem[]; pathname: string; onClose?: () => void }) {
  return (
    <div>
      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#718096]">{label}</p>
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-[#EAF2FF] font-bold text-[#2F6FED] shadow-xs'
                  : 'font-medium text-[#4B5870] hover:bg-[#F1F5FA] hover:text-[#172033]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-[#2F6FED]" aria-hidden="true" />
              )}
              <Icon 
                className={`h-4.5 w-4.5 transition-colors ${
                  isActive ? 'text-[#2F6FED]' : 'text-[#718096] group-hover:text-[#2F6FED]'
                }`} 
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
