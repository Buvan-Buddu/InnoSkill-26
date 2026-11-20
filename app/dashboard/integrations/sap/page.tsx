'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Briefcase, 
  ArrowLeft,
  Server,
  Lock,
  Database,
  ExternalLink,
  Layers,
  Activity
} from 'lucide-react';
import { SapStatusData } from '@/components/sap/SapStatusCard';
import PageHeader from '@/components/ui/PageHeader';
import SurfaceCard from '@/components/ui/SurfaceCard';
import StatusBadge from '@/components/ui/StatusBadge';

export default function SapIntegrationPage() {
  const [status, setStatus] = useState<SapStatusData>({
    isConfigured: false,
    isConnected: false,
    provider: 'SAP SuccessFactors HCM OData v2',
    jobCount: 0,
    message: 'Checking SAP endpoint status...'
  });
  const [loading, setLoading] = useState(true);

  const fetchStatus = () => {
    setLoading(true);
    fetch('/api/sap/status')
      .then((res) => res.json())
      .then((data) => {
        setStatus({
          isConfigured: Boolean(data.isConfigured),
          isConnected: Boolean(data.isConnected),
          provider: data.provider || 'SAP SuccessFactors HCM OData v2',
          baseUrl: data.baseUrl,
          jobCount: data.jobCount || 0,
          message: data.message || 'Status loaded'
        });
      })
      .catch(() => {
        setStatus({
          isConfigured: false,
          isConnected: false,
          provider: 'SAP SuccessFactors HCM OData v2',
          jobCount: 0,
          message: 'Failed to query SAP server endpoint.'
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between border-b border-[#DCE5F0] pb-4">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#718096] hover:text-[#2F6FED] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="button-secondary text-xs !py-1.5 !min-h-9"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2F6FED]' : ''}`} />
          <span>Re-verify Connection</span>
        </button>
      </div>

      <PageHeader
        eyebrow="Enterprise Architecture"
        title="SAP SuccessFactors Integration Hub"
        description="Detailed technical health, schema mapping specifications, and security tokens for real-time SAP enterprise synchronization."
        icon={Server}
      />

      {/* Main Status & Diagnostic Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SurfaceCard className="p-5 border border-[#DCE5F0] bg-white space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#718096] uppercase">Connection Status</span>
            <Activity className="w-4 h-4 text-[#2F6FED]" />
          </div>
          <p className="text-xl font-bold text-[#172033]">
            {status.isConnected ? 'Connected & Active' : 'Offline / Mock Mode'}
          </p>
          <StatusBadge tone={status.isConnected ? 'success' : 'warning'}>
            {status.isConnected ? 'Live Synced' : 'Simulated Endpoint'}
          </StatusBadge>
        </SurfaceCard>

        <SurfaceCard className="p-5 border border-[#DCE5F0] bg-white space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#718096] uppercase">Synced Requisitions</span>
            <Briefcase className="w-4 h-4 text-[#2F6FED]" />
          </div>
          <p className="text-xl font-bold text-[#172033]">
            {status.jobCount} Jobs
          </p>
          <span className="text-[11px] text-[#718096] block">OData v2 Requisition Feed</span>
        </SurfaceCard>

        <SurfaceCard className="p-5 border border-[#DCE5F0] bg-white space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#718096] uppercase">Security Standard</span>
            <Lock className="w-4 h-4 text-[#16A36A]" />
          </div>
          <p className="text-xl font-bold text-[#172033]">
            OAuth 2.0 / SAML
          </p>
          <span className="text-[11px] text-[#16A36A] font-semibold block">Encrypted In Transit</span>
        </SurfaceCard>
      </div>

      {/* Technical Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <SurfaceCard className="p-6 border border-[#DCE5F0] bg-white space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] border-b border-[#DCE5F0] pb-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#2F6FED]" /> Endpoint Specifications
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl space-y-1">
              <span className="font-bold text-[#718096]">Protocol:</span>
              <p className="font-bold text-[#172033]">{status.provider}</p>
            </div>

            <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl space-y-1">
              <span className="font-bold text-[#718096]">Base API Endpoint:</span>
              <p className="font-mono text-[#2F6FED] break-all">{status.baseUrl || 'https://api.successfactors.eu/odata/v2/JobRequisition'}</p>
            </div>

            <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl space-y-1">
              <span className="font-bold text-[#718096]">Diagnostic Message:</span>
              <p className="text-[#4B5870]">{status.message}</p>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6 border border-[#DCE5F0] bg-white space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] border-b border-[#DCE5F0] pb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2F6FED]" /> Data Synchronization Capabilities
          </h3>

          <div className="space-y-2.5 text-xs">
            {[
              { title: 'Job Requisition Ingestion', desc: 'Real-time pull of open job posts including workplace physical parameters.' },
              { title: 'Candidate Profile Mapping', desc: 'Bidirectional sync of verified accessibility accommodations into enterprise HRIS.' },
              { title: 'Applicant Tracking Status', desc: 'Automated webhook notifications for candidate interview stages and offers.' }
            ].map((cap, i) => (
              <div key={i} className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl space-y-1">
                <span className="font-bold text-[#172033] block">{cap.title}</span>
                <p className="text-[#4B5870]">{cap.desc}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>

      </div>

    </div>
  );
}
