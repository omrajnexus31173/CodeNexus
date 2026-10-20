'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Code2, User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resendMsg, setResendMsg] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setRegisteredEmail(data.user?.email || email);
      } else {
        setErrorMsg(data.error || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMsg('Network connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setResendStatus('loading');
    setResendMsg('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus('success');
        setResendMsg(data.message || 'Verification link re-sent!');
      } else {
        setResendStatus('error');
        setResendMsg(data.error || 'Failed to resend verification email.');
      }
    } catch (err: any) {
      setResendStatus('error');
      setResendMsg(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-cyan-500/20">
            <Code2 className="w-6 h-6 text-cyan-200" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Code Nexus Account</h1>
          <p className="text-xs text-slate-400">
            Join thousands of developers mastering C, C++, Python, SQL, Java & Systems.
          </p>
        </div>

        {registeredEmail ? (
          <div className="bg-slate-950 p-6 rounded-xl border border-cyan-500/30 text-center space-y-4 animate-in fade-in">
            <CheckCircle2 className="w-12 h-12 text-cyan-400 mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-white">Check Your Email</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                We've sent a secure verification link to <strong>{registeredEmail}</strong>.
              </p>
            </div>

            <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/20 rounded-lg text-slate-300 text-xs text-left space-y-1.5">
              <div className="font-semibold text-cyan-300 flex items-center space-x-1.5">
                <span>Account Created (Unverified)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                To activate your account and access courses, practice sandboxes, and exams, please click the link in your email.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/login"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-cyan-500/20"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendStatus === 'loading'}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors border border-slate-800"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendStatus === 'loading' ? 'animate-spin' : ''}`} />
                <span>{resendStatus === 'loading' ? 'Resending...' : 'Resend Verification Email'}</span>
              </button>
              {resendMsg && (
                <p className={`text-[10px] ${resendStatus === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {resendMsg}
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ada Lovelace"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="developer@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Password (min 8 chars)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <span>{loading ? 'Registering Account...' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
              Already have an account?{' '}
              <Link href="/login" className="text-cyan-400 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
