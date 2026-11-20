'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ChevronRight, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';

export interface SapStatusData {
  isConfigured: boolean;
  isConnected: boolean;
  provider: string;
  baseUrl?: string;
  jobCount?: number;
  message: string;
}

export function SapStatusCard() {
  const [status, setStatus] = useState<SapStatusData>({
    isConfigured: false,
    isConnected: false,
    provider: 'SAP SuccessFactors HCM OData v2',
    jobCount: 0,
    message: 'Checking SAP connection...'
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
          message: 'Unable to reach SAP status endpoint.'
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getStatusBadge = () => {
    if (loading) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5FA] text-[#4B5870] text-xs font-bold border border-[#DCE5F0]">
          <RefreshCw className="w-3 h-3 animate-spin text-[#2F6FED]" />
          <span>Verifying Sync...</span>
        </span>
      );
    }

    if (status.isConnected) {
      return <StatusBadge tone="success">Connected & Active</StatusBadge>;
    }

    if (!status.isConfigured) {
      return <StatusBadge tone="warning">Configuration Pending</StatusBadge>;
    }

    return <StatusBadge tone="danger">Temporarily Offline</StatusBadge>;
  };

  return (
    <div className="surface-card p-6 space-y-5 transition-all hover:border-[#C8D5E5]">
      
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE5F0] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#EAF2FF] border border-[#C8D5E5] flex items-center justify-center text-[#2F6FED]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-[#172033]">SAP SuccessFactors Integration</h3>
              <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EAF2FF] text-[#2F6FED] border border-[#DCE5F0]">
                OData v2
              </span>
            </div>
            <p className="text-xs text-[#718096]">
              Real-time enterprise job requisitions and candidate accessibility accommodation sync.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {getStatusBadge()}
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-1.5 rounded-xl border border-[#DCE5F0] bg-white hover:bg-[#F4F8FF] text-[#718096] hover:text-[#2F6FED] transition cursor-pointer"
            title="Refresh status"
            aria-label="Refresh SAP connection status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2F6FED]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Info Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
        <div className="bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl p-3.5">
          <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">Connected Protocol</span>
          <span className="font-bold text-[#172033] mt-1 block truncate">
            {status.provider}
          </span>
        </div>

        <div className="bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl p-3.5">
          <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">Synced Job Openings</span>
          <span className="font-bold text-[#172033] mt-1 block">
            {status.jobCount} Active Requisitions
          </span>
        </div>

        <div className="bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl p-3.5">
          <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">Security Protocol</span>
          <span className="font-bold text-[#16A36A] mt-1 block">
            OAuth 2.0 / SAML Bearer
          </span>
        </div>
      </div>

      {/* Footer Navigation Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
        <p className="text-[#718096] font-medium">
          {status.message}
        </p>
        
        <Link
          href="/dashboard/integrations/sap"
          className="inline-flex items-center gap-1.5 font-bold text-[#2F6FED] hover:text-[#245ED0] transition-colors"
        >
          <span>Open Enterprise Integration Diagnostics</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
