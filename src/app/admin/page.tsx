'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  Terminal,
  Award,
  Coins,
  Library,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Sliders,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [recentLedger, setRecentLedger] = useState<any[]>([]);
  const [popularCourses, setPopularCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Active Tab
  const [tab, setTab] = useState<'overview' | 'users' | 'ledger'>('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const statsRes = await fetch('/api/admin/stats');
      if (!statsRes.ok) {
        if (statsRes.status === 403) {
          setErrorMsg('Access denied: Administrator privileges are required to view this dashboard.');
          return;
        }
        throw new Error('Failed to fetch admin stats');
      }

      const statsData = await statsRes.json();
      setStats(statsData.stats);
      setPopularCourses(statsData.popularCourses || []);
      setRecentLedger(statsData.recentLedger || []);

      const usersRes = await fetch('/api/admin/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400 leading-relaxed">{errorMsg}</p>
        <Link
          href="/dashboard"
          className="inline-flex px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-rose-400 font-semibold font-mono flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Control Console</span>
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1 tracking-tight">
            Code Nexus Platform Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            System administration, user role controls, auditable points ledgers, and question bank analytics.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              tab === 'overview' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Platform Overview
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              tab === 'users' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Users & Roles ({users.length})
          </button>
          <button
            onClick={() => setTab('ledger')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              tab === 'ledger' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Points Ledger
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-8 animate-in fade-in">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Total Users</span>
              <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
              <span className="text-[10px] text-cyan-400">Enrolled coders</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Question Bank</span>
              <div className="text-2xl font-bold text-white">{stats?.totalQuestions || 0}</div>
              <span className="text-[10px] text-blue-400">Algorithmic problems</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Solved Submissions</span>
              <div className="text-2xl font-bold text-white">{stats?.totalSolved || 0}</div>
              <span className="text-[10px] text-emerald-400">4 pts awarded each</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Certificates</span>
              <div className="text-2xl font-bold text-white">{stats?.totalCertificates || 0}</div>
              <span className="text-[10px] text-amber-400">Score &gt;85% verified</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Circulating Points</span>
              <div className="text-2xl font-bold text-white">{stats?.totalPoints || 0}</div>
              <span className="text-[10px] text-purple-400">User balances</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Library Unlocks</span>
              <div className="text-2xl font-bold text-white">{stats?.totalUnlockedResources || 0}</div>
              <span className="text-[10px] text-indigo-400">150 pts redeemed</span>
            </div>
          </div>

          {/* Popular Courses Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-xs">
              Top Enrolled Courses
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-800 pb-2">
                  <tr>
                    <th className="py-2 px-3">Course Identifier</th>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3 text-right">Active Enrollments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {popularCourses.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 px-3 text-cyan-400">{c.id}</td>
                      <td className="py-3 px-3 text-white font-sans font-semibold">{c.title}</td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-bold">{c.enrollment_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & ROLES */}
      {tab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4">Questions Solved</th>
                  <th className="py-3 px-4">Certificates</th>
                  <th className="py-3 px-4 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{u.full_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-blue-500/20 text-cyan-300 border border-blue-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-400 font-semibold text-[11px]">
                        {u.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {u.points} pts
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {u.questions_solved}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {u.certificates_count}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDITABLE POINTS LEDGER */}
      {tab === 'ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl animate-in fade-in">
          <div className="p-4 bg-slate-950 border-b border-slate-800 text-xs text-slate-400">
            Immutable transaction log of every point earned, deducted for hints, or redeemed for library unlocks.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Delta Amount</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Balance After</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {recentLedger.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 px-4 text-slate-500">#{row.id}</td>
                    <td className="py-3 px-4 text-slate-300">User {row.user_id}</td>
                    <td className="py-3 px-4 font-bold">
                      <span className={row.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {row.amount >= 0 ? `+${row.amount}` : row.amount} pts
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-200">
                      {row.reason}
                    </td>
                    <td className="py-3 px-4 text-cyan-400 text-[11px]">
                      {row.reference_type}: {row.reference_id}
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-400">
                      {row.balance_after} pts
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 text-[11px]">
                      {new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
