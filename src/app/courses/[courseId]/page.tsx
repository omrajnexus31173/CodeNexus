'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Award,
  Coins,
  ArrowRight,
  Play,
  ArrowLeft,
  Sparkles,
  FileCode2
} from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setCourseData(data);
      } else {
        router.push('/courses');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !courseData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { course, units, percentCompleted, totalTopics, completedCount } = courseData;

  // Find first uncompleted topic or first topic to resume
  let firstUncompletedTopic = null;
  for (const u of units) {
    for (const t of u.topics) {
      if (!t.completed) {
        firstUncompletedTopic = t;
        break;
      }
    }
    if (firstUncompletedTopic) break;
  }
  const targetTopicId = firstUncompletedTopic ? firstUncompletedTopic.id : units[0]?.topics[0]?.id;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        href="/courses"
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Courses</span>
      </Link>

      {/* Course Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 text-[10px] font-mono font-semibold uppercase">
                {course.difficulty}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-semibold flex items-center space-x-1 border border-amber-500/20">
                <Coins className="w-3 h-3 text-amber-400" />
                <span>+50 Pts on Completion</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px] font-semibold flex items-center space-x-1 border border-indigo-500/20">
                <Award className="w-3 h-3 text-indigo-400" />
                <span>+10 Pts on Exam Pass</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {course.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {course.description}
            </p>

            <div className="flex items-center space-x-6 text-xs text-slate-400 pt-1">
              <span className="flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>{totalTopics} Comprehensive Topics</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>~{course.estimated_hours} Hours</span>
              </span>
              <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{completedCount} / {totalTopics} Completed</span>
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {targetTopicId && (
              <Link
                href={`/courses/${course.id}/${targetTopicId}`}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Play className="w-4 h-4" />
                <span>{completedCount > 0 ? 'Resume Learning' : 'Start Course'}</span>
              </Link>
            )}

            <Link
              href={`/exam/${course.id}`}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs flex items-center justify-center space-x-2 border border-amber-500/30 transition-colors"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Take Certification Exam</span>
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Overall Course Progress</span>
            <span className="font-mono text-cyan-400 font-bold">{percentCompleted}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
              style={{ width: `${percentCompleted}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Syllabus Units and Topics Accordion */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <FileCode2 className="w-5 h-5 text-cyan-400" />
          <span>Course Syllabus & Topic Breakdown</span>
        </h2>

        <div className="space-y-6">
          {units.map((unit: any, idx: number) => (
            <div
              key={unit.id}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono font-semibold">
                    Unit {idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-white">{unit.title}</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {unit.topics.length} {unit.topics.length === 1 ? 'topic' : 'topics'}
                </span>
              </div>

              {/* Topics List */}
              <div className="divide-y divide-slate-800/60">
                {unit.topics.map((topic: any) => (
                  <Link
                    key={topic.id}
                    href={`/courses/${course.id}/${topic.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-850/60 hover:bg-slate-800/40 transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      {topic.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5 group-hover:text-cyan-400 transition-colors" />
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                          {topic.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          {topic.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium shrink-0 ml-4">
                      <span className="hidden sm:inline-block text-[11px] text-slate-400">
                        2 Examples + Flowchart
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
