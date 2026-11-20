import Link from 'next/link';
import { ArrowUpRight, LucideIcon } from 'lucide-react';
import SurfaceCard from './SurfaceCard';

interface ActionCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function ActionCard({ href, title, description, icon: Icon }: ActionCardProps) {
  return (
    <Link href={href} className="block group">
      <SurfaceCard interactive className="h-full p-5 transition-all duration-200 hover:border-[#2F6FED]/40 hover:bg-[#F4F8FF]">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#2F6FED] transition-colors group-hover:bg-[#2F6FED] group-hover:text-white">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <ArrowUpRight className="h-5 w-5 text-[#A0A9B8] transition-all group-hover:text-[#2F6FED] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </div>
        <h3 className="mt-5 text-sm font-bold text-[#172033] group-hover:text-[#2F6FED] transition-colors">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-[#4B5870]">{description}</p>
      </SurfaceCard>
    </Link>
  );
}
