'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ChevronRight, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-extrabold border border-slate-700">
          <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
          <span>Verifying Connection...</span>
        </span>
      );
    }

    if (status.isConnected) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-extrabold border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          <span>● Connected</span>
        </span>
      );
    }

    if (!status.isConfigured) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-extrabold border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
          <span>● Not Configured</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-extrabold border border-red-500/30">
        <span className="w-2 h-2 rounded-full bg-red-400" aria-hidden="true" />
        <span>● Temporarily Unavailable</span>
      </span>
    );
  };

  return (
    <div className="bg-slate-900 border-2 border-slate-800 hover:border-emerald-500/30 rounded-2xl p-6 space-y-5 shadow-xl transition-all">
      
      {/* Card Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm text-white tracking-tight">SAP Enterprise Integration</h3>
            <p className="text-[11px] text-slate-400 font-medium">Real-Time OData v2 Integration</p>
          </div>
        </div>

        <div>{getStatusBadge()}</div>
      </div>

      {/* Product Details & Status */}
      <div className="space-y-3 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SAP Product</span>
          <p className="font-extrabold text-slate-200">{status.provider}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Connection Status</span>
          <p className="text-slate-300 font-medium leading-relaxed">{status.message}</p>
        </div>
      </div>

      {/* Used by OpenAbility */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Used by OpenAbility</span>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {[
            'Jobs Board',
            'Career & Skills',
            'AI Career Matching',
            'Profile Sync',
            'Resume Intelligence',
            'Voice Assistant'
          ].map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action link */}
      <div className="pt-2">
        <Link
          href="/dashboard/integrations/sap"
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <span>View Integration Details</span>
          <ChevronRight className="w-4 h-4 text-emerald-400" />
        </Link>
      </div>

    </div>
  );
}
