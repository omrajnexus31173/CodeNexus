'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Coins,
  ArrowRight,
  Maximize2
} from 'lucide-react';

export default function ExamCatalogPage() {
  const [courses, setCourses] = useState<any[]>([]);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
          <Award className="w-3.5 h-3.5" />
          <span>Official Proctored Certification Arena</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Code Nexus Examination Hall
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Prove your technical mastery. Each examination delivers a randomized question pool under strict full-screen exam conditions. Score <strong>strictly more than 85%</strong> to earn your verified credential and <strong>+10 points</strong>.
        </p>
      </div>

      {/* Examination Regulations Protocol */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl max-w-4xl mx-auto space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Code Nexus Examination Protocol & Passing Rules</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
          <div className="flex items-start space-x-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
            <Clock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">2-Hour Timed Session</span>
              <p className="text-slate-400 mt-0.5">Exactly 120 minutes. Automatic submission occurs if the timer expires.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
            <Maximize2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Mandatory Full-Screen Mode</span>
              <p className="text-slate-400 mt-0.5">Exiting full-screen or switching tabs generates security violations. Multiple violations void the session.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">&gt; 85% Passing Threshold</span>
              <p className="text-slate-400 mt-0.5">You must score strictly above 85% (e.g. 86%+) to receive the official certificate and +10 points.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
            <Coins className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Randomized Questions Each Time</span>
              <p className="text-slate-400 mt-0.5">Every attempt draws a unique, randomized question set across all course units.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Exams Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Select Your Examination Track</h2>

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-mono font-semibold uppercase border border-amber-500/20">
                      {course.exam_available
                        ? 'Exam Available'
                        : course.exam_supported === false
                        ? 'No Graded Exam'
                        : 'Exam Pool Not Ready'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>2 Hours</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="my-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-amber-400 font-semibold flex items-center space-x-1">
                      <Coins className="w-3.5 h-3.5" />
                      <span>+10 pts on Passing (&gt;85%)</span>
                    </span>
                    <span className="text-slate-500">25 Questions</span>
                  </div>
                </div>

                {course.exam_available ? (
                  <Link
                    href={`/exam/${course.id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <Award className="w-4 h-4" />
                    <span>Enter Examination Room</span>
                  </Link>
                ) : (
                  <div className="w-full py-2.5 px-4 rounded-xl bg-slate-800 text-slate-400 font-semibold text-xs text-center border border-slate-700">
                    {course.exam_unavailable_reason ||
                      (course.exam_supported === false
                        ? 'No deterministic sandbox grader is integrated for this track'
                        : `Needs 25 eligible tested questions (currently ${course.exam_question_count ?? 0})`)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
