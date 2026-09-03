import { NextResponse } from 'next/server';
import { getSapJobs } from '@/services/sap/services/sapJobService';

export async function GET() {
  try {
    const { jobs, isConfigured, source } = await getSapJobs();
    return NextResponse.json({
      success: true,
      count: jobs.length,
      isConfigured,
      source,
      jobs
    });
  } catch (error) {
    console.error('[API /api/sap/jobs] Error fetching SAP jobs:', error);
    return NextResponse.json({
      success: false,
      count: 0,
      isConfigured: false,
      source: 'SAP SuccessFactors (Error)',
      jobs: [],
      error: 'Failed to retrieve SAP job requisitions.'
    }, { status: 500 });
  }
}
