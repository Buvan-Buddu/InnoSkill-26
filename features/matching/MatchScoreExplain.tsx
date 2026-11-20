'use client';

import React from 'react';
import { Job, MatchingEngineResult } from '@/types';
import { CheckCircle2, AlertTriangle, Info, Sparkles, Building2 } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';

interface MatchScoreExplainProps {
  job: Job;
  matchResult: MatchingEngineResult;
}

export default function MatchScoreExplain({ job, matchResult }: MatchScoreExplainProps) {
  const {
    overallScore,
    skillScore,
    experienceScore,
    careerGoalScore,
    workPreferenceScore,
    accessibilityScore,
    strengths,
    skillGaps,
    accessibilityCompatibility,
    explanation,
    recommendation
  } = matchResult;

  const scoreBadgeTone = (score: number): 'success' | 'info' | 'warning' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    return 'warning';
  };

  return (
    <div className="surface-card overflow-hidden border border-[#DCE5F0]">
      {/* Header Banner */}
      <div className="bg-white px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE5F0]">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#EAF2FF] text-[#2F6FED] border border-[#C8D5E5]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-base text-[#172033]">{job.title}</h3>
              {job.accessibility?.verificationStatus && (
                <StatusBadge tone="info">
                  {job.accessibility.verificationStatus.replace('_', ' ')}
                </StatusBadge>
              )}
            </div>
            <p className="text-xs text-[#718096] mt-0.5">{job.company} • {job.location}</p>
          </div>
        </div>

        {/* Overall Match Badge */}
        <div className="flex items-center gap-3 bg-[#F7F9FC] border border-[#DCE5F0] rounded-2xl px-4 py-2 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block">Overall Match</span>
            <span className="text-xs font-semibold text-[#4B5870]">{job.workType}</span>
          </div>
          <span className="text-2xl font-black text-[#2F6FED] pl-2 border-l border-[#DCE5F0]">
            {overallScore}%
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Dimension Score Progress Bars */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
            Match Breakdown Metrics
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[
              { label: 'Technical Skills Alignment', score: skillScore },
              { label: 'Experience Depth', score: experienceScore },
              { label: 'Career Trajectory Goals', score: careerGoalScore },
              { label: 'Work Schedule & Mode', score: workPreferenceScore },
              { label: 'Workplace Accommodations', score: accessibilityScore },
            ].map((dim, idx) => (
              <div key={idx} className="bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#4B5870] truncate">{dim.label}</span>
                  <span className="font-bold text-[#172033]">{dim.score}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#EAF0F6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2F6FED] rounded-full transition-all duration-300"
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Explanation & Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#F4F8FF] border border-[#C8D5E5] rounded-2xl p-4.5 space-y-1.5">
            <span className="text-xs font-bold text-[#2F6FED] flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-4 h-4" /> AI Compatibility Analysis
            </span>
            <p className="text-xs leading-relaxed text-[#172033] font-medium">
              {explanation}
            </p>
          </div>

          <div className="bg-[#F7F9FC] border border-[#DCE5F0] rounded-2xl p-4.5 space-y-1.5">
            <span className="text-xs font-bold text-[#16A36A] flex items-center gap-1.5 uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4" /> Strategic Recommendation
            </span>
            <p className="text-xs leading-relaxed text-[#172033] font-medium">
              {recommendation}
            </p>
          </div>
        </div>

        {/* Strengths & Gaps Two-Column Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[#DCE5F0]">
          
          {/* Key Strengths */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#16A36A] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Validated Strengths ({strengths.length})
            </h4>
            <ul className="space-y-2">
              {strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-[#4B5870]">
                  <span className="text-[#16A36A] font-bold">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Skill Gaps */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D98A00] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Recommended Growth Gaps ({skillGaps.length})
            </h4>
            {skillGaps.length === 0 ? (
              <p className="text-xs text-[#718096]">No major skill gaps identified for this role.</p>
            ) : (
              <ul className="space-y-2">
                {skillGaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#4B5870]">
                    <span className="text-[#D98A00] font-bold">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
