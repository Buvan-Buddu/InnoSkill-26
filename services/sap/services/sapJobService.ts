import { Job } from '@/types';
import { sapApiClient } from '../client';
import { adaptSapJobToOpenAbilityJob } from '../adapters/jobAdapter';
import { isSapConfigured } from '../config';

export async function getSapJobs(): Promise<{ jobs: Job[]; isConfigured: boolean; source: string }> {
  const configured = isSapConfigured();
  if (!configured) {
    return { jobs: [], isConfigured: false, source: 'SAP SuccessFactors (Unconfigured)' };
  }

  try {
    const rawSapJobs = await sapApiClient.getJobRequisitions();
    const adaptedJobs = rawSapJobs.map(adaptSapJobToOpenAbilityJob);
    return {
      jobs: adaptedJobs,
      isConfigured: true,
      source: 'SAP SuccessFactors HCM OData v2'
    };
  } catch (err) {
    console.warn('[SAP Job Service] Error retrieving SAP job requisitions:', err);
    return { jobs: [], isConfigured: true, source: 'SAP SuccessFactors (Offline)' };
  }
}
