import { CandidateProfile } from '@/types';
import { SapCandidate, SapSpecialSkill } from '../types';

export function adaptSapCandidateToProfile(sapCandidate: SapCandidate): Partial<CandidateProfile> {
  const fullName = [sapCandidate.firstName, sapCandidate.lastName].filter(Boolean).join(' ') || 'SAP Sync Candidate';
  return {
    id: `sap_cand_${sapCandidate.candidateId}`,
    fullName,
    phone: sapCandidate.phone,
    bio: `Candidate synchronized from SAP SuccessFactors (ID: ${sapCandidate.candidateId}). Current role: ${sapCandidate.currentTitle || 'Enterprise Specialist'}.`
  };
}

export function adaptSapSkillsToOpenAbilitySkills(sapSkills: SapSpecialSkill[]): string[] {
  return sapSkills
    .map(s => s.skillName)
    .filter((name): name is string => Boolean(name && name.trim()));
}
