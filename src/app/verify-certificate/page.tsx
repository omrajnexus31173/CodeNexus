'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import CertificateCard from '@/components/CertificateCard';

function CertificateVerifyContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || 'CN-CERT-2026-9A82-C104';

  const [certId, setCertId] = useState(initialId);
  const [certData, setCertData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialId) {
      handleLookup(initialId);
    }
  }, [initialId]);

  const handleLookup = async (lookupId?: string) => {
    const idToSearch = (lookupId || certId).trim();
    if (!idToSearch) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/certificates/${idToSearch}`);
      if (res.ok) {
        const data = await res.json();
        setCertData(data.certificate);
      } else {
        setCertData(null);
        setErrorMsg(`Certificate with ID "${idToSearch}" was not found or is no longer valid.`);
      }
    } catch (err: any) {
      setErrorMsg('Failed to verify certificate: ' + err.message);
      setCertData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Input Box */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl max-w-xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="flex items-center space-x-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="e.g. CN-CERT-2026-9A82-C104"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs transition-colors shrink-0 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>

      {/* Verification Result */}
      {certData && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>
                <strong>Verified Authentic:</strong> Issued to <strong>{certData.recipient_name}</strong> for {certData.course_title}.
              </span>
            </div>
            <span className="font-mono text-[11px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-bold">
              Score: {certData.score_percent}%
            </span>
          </div>

          <CertificateCard
            id={certData.id}
            recipient_name={certData.recipient_name}
            course_title={certData.course_title}
            score_percent={certData.score_percent}
            issue_date={certData.issue_date}
            is_valid={certData.is_valid}
            qr_code_data={certData.qr_code_data}
          />
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

export default function CertificateVerificationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Official Verification Registry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Verify Code Nexus Credentials
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Verify the authenticity, examination score, and validity of credentials issued by the Code Nexus Global Technical Academy.
        </p>
      </div>

      <Suspense fallback={<div className="text-center text-xs text-slate-400">Loading verification tool...</div>}>
        <CertificateVerifyContent />
      </Suspense>
    </div>
  );
}
