import { getSapConfig } from './config';
import { getSapAccessToken } from './auth';
import { SapJobRequisition, SapCandidate, SapSpecialSkill, SapODataResponse } from './types';

export class SapApiClient {
  private timeoutMs = 8000;

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  }

  public async getJobRequisitions(): Promise<SapJobRequisition[]> {
    const config = getSapConfig();
    if (!config.isConfigured) return [];

    try {
      const token = await getSapAccessToken();
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const endpoint = `${config.baseUrl}/JobRequisition?$filter=status eq 'Open'&$select=jobReqId,title,jobDescription,location,department,annualSalary,lastModifiedDateTime&$format=json`;

      const response = await this.fetchWithTimeout(endpoint, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        console.warn(`[SAP Client] JobRequisition fetch failed with HTTP ${response.status}`);
        return [];
      }

      const data: SapODataResponse<SapJobRequisition> = await response.json();
      return data?.d?.results || [];
    } catch (err) {
      console.warn('[SAP Client] JobRequisition error (SAP unavailable or unconfigured):', err);
      return [];
    }
  }

  public async getCandidates(): Promise<SapCandidate[]> {
    const config = getSapConfig();
    if (!config.isConfigured) return [];

    try {
      const token = await getSapAccessToken();
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const endpoint = `${config.baseUrl}/Candidate?$format=json&$top=10`;

      const response = await this.fetchWithTimeout(endpoint, {
        method: 'GET',
        headers
      });

      if (!response.ok) return [];

      const data: SapODataResponse<SapCandidate> = await response.json();
      return data?.d?.results || [];
    } catch (err) {
      console.warn('[SAP Client] Candidate fetch notice:', err);
      return [];
    }
  }

  public async getSkills(): Promise<SapSpecialSkill[]> {
    const config = getSapConfig();
    if (!config.isConfigured) return [];

    try {
      const token = await getSapAccessToken();
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const endpoint = `${config.baseUrl}/Background_SpecialSkills?$format=json&$top=20`;

      const response = await this.fetchWithTimeout(endpoint, {
        method: 'GET',
        headers
      });

      if (!response.ok) return [];

      const data: SapODataResponse<SapSpecialSkill> = await response.json();
      return data?.d?.results || [];
    } catch (err) {
      console.warn('[SAP Client] SpecialSkills fetch notice:', err);
      return [];
    }
  }
}

export const sapApiClient = new SapApiClient();
