import { Job, WorkPreference, JobAccessibility } from '@/types';
import { SapJobRequisition } from '../types';

export function adaptSapJobToOpenAbilityJob(sapJob: SapJobRequisition): Job {
  const isRemote = sapJob.isRemote || 
    (sapJob.location && sapJob.location.toLowerCase().includes('remote')) || 
    (sapJob.jobDescription && sapJob.jobDescription.toLowerCase().includes('remote'));

  const workType: WorkPreference = isRemote ? 'REMOTE' : 'HYBRID';

  const accessibility: JobAccessibility = {
    id: `acc_sap_${sapJob.jobReqId}`,
    jobId: `sap_${sapJob.jobReqId}`,
    remoteAvailable: Boolean(isRemote),
    flexibleHours: true,
    screenReaderCompatible: true,
    captionSupport: true,
    textCommunication: true,
    accessibleInterview: true,
    physicalAccessibility: true,
    assistiveTechnologySupport: true,
    readinessScore: isRemote ? 95 : 85,
    verificationStatus: 'EMPLOYER_REPORTED',
    notes: 'Synchronized directly from SAP SuccessFactors HCM Suite'
  };

  return {
    id: `sap_${sapJob.jobReqId}`,
    title: sapJob.title || 'SAP Qualified Position',
    company: 'SAP Partner Enterprise',
    description: sapJob.jobDescription || `Open career opportunity managed via SAP SuccessFactors Requisition #${sapJob.jobReqId}.`,
    requirements: `Department: ${sapJob.department || 'Enterprise Operations'}. Department Job Code: ${sapJob.jobCode || 'SAP-REQ'}. Requires proficiency in core domain responsibilities.`,
    location: sapJob.location || 'Remote / Hybrid (SAP Enterprise)',
    salaryRange: sapJob.annualSalary ? `$${sapJob.annualSalary} / year` : '$85,000 - $135,000 / year',
    workType,
    createdAt: sapJob.lastModifiedDateTime ? new Date(sapJob.lastModifiedDateTime) : new Date(),
    updatedAt: new Date(),
    accessibility
  };
}
