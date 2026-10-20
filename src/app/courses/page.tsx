'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search, ArrowRight, CheckCircle2, Clock, Award, Coins, Layers, Cpu, Database, Terminal } from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredCourses = courses
    .map((c) => ({
      ...c,
      matchedTopics: normalizedSearch
        ? (c.topics || []).filter((t: any) => t.title.toLowerCase().includes(normalizedSearch))
        : [],
    }))
    .filter((c) =>
      !normalizedSearch ||
      c.title.toLowerCase().includes(normalizedSearch) ||
      c.description.toLowerCase().includes(normalizedSearch) ||
      c.matchedTopics.length > 0
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold font-mono">
            Structured Learning Paths
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1 tracking-tight">
            Comprehensive Course Tracks
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Each topic contains simplified English explanations, visual logic flowcharts, at least 2 real code examples, and coding assignments. Completing any course awards <strong>+50 points</strong>!
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search track or lesson topic..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((c) => {
            const percent = c.userProgress?.progress_percent || 0;
            const isCompleted = c.userProgress?.is_completed || false;
            return (
              <div
                key={c.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 text-[10px] font-mono font-semibold uppercase">
                      {c.difficulty}
                    </span>
                    <span className="flex items-center space-x-1 text-slate-400 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{c.estimated_hours} hrs</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {c.description}
                  </p>

                  {c.matchedTopics.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Matching lessons</span>
                      {c.matchedTopics.slice(0, 3).map((t: any) => (
                        <Link
                          key={t.id}
                          href={`/courses/${c.id}/${t.id}`}
                          className="block text-xs text-slate-300 hover:text-cyan-300 bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5"
                        >
                          {t.title}
                        </Link>
                      ))}
                      {c.matchedTopics.length > 3 && (
                        <span className="block text-[11px] text-slate-500">+{c.matchedTopics.length - 3} more in syllabus</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-xs text-slate-400 my-4 pt-3 border-t border-slate-800/80">
                    <span className="flex items-center space-x-1">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{c.topic_count} Topics</span>
                    </span>
                    <span className="flex items-center space-x-1 text-amber-400 font-semibold">
                      <Coins className="w-3.5 h-3.5" />
                      <span>+50 pts Reward</span>
                    </span>
                  </div>

                  {percent > 0 && (
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Progress</span>
                        <span className="font-mono text-cyan-400 font-semibold">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
                  <Link
                    href={`/courses/${c.id}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center space-x-1 transition-colors"
                  >
                    <span>{percent > 0 ? 'Resume Lessons' : 'View Syllabus'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {c.exam_available ? (
                    <Link
                      href={`/exam/${c.id}`}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium text-xs border border-amber-500/30 flex items-center space-x-1 transition-colors"
                      title="2-Hour Certification Exam"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Exam</span>
                    </Link>
                  ) : (
                    <span
                      className="py-2 px-3 rounded-xl bg-slate-900 text-slate-500 font-medium text-xs border border-slate-800 flex items-center space-x-1"
                      title={c.exam_unavailable_reason || (c.exam_supported === false
                        ? 'No deterministic sandbox grader is integrated for this track'
                        : 'This track does not yet have 25 eligible tested exam questions')}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>No exam yet</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
