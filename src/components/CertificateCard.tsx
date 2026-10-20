'use client';

import React, { useRef } from 'react';
import { Award, ShieldCheck, Download, Share2, CheckCircle2, ExternalLink } from 'lucide-react';

interface CertificateProps {
  id: string;
  recipient_name: string;
  course_title: string;
  score_percent: number | string;
  issue_date: string;
  is_valid?: boolean;
  qr_code_data?: string;
  onDownload?: () => void;
}

export default function CertificateCard({
  id,
  recipient_name,
  course_title,
  score_percent,
  issue_date,
  is_valid = true,
  qr_code_data,
}: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const formattedDate = new Date(issue_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Visual Certificate Paper */}
      <div
        ref={certRef}
        className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-4 border-amber-500/40 rounded-2xl p-8 sm:p-12 shadow-2xl text-center overflow-hidden max-w-3xl mx-auto print:border-slate-900 print:text-black print:bg-white"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(30, 58, 138, 0.15) 0%, transparent 80%)',
        }}
      >
        {/* Ornate Corner Accents */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400"></div>
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400"></div>
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400"></div>
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400"></div>

        {/* Certificate Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-3">
            <Award className="w-9 h-9 text-slate-950" />
          </div>
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-amber-400">
            Code Nexus Global Technical Academy
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            Certificate of Mastery
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent my-2"></div>
        </div>

        {/* Body Text */}
        <p className="text-xs sm:text-sm text-slate-400 font-serif italic mb-2">
          This is proudly presented to certify that
        </p>

        <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-300 via-white to-blue-200 bg-clip-text text-transparent my-3 tracking-wide">
          {recipient_name}
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed mb-4">
          has successfully demonstrated comprehensive technical competence and rigorous examination mastery in
        </p>

        <div className="inline-block px-5 py-2 rounded-xl bg-blue-950/60 border border-blue-500/40 text-cyan-300 font-bold text-base sm:text-xl my-2 shadow-sm">
          {course_title}
        </div>

        {/* Score & Validation */}
        <div className="my-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-semibold">Score Achieved: {score_percent}% (Passed &gt; 85%)</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/60 border border-slate-700/40 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Cryptographically Verified</span>
          </div>
        </div>

        {/* Signatures & Metadata Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="text-left">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Date of Issue</p>
            <p className="font-medium text-slate-200">{formattedDate}</p>
          </div>

          <div className="text-center">
            <div className="w-32 h-0.5 bg-slate-600 mb-1 mx-auto"></div>
            <p className="font-serif italic text-amber-300 text-xs">Dennis Ritchie Board</p>
            <p className="text-[10px] text-slate-500">Academic Certification Authority</p>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Certificate ID</p>
            <p className="font-mono text-cyan-400 font-semibold">{id}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>

        <a
          href={`/verify-certificate?id=${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs border border-slate-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-cyan-400" />
          <span>Public Verification Page</span>
        </a>
      </div>
    </div>
  );
}
