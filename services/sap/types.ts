export interface SapJobRequisition {
  jobReqId: string;
  title: string;
  jobDescription?: string;
  location?: string;
  department?: string;
  jobCode?: string;
  annualSalary?: string;
  status?: string;
  lastModifiedDateTime?: string;
  facilityZipCode?: string;
  country?: string;
  isRemote?: boolean;
}

export interface SapCandidate {
  candidateId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  currentTitle?: string;
  zipCode?: string;
  country?: string;
}

export interface SapSpecialSkill {
  backgroundElementId: string;
  skillName: string;
  proficiency?: string;
  yearsOfExperience?: number;
}

export interface SapODataResponse<T> {
  d: {
    results: T[];
  };
}

export interface SapAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface SapStatusResponse {
  isConfigured: boolean;
  isConnected: boolean;
  provider: string;
  baseUrl?: string;
  lastSyncTime?: string;
  jobCount?: number;
  message: string;
}
