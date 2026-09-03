'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Briefcase, 
  Compass, 
  Sparkles, 
  UserCheck, 
  FileText, 
  Mic, 
  ArrowLeft,
  Server,
  Lock,
  Database,
  ExternalLink
} from 'lucide-react';
import { SapStatusData } from '@/components/sap/SapStatusCard';

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
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Re-verify Connection</span>
          </button>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Server className="w-3.5 h-3.5" />
          <span>Enterprise Integration Diagnostic Center</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          SAP SuccessFactors HCM Integration
        </h2>
        <p className="text-sm text-slate-300 font-medium max-w-2xl">
          Detailed technical status, API breakdown, data mapping specification, and security parameters for real-time SAP enterprise synchronization.
        </p>
      </div>

      {/* Live Status Summary Card */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target SAP Software</span>
            <h3 className="text-xl font-black text-white">{status.provider}</h3>
            <p className="text-xs text-slate-400 font-medium">Protocol: OData v2 over HTTPS (RESTful JSON)</p>
          </div>

          <div className="shrink-0">
            {loading ? (
              <span className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-black border border-slate-700 inline-flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                Verifying...
              </span>
            ) : status.isConnected ? (
              <span className="px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 text-xs font-black border border-emerald-500/30 inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                ● Connected (Verified)
              </span>
            ) : !status.isConfigured ? (
              <span className="px-4 py-2 rounded-xl bg-amber-500/15 text-amber-400 text-xs font-black border border-amber-500/30 inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                ● Not Configured
              </span>
            ) : (
              <span className="px-4 py-2 rounded-xl bg-red-500/15 text-red-400 text-xs font-black border border-red-500/30 inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                ● Temporarily Unavailable
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Server Endpoint</span>
            <p className="font-extrabold text-slate-200 truncate">{status.baseUrl || 'https://api.successfactors.com/odata/v2'}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Synchronized Requisitions</span>
            <p className="font-extrabold text-emerald-400">{status.jobCount} Requisitions Active</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Authentication Engine</span>
            <p className="font-extrabold text-cyan-300">OAuth 2.0 Client Credentials</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium">
          <span className="font-bold text-white block mb-0.5">Status Message:</span>
          {status.message}
        </div>
      </div>

      {/* APIs Integrated Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" /> Documented SAP OData APIs Integrated
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-white text-sm">JobRequisition</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">GET</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Queries open position requisitions, department codes, job titles, descriptions, and salary ranges from SAP SuccessFactors Recruiting.
            </p>
            <p className="font-mono text-[10px] text-slate-500 bg-slate-950 p-2 rounded-lg truncate">
              /odata/v2/JobRequisition
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-white text-sm">Candidate</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">GET</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Synchronizes applicant information and candidate profiles between SAP Recruiting and OpenAbility profile structures.
            </p>
            <p className="font-mono text-[10px] text-slate-500 bg-slate-950 p-2 rounded-lg truncate">
              /odata/v2/Candidate
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-white text-sm">Background_SpecialSkills</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">GET</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Retrieves enterprise skill frameworks and competency records from SAP Employee Central for AI skill gap analysis.
            </p>
            <p className="font-mono text-[10px] text-slate-500 bg-slate-950 p-2 rounded-lg truncate">
              /odata/v2/Background_SpecialSkills
            </p>
          </div>
        </div>
      </div>

      {/* Feature Usage Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-white">How OpenAbility Features Use SAP Data</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-white text-sm">1. Jobs Board (/dashboard/jobs)</h4>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Enterprise Jobs Feed</span>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Consumes real SAP <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">JobRequisition</code> OData endpoints. Each SAP position displays a distinct <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">SAP SuccessFactors OData</code> badge and dynamically calculates accessibility readiness ratings.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-white text-sm">2. Career & Skills (/dashboard/skills)</h4>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Enterprise Competency Gaps</span>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Maps SAP candidate skill records and job requirements into the OpenAbility skill matching matrix to identify exact technical gaps for career progression.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-white text-sm">3. AI Career Matching (services/ai/)</h4>
                <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Grounded AI Guidance</span>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed">
              OpenAbility AI Career Agent grounds recommendations directly on verified SAP requisition data. Zero hallucinated jobs or fake salary figures.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-white text-sm">4. Candidate Profile (/dashboard/profile)</h4>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Candidate Sync</span>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Synchronizes applicant details, professional bios, and accessibility accommodation preferences with SAP HCM Candidate records.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-white text-sm">5. Resume Intelligence (/dashboard/resume)</h4>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Real Resume Alignment</span>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Preserves real structured resume parsing (Ollama / PDF parsing) and evaluates candidate resume sections against SAP Enterprise position requirements.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-white text-sm">6. Global Voice Assistant</h4>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Multilingual Commands</span>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Supports hands-free English and Hindi voice triggers such as <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">&ldquo;SAP jobs dikhao&rdquo;</code> or <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">&ldquo;Show SAP jobs&rdquo;</code>.
            </p>
          </div>

        </div>
      </div>

      {/* Security Architecture Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
          <Lock className="w-4 h-4" />
          <span>Server-Side Security & Token Protection</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          All SAP authentication operations occur on Next.js server-side API routes (<code className="text-emerald-300 bg-slate-950 px-1.5 py-0.5 rounded">services/sap/auth.ts</code>). Client secrets (<code className="text-slate-400 font-mono">SAP_CLIENT_SECRET</code>) and OAuth bearer tokens are never transmitted to or stored inside the browser, localStorage, or frontend state.
        </p>
      </div>

    </div>
  );
}
