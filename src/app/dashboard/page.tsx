'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Code2,
  BookOpen,
  Terminal,
  Award,
  Library,
  User,
  Coins,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  Sparkles,
  Play
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // 1. Fetch user profile and stats
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      const userData = await userRes.json();
      if (!userData.authenticated) {
        router.push('/login');
        return;
      }
      setUser(userData.user);

      // 2. Fetch courses with user progress
      const coursesRes = await fetch('/api/courses');
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData.courses || []);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const enrolledCourses = courses.filter((c) => c.userProgress?.progress_percent > 0);
  const otherCourses = courses.filter((c) => !c.userProgress || c.userProgress.progress_percent === 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-cyan-400 text-xs font-semibold mb-2 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer Home Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.full_name || 'Engineer'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Keep expanding your systems knowledge. Solve practice problems, take certification exams, and build your career profile.
          </p>
        </div>

        {/* Quick Points Card */}
        <div className="flex items-center space-x-4 bg-slate-950/80 border border-amber-500/30 p-4 rounded-xl shadow-lg shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Points Balance
            </div>
            <div className="text-2xl font-black text-amber-400">
              {user?.points || 0} <span className="text-xs font-semibold text-slate-400">pts</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              150 pts unlocks any Library Book
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Topics Mastered</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {user?.stats?.completedTopics || 0}
          </div>
          <span className="text-[10px] text-slate-500">+50 pts per course</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Practice Solved</span>
            <Terminal className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {user?.stats?.solvedQuestions || 0}
          </div>
          <span className="text-[10px] text-slate-500">+4 pts per solve</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Certificates</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {user?.stats?.certificatesCount || 0}
          </div>
          <span className="text-[10px] text-slate-500">Passed (&gt;85%)</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Library Unlocks</span>
            <Library className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {user?.stats?.unlockedResources || 0}
          </div>
          <span className="text-[10px] text-slate-500">Permanent Access</span>
        </div>
      </div>

      {/* Main Grid: Enrolled Courses & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Learning In Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>Active Courses in Progress</span>
            </h2>
            <Link
              href="/courses"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-semibold"
            >
              <span>Explore All Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {courses.slice(0, 4).map((c) => {
              const percent = c.userProgress?.progress_percent || 0;
              const isCompleted = c.userProgress?.is_completed || false;
              return (
                <div
                  key={c.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 rounded-xl transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 text-[10px] font-mono font-semibold uppercase">
                          {c.difficulty}
                        </span>
                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed (+50 pts)</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{c.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{c.description}</p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <Link
                        href={`/courses/${c.id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        <span>{percent > 0 ? 'Resume' : 'Start'}</span>
                      </Link>

                      <Link
                        href={`/exam/${c.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium border border-amber-500/30 flex items-center space-x-1 transition-colors"
                        title="Take 2-Hour Certification Exam"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Exam</span>
                      </Link>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Course Progress</span>
                      <span className="font-mono text-cyan-400 font-semibold">{percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Career Readiness & Quick Actions */}
        <div className="space-y-6">
          {/* Career Profile Card */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Career Profile</h3>
                <p className="text-xs text-slate-400">Automated Developer Portfolio</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your profile is automatically enriched with your verified exam scores, completed courses, and project submissions.
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <Link
                href="/profile"
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-200 transition-colors"
              >
                <span>Edit Career Profile & Photos</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </Link>

              <Link
                href="/resume"
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-cyan-300 font-semibold hover:bg-blue-600/30 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Build ATS Resume (PDF)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </Link>
            </div>
          </div>

          {/* Quick Hub Links */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-white mb-2">Practice & Certification Hub</h3>

            <Link
              href="/practice"
              className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 text-slate-200 text-xs transition-colors"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <div className="flex-1">
                <div className="font-semibold text-white">Practice Question Bank</div>
                <div className="text-[11px] text-slate-400">4,000+ problems with 2 hints & compiler</div>
              </div>
              <span className="text-xs font-bold text-emerald-400">+4 pts</span>
            </Link>

            <Link
              href="/exam"
              className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 text-slate-200 text-xs transition-colors"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <div className="flex-1">
                <div className="font-semibold text-white">Certification Exams</div>
                <div className="text-[11px] text-slate-400">2-hour fullscreen proctored exams (&gt;85%)</div>
              </div>
              <span className="text-xs font-bold text-amber-400">+10 pts</span>
            </Link>

            <Link
              href="/library"
              className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 text-slate-200 text-xs transition-colors"
            >
              <Library className="w-4 h-4 text-purple-400" />
              <div className="flex-1">
                <div className="font-semibold text-white">Resource Library</div>
                <div className="text-[11px] text-slate-400">Unlock textbooks & notes with 150 points</div>
              </div>
              <span className="text-xs font-bold text-purple-400">150 pts</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
