'use client';

import React from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  breadcrumbs?: string[];
  actions?: React.ReactNode;
}

export default function PageHeader({ eyebrow, title, description, icon: Icon, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-[#DCE5F0] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-[#718096]">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={`${crumb}-${index}`}>
                {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-[#A0A9B8]" aria-hidden="true" />}
                <span className={index === breadcrumbs.length - 1 ? 'text-[#172033] font-bold' : ''}>{crumb}</span>
              </React.Fragment>
            ))}
          </nav>
        )}
        <div className="flex items-start gap-3.5">
          {Icon && (
            <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#2F6FED] border border-[#DCE5F0]">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
          <div>
            {eyebrow && <p className="page-eyebrow mb-1">{eyebrow}</p>}
            <h1 className="page-title">{title}</h1>
            {description && <p className="page-description mt-1.5 max-w-2xl">{description}</p>}
          </div>
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  );
}
