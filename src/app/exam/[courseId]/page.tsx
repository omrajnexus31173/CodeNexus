'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Award,
  Clock,
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Coins,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Send,
  RotateCcw
} from 'lucide-react';
import CertificateCard from '@/components/CertificateCard';

export default function ExamRoomPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  // Pre-exam / Active / Result States
  const [examState, setExamState] = useState<'intro' | 'active' | 'result'>('intro');
  const [course, setCourse] = useState<any>(null);
  const [examSessionId, setExamSessionId] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Timer & Security Tracking
  const [secondsRemaining, setSecondsRemaining] = useState(7200); // 2 hours
  const [violationsCount, setViolationsCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Submitting & Results
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchExamPrep();
  }, [courseId]);

  const fetchExamPrep = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data.course);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fullscreen and Tab Switch Listener during active exam
  useEffect(() => {
    if (examState !== 'active') return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleViolation('Full-screen mode was exited.');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('Browser tab was switched or minimized.');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [examState, violationsCount]);

  // Timer Tick
  useEffect(() => {
    if (examState !== 'active') return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examState]);

  const handleViolation = (reason: string) => {
    const newCount = violationsCount + 1;
    setViolationsCount(newCount);
    setShowViolationModal(true);

    if (newCount >= 3) {
      // Auto-terminate exam on 3rd violation
      setTimeout(() => {
        handleSubmitExam(true);
      }, 1500);
    }
  };

  const handleBeginExam = async () => {
    try {
      // Request Fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }

      // Initialize exam session with randomized questions
      const res = await fetch('/api/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId, question_count: 25 }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Failed to start exam');
      }

      setExamSessionId(data.sessionId || '');
      setQuestions(data.questions || []);
      setSecondsRemaining(data.durationSeconds || 7200);
      setExamState('active');
      setIsFullscreen(true);
    } catch (err: any) {
      alert('Error initiating examination session: ' + err.message);
    }
  };

  const handleAnswerChange = (text: string) => {
    const qId = questions[currentQIndex]?.id;
    if (!qId) return;
    setAnswers((prev) => ({
      ...prev,
      [qId]: text,
    }));
  };

  const handleSubmitExam = async (isAutoSubmit = false) => {
    if (!isAutoSubmit && !confirm('Are you sure you want to finish and submit your examination?')) {
      return;
    }

    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      // Exit fullscreen safely
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }

      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          session_id: examSessionId,
          answers,
          duration_seconds: 7200 - secondsRemaining,
          violations_count: violationsCount,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit exam');
      }
      setExamResult(data);
      setExamState('result');
    } catch (err: any) {
      alert('Error submitting examination: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- VIEW 1: INTRO / PRE-EXAM INSTRUCTIONS ---
  if (examState === 'intro') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <Link
          href="/exam"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Exam Hall</span>
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-amber-500/20">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-amber-400 font-mono font-bold">
              Official Certification Examination
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {course?.title || 'Programming Track Examination'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              You are about to enter the proctored examination room for 25 coding questions. Submitted code is executed in the isolated sandbox against each question's test cases; length alone earns no marks. Please review the rules before launching full-screen mode.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 text-slate-300">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
              <span><strong>Duration:</strong> 2 Hours (120 Mins)</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Coins className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Reward:</strong> +10 Points on passing</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Passing Grade:</strong> &gt; 85% Score Required</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span><strong>Violations:</strong> Tab switch & full-screen exit monitored</span>
            </div>
          </div>

          {course && course.exam_available === false ? (
            <div
              role="status"
              className="max-w-xl mx-auto rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 text-left"
            >
              <p className="text-sm font-bold text-amber-300">Certificate exam unavailable</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                {course.exam_unavailable_reason || 'This track does not currently have an available certificate exam.'}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Approved strict-pool questions currently available: {course.exam_question_count ?? 0}. No generated or unrelated questions will be substituted.
              </p>
              <Link href="/exam" className="mt-3 inline-flex text-xs font-semibold text-cyan-300 hover:text-cyan-200">
                Return to the examination catalog
              </Link>
            </div>
          ) : (
            <button
              onClick={handleBeginExam}
              disabled={!course}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2 mx-auto disabled:cursor-wait disabled:opacity-60"
            >
              <Maximize2 className="w-4 h-4" />
              <span>{course ? 'Enter Full-Screen & Begin Examination' : 'Loading examination…'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- VIEW 2: ACTIVE FULLSCREEN EXAM SESSION ---
  if (examState === 'active') {
    const currentQ = questions[currentQIndex];
    const answeredCount = Object.keys(answers).filter((k) => (answers[k] || '').trim()).length;

    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
        {/* Security Warning Modal if violation triggered */}
        {showViolationModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-rose-500 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
              <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white">Security Violation Recorded!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You exited full-screen mode or switched browser tabs. This action has been logged in your examination audit record.
              </p>
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold">
                Warning Violation {violationsCount} of 3. (3 violations terminates examination).
              </div>
              <button
                onClick={() => {
                  setShowViolationModal(false);
                  document.documentElement.requestFullscreen().catch(() => {});
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
              >
                Return to Full-Screen Examination
              </button>
            </div>
          </div>
        )}

        {/* Top Sticky Proctored Exam Header */}
        <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-white text-sm tracking-tight">{course?.title}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">
              Question {currentQIndex + 1} of {questions.length}
            </span>
          </div>

          <div className="flex items-center space-x-6 font-mono">
            {/* Timer Countdown */}
            <div
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg border font-bold text-sm ${
                secondsRemaining < 600
                  ? 'bg-rose-950/60 border-rose-500 text-rose-400 animate-pulse'
                  : 'bg-slate-950 border-slate-800 text-cyan-400'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            {/* Violations pill */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <span className="text-slate-500">Violations:</span>
              <span className={`font-bold ${violationsCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                {violationsCount} / 3
              </span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => handleSubmitExam(false)}
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Evaluating...' : 'Finish & Submit'}</span>
            </button>
          </div>
        </div>

        {/* Active Question Split Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Question Text Panel */}
          <div className="lg:col-span-6 p-6 sm:p-8 overflow-y-auto space-y-4 border-r border-slate-800 bg-slate-950/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono font-semibold uppercase text-[10px]">
                {currentQ?.difficulty || 'Medium'} • {(currentQ?.language || '').toUpperCase()} Challenge
              </span>
              <span className="text-slate-500">
                Answered: {answeredCount} / {questions.length}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {currentQIndex + 1}. {currentQ?.title}
            </h2>

            <div className="text-slate-200 leading-relaxed whitespace-pre-wrap font-sans text-xs sm:text-sm">
              {currentQ?.statement}
            </div>

            {currentQ?.input_format && (
              <div className="pt-2">
                <span className="font-semibold text-cyan-400 block mb-1">Input Format:</span>
                <p className="text-slate-300">{currentQ.input_format}</p>
              </div>
            )}

            {currentQ?.output_format && (
              <div className="pt-2">
                <span className="font-semibold text-cyan-400 block mb-1">Output Format:</span>
                <p className="text-slate-300">{currentQ.output_format}</p>
              </div>
            )}

            {currentQ?.sample_input && (
              <div className="pt-2 font-mono">
                <span className="font-semibold text-white block mb-1">Sample Input / Output:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <pre className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-cyan-300">
                    {currentQ.sample_input}
                  </pre>
                  <pre className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-emerald-400">
                    {currentQ.sample_output}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Answer Workspace Panel */}
          <div className="lg:col-span-6 p-6 flex flex-col justify-between space-y-4 bg-slate-900/40">
            <div className="space-y-2 flex-1 flex flex-col">
              <span className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Write Your Algorithmic Solution / Answer:</span>
                <span className="text-[11px] text-slate-500 font-mono">Autosaved live</span>
              </span>

              <textarea
                value={answers[currentQ?.id] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                rows={16}
                spellCheck={false}
                placeholder="Type or paste your solution code here..."
                className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-cyan-300 text-xs outline-none focus:border-cyan-500 resize-none leading-relaxed"
              />
            </div>

            {/* Bottom Question Stepper & Palette */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              {/* Question Navigation Numbers */}
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
                {questions.map((q, idx) => {
                  const hasAnswer = (answers[q.id] || '').trim().length > 0;
                  const isCur = idx === currentQIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`w-7 h-7 rounded text-[11px] font-mono font-bold transition-all ${
                        isCur
                          ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400'
                          : hasAnswer
                          ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-850 text-slate-400 hover:text-white'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
                  disabled={currentQIndex === 0}
                  className="px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold text-xs disabled:opacity-40 flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => setCurrentQIndex(Math.min(questions.length - 1, currentQIndex + 1))}
                  disabled={currentQIndex >= questions.length - 1}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs disabled:opacity-40 flex items-center space-x-1"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 3: EXAMINATION RESULT & CERTIFICATE CARD ---
  if (examState === 'result' && examResult) {
    const { passed, scorePercent, correctCount, totalQuestions, certificate, pointsAwarded } = examResult;

    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-center">
        {/* Result Summary Banner */}
        <div
          className={`p-8 rounded-2xl border-2 shadow-2xl space-y-3 ${
            passed
              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500 text-rose-200'
          }`}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 text-white">
            {passed ? (
              <CheckCircle2 className="w-14 h-14 text-emerald-400" />
            ) : (
              <XCircle className="w-14 h-14 text-rose-400" />
            )}
          </div>

          <span className="text-xs uppercase tracking-widest font-bold">
            {passed ? 'Examination Passed Successfully!' : 'Examination Threshold Not Met'}
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Achieved Score: {scorePercent}%
          </h2>

          <p className="text-xs sm:text-sm max-w-lg mx-auto text-slate-300 leading-relaxed">
            {passed
              ? `Congratulations! You scored strictly above the 85% requirement (${correctCount} of ${totalQuestions} correct) and earned +${pointsAwarded} points!`
              : `You scored ${scorePercent}% (${correctCount} of ${totalQuestions} correct). Code Nexus requires strictly more than 85% to receive the certificate. Review course notes and try again!`}
          </p>
        </div>

        {/* Certificate Display if Passed */}
        {passed && certificate && (
          <div className="space-y-6 pt-4">
            <h3 className="text-lg font-bold text-white flex items-center justify-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Your Official Code Nexus Verified Certificate</span>
            </h3>

            <CertificateCard
              id={certificate.id}
              recipient_name={certificate.recipient_name}
              course_title={certificate.course_title}
              score_percent={certificate.score_percent}
              issue_date={certificate.issue_date}
              is_valid={certificate.is_valid}
              qr_code_data={certificate.qr_code_data}
            />
          </div>
        )}

        {/* Post-Exam Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-800">
          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition-colors"
          >
            Go to Dashboard (Home)
          </Link>

          <Link
            href={`/courses/${courseId}`}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
          >
            Review Course Notes
          </Link>

          {!passed && (
            <button
              onClick={() => setExamState('intro')}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Examination</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
