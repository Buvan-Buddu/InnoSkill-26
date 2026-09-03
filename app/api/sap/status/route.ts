import { NextResponse } from 'next/server';
import { getSapConfig } from '@/services/sap/config';
import { getSapJobs } from '@/services/sap/services/sapJobService';
import { SapStatusResponse } from '@/services/sap/types';

export async function GET() {
  const config = getSapConfig();

  if (!config.isConfigured) {
    const response: SapStatusResponse = {
      isConfigured: false,
      isConnected: false,
      provider: 'SAP SuccessFactors HCM OData v2',
      message: 'SAP integration is unconfigured. Set SAP_BASE_URL, SAP_CLIENT_ID, and SAP_CLIENT_SECRET in environment variables to enable real SAP SuccessFactors data synchronization.',
      jobCount: 0
    };
    return NextResponse.json(response);
  }

  const { jobs } = await getSapJobs();

  const response: SapStatusResponse = {
    isConfigured: true,
    isConnected: true,
    provider: 'SAP SuccessFactors HCM OData v2',
    baseUrl: config.baseUrl,
    lastSyncTime: new Date().toISOString(),
    jobCount: jobs.length,
    message: `Connected to SAP SuccessFactors HCM Suite. Synchronized ${jobs.length} open job requisition(s).`
  };

  return NextResponse.json(response);
}
