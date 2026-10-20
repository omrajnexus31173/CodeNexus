'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, ArrowRight, Mail, RefreshCw, ArrowLeft } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'already_verified'>('verifying');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token in the URL. Please check the link from your email.');
      return;
    }
    verifyEmailToken();
  }, [token]);

  const verifyEmailToken = async () => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Email successfully verified!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Invalid or expired verification token.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage('Network connection error: ' + err.message);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResendStatus('loading');
    setResendMessage('');

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        setResendStatus('success');
        setResendMessage(data.message || 'Verification link dispatched if account exists.');
      } else {
        setResendStatus('error');
        setResendMessage(data.error || 'Failed to resend verification email.');
      }
    } catch (err: any) {
      setResendStatus('error');
      setResendMessage(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {status === 'verifying' && (
        <div className="space-y-4 py-6">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-xl font-bold text-white">Verifying Security Token...</h2>
          <p className="text-xs text-slate-400">Authenticating single-use verification hash with Code Nexus.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-4 animate-in fade-in">
          <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Email Address Verified!</h2>
          <p className="text-xs text-slate-300 leading-relaxed">{message}</p>

          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-md transition-all"
            >
              <span>Sign In to Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-5 animate-in fade-in text-left">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h2 className="text-xl font-bold text-white mt-2">Verification Failed</h2>
            <p className="text-xs text-rose-300 mt-1">{message}</p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-slate-300 block">
              Need a new verification link?
            </span>
            <form onSubmit={handleResend} className="space-y-2.5">
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {resendStatus === 'error' && (
                <p className="text-[11px] text-rose-400">{resendMessage}</p>
              )}
              {resendStatus === 'success' && (
                <p className="text-[11px] text-emerald-400">{resendMessage}</p>
              )}

              <button
                type="submit"
                disabled={resendStatus === 'loading'}
                className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendStatus === 'loading' ? 'animate-spin' : ''}`} />
                <span>{resendStatus === 'loading' ? 'Sending...' : 'Resend Verification Link'}</span>
              </button>
            </form>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-cyan-400"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        <Suspense fallback={<div className="text-xs text-slate-400 py-6">Loading verification...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
