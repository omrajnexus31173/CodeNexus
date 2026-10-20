'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Terminal,
  Play,
  Send,
  Lightbulb,
  Eye,
  CheckCircle2,
  XCircle,
  Coins,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';

export default function PracticePlaygroundPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params?.questionId as string;

  const [question, setQuestion] = useState<any>(null);
  const [userAttempt, setUserAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Editor and runtime state
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [useCustomInput, setUseCustomInput] = useState(false);

  // Results & Feedback
  const [runResult, setRunResult] = useState<any>(null);
  const [submitFeedback, setSubmitFeedback] = useState<any>(null);

  // Hints & Reveal state
  const [hintsUnlocked, setHintsUnlocked] = useState<number>(0);
  const [activeHintTab, setActiveHintTab] = useState<'problem' | 'hints' | 'solution'>('problem');
  const [revealedSolution, setRevealedSolution] = useState<any>(null);

  useEffect(() => {
    if (questionId) {
      fetchQuestionDetail();
    }
  }, [questionId]);

  const fetchQuestionDetail = async () => {
    try {
      const res = await fetch(`/api/questions/${questionId}`);
      if (res.ok) {
        const data = await res.json();
        setQuestion(data.question);
        setUserAttempt(data.userAttempt);

        const lang = data.question.language || 'python';
        setSelectedLanguage(lang);

        // Preload starter code or user saved code
        if (data.userAttempt?.submitted_code) {
          setCode(data.userAttempt.submitted_code);
        } else {
          const starterTemplates = typeof data.question.starter_code === 'string'
            ? JSON.parse(data.question.starter_code || '{}')
            : (data.question.starter_code || {});
          setCode(starterTemplates[lang] || starterTemplates['python'] || '# Write your solution here');
        }

        if (data.userAttempt?.hints_used) {
          setHintsUnlocked(data.userAttempt.hints_used);
        }

        if (data.question.reference_solution) {
          setRevealedSolution({
            code: data.question.reference_solution,
            explanation: data.question.solution_explanation,
          });
        }
      } else {
        router.push('/practice');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    const starterTemplates = typeof question.starter_code === 'string'
      ? JSON.parse(question.starter_code || '{}')
      : (question.starter_code || {});
    setCode(starterTemplates[newLang] || starterTemplates[newLang.toLowerCase()] || `// Write your ${newLang} solution here`);
  };

  const handleUnlockHint = async (hintNum: number) => {
    try {
      const res = await fetch('/api/submit-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: question.id,
          action: 'use_hint',
          hint_number: hintNum,
          language: selectedLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setHintsUnlocked(data.hints_used);
        // Hint text is intentionally not present in the initial question
        // payload; use the text returned by the paid unlock action.
        if (data.hintText) {
          setQuestion((prev: any) => prev ? {
            ...prev,
            [hintNum === 1 ? 'hint_1' : 'hint_2']: data.hintText,
          } : prev);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevealSolution = async () => {
    if (!confirm('Warning: Revealing the official solution will set your awarded practice points to 0 for this question. Do you wish to continue?')) {
      return;
    }

    try {
      const res = await fetch('/api/submit-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: question.id,
          action: 'reveal',
          language: selectedLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRevealedSolution({
          code: data.reference_solution,
          explanation: data.solution_explanation,
        });
        setActiveHintTab('solution');
        setSubmitFeedback({
          status: 'Revealed',
          message: data.message,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunCode = async () => {
    setIsExecuting(true);
    setRunResult(null);
    try {
      const payload: any = {
        language: selectedLanguage,
        code,
      };

      if (useCustomInput && customInput.trim()) {
        payload.customInput = customInput;
      } else {
        payload.testCases = question.publicTestCases.map((tc: any) => ({
          input: tc.input,
          expected_output: tc.expected_output,
          is_hidden: false,
        }));
      }

      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setRunResult(data);
    } catch (err: any) {
      setRunResult({
        status: 'Runtime Error',
        stderr: err.message,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setSubmitFeedback(null);
    setRunResult(null);
    try {
      const res = await fetch('/api/submit-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: question.id,
          code,
          language: selectedLanguage,
        }),
      });

      const data = await res.json();
      setSubmitFeedback(data);
      setRunResult({
        status: data.status,
        executionTimeMs: data.executionTimeMs,
        stderr: data.stderr,
        testCaseResults: data.testCaseResults,
      });
    } catch (err: any) {
      setSubmitFeedback({
        status: 'Error',
        message: 'Submission failed: ' + err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !question) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3 text-xs">
          <Link
            href="/practice"
            className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Question Bank</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 font-semibold truncate">{question.title}</span>
        </div>

        {/* Scoring Status Badges */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold flex items-center space-x-1">
            <Coins className="w-3.5 h-3.5" />
            <span>Worth: 4 pts</span>
          </span>

          {hintsUnlocked > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
              Hints used: {hintsUnlocked} (-{hintsUnlocked} pt)
            </span>
          )}

          {userAttempt?.status === 'solved' && (
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Solved (+{userAttempt.points_awarded} pts)</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[750px]">
        {/* ======================================================== */}
        {/* LEFT PANEL: QUESTION STATEMENT, SPECIFICATIONS, HINTS    */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          {/* Tabs: Problem, Hints, Solution */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/80 px-2 pt-2 gap-1 text-xs">
            <button
              onClick={() => setActiveHintTab('problem')}
              className={`px-4 py-2 font-semibold rounded-t-lg transition-colors border-t border-x ${
                activeHintTab === 'problem'
                  ? 'bg-slate-900 text-cyan-300 border-slate-800 border-b-slate-900'
                  : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              Description
            </button>

            <button
              onClick={() => setActiveHintTab('hints')}
              className={`px-4 py-2 font-semibold rounded-t-lg transition-colors border-t border-x flex items-center space-x-1.5 ${
                activeHintTab === 'hints'
                  ? 'bg-slate-900 text-amber-300 border-slate-800 border-b-slate-900'
                  : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Hints (2 Available)</span>
            </button>

            <button
              onClick={() => setActiveHintTab('solution')}
              className={`px-4 py-2 font-semibold rounded-t-lg transition-colors border-t border-x flex items-center space-x-1.5 ${
                activeHintTab === 'solution'
                  ? 'bg-slate-900 text-purple-300 border-slate-800 border-b-slate-900'
                  : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span>Solution</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-300">
            {activeHintTab === 'problem' && (
              <>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        question.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : question.difficulty === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {question.progression ? `${question.progression} · ` : ''}{question.difficulty}
                    </span>
                    <span className="font-mono text-slate-400 uppercase text-[10px]">
                      {question.language} Track
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        question.validation_status === 'tested'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      }`}
                      title={question.validation_status === 'tested' ? 'Reference and starter were execution-validated' : 'This question has not completed full validation and is not used in graded exams'}
                    >
                      {question.validation_status === 'tested'
                        ? 'Execution-tested'
                        : `${question.validation_status || 'generated'} · unverified`}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">{question.title}</h2>
                  <p className="mt-2 text-[11px] font-mono text-slate-500">
                    {question.topic_id
                      ? `Lesson topic: ${question.topic_id}`
                      : 'Curriculum topic: unassigned'}
                    {question.runtime ? ` · Runtime: ${question.runtime}` : ''}
                  </p>
                </div>

                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {question.statement}
                </div>

                {/* Input / Output Formats */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  {question.input_format && (
                    <div>
                      <span className="font-bold text-cyan-400 block mb-1">Input Format:</span>
                      <p className="text-slate-300 leading-relaxed">{question.input_format}</p>
                    </div>
                  )}

                  {question.output_format && (
                    <div>
                      <span className="font-bold text-cyan-400 block mb-1">Output Format:</span>
                      <p className="text-slate-300 leading-relaxed">{question.output_format}</p>
                    </div>
                  )}

                  {question.constraints && (
                    <div>
                      <span className="font-bold text-cyan-400 block mb-1">Constraints:</span>
                      <pre className="font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                        {question.constraints}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Sample Cases */}
                {question.sample_input && (
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <span className="font-bold text-white block">Sample Example 1:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase mb-1 block">Sample Input:</span>
                        <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-cyan-300">
                          {question.sample_input}
                        </pre>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase mb-1 block">Sample Output:</span>
                        <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-emerald-400">
                          {question.sample_output}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* HINTS TAB */}
            {activeHintTab === 'hints' && (
              <div className="space-y-6">
                <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1">
                  <span className="font-bold text-amber-300 text-xs block">Hint Scoring Rules:</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Using a hint will deduct <strong>1 point</strong> from the 4-point question reward. If you use 1 hint, you earn 3 points upon solving. If you use both hints, you earn 2 points.
                  </p>
                </div>

                {/* Hint 1 */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 text-xs flex items-center space-x-1.5">
                      <Lightbulb className="w-4 h-4" />
                      <span>Hint 1 (-1 Point)</span>
                    </span>
                    {hintsUnlocked >= 1 ? (
                      <span className="text-[10px] text-emerald-400 font-semibold">Unlocked</span>
                    ) : (
                      <button
                        onClick={() => handleUnlockHint(1)}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-[11px] transition-colors"
                      >
                        Unlock Hint 1
                      </button>
                    )}
                  </div>

                  {hintsUnlocked >= 1 ? (
                    <p className="text-xs text-slate-200 leading-relaxed pt-2 border-t border-slate-800">
                      {question.hint_1}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">
                      Click "Unlock Hint 1" to reveal strategic clues about algorithm selection.
                    </p>
                  )}
                </div>

                {/* Hint 2 */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 text-xs flex items-center space-x-1.5">
                      <Lightbulb className="w-4 h-4" />
                      <span>Hint 2 (-1 Point)</span>
                    </span>
                    {hintsUnlocked >= 2 ? (
                      <span className="text-[10px] text-emerald-400 font-semibold">Unlocked</span>
                    ) : (
                      <button
                        onClick={() => handleUnlockHint(2)}
                        disabled={hintsUnlocked < 1}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-[11px] transition-colors disabled:opacity-40"
                      >
                        Unlock Hint 2
                      </button>
                    )}
                  </div>

                  {hintsUnlocked >= 2 ? (
                    <p className="text-xs text-slate-200 leading-relaxed pt-2 border-t border-slate-800">
                      {question.hint_2}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">
                      {hintsUnlocked < 1 ? 'Unlock Hint 1 first.' : 'Click "Unlock Hint 2" for concrete implementation tips.'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* SOLUTION TAB */}
            {activeHintTab === 'solution' && (
              <div className="space-y-6">
                {revealedSolution ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-purple-400 text-xs">Official Reference Solution:</span>
                      <span className="text-[10px] text-slate-400 font-mono">0 pts awarded if revealed</span>
                    </div>

                    <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-emerald-400 text-xs overflow-x-auto">
                      {revealedSolution.code}
                    </pre>

                    {revealedSolution.explanation && (
                      <div className="p-4 bg-blue-950/30 border border-blue-500/20 rounded-xl text-xs text-slate-300 leading-relaxed">
                        <span className="font-bold text-cyan-400 block mb-1">Algorithmic Explanation:</span>
                        {revealedSolution.explanation}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-4">
                    <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Reveal Reference Solution</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Code Nexus promotes learning by doing. If you reveal the answer now without solving it yourself, <strong>0 points</strong> will be awarded for this problem.
                      </p>
                    </div>

                    <button
                      onClick={handleRevealSolution}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs transition-colors"
                    >
                      I Understand, Reveal Solution
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL: CODE EDITOR & OUTPUT TERMINAL               */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Language Selector Header */}
          <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-semibold">Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-cyan-400 font-mono font-semibold uppercase text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="python">Python 3.13</option>
                <option value="c">C (GCC 14)</option>
                <option value="cpp">C++ (G++ 14)</option>
                <option value="java">Java (OpenJDK 17)</option>
                <option value="javascript">JavaScript (Node 20)</option>
                <option value="sql">SQL (PostgreSQL / SQLite)</option>
              </select>
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomInput}
                  onChange={(e) => setUseCustomInput(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-cyan-500"
                />
                <span>Custom Stdin</span>
              </label>
            </div>
          </div>

          {/* Custom Input Box if checked */}
          {useCustomInput && (
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
              <span className="text-slate-400 font-semibold text-[11px] uppercase">Custom Stdin Input:</span>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                rows={2}
                placeholder="Enter custom input lines here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-cyan-300 outline-none text-xs"
              />
            </div>
          )}

          {/* Code Editor Container */}
          <div className="h-[460px]">
            <CodeEditor
              language={selectedLanguage}
              value={code}
              onChange={(val) => setCode(val)}
              onRun={handleRunCode}
              onSubmit={handleSubmitCode}
              onReset={() => {
                const starterTemplates = typeof question.starter_code === 'string'
                  ? JSON.parse(question.starter_code || '{}')
                  : (question.starter_code || {});
                setCode(starterTemplates[selectedLanguage] || starterTemplates['python'] || '');
              }}
              isExecuting={isExecuting}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Bottom Execution / Submission Output Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 min-h-[160px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
              <span className="font-bold text-white flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Test Execution & Evaluation Terminal</span>
              </span>

              {runResult && (
                <div className="flex items-center space-x-3 font-mono text-[11px]">
                  <span
                    className={`font-bold ${
                      runResult.status === 'Accepted'
                        ? 'text-emerald-400'
                        : runResult.status === 'Wrong Answer'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {runResult.status}
                  </span>
                  {runResult.executionTimeMs !== undefined && (
                    <span className="text-slate-400">{runResult.executionTimeMs} ms</span>
                  )}
                </div>
              )}
            </div>

            {/* Submission Banner Message if submitted */}
            {submitFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                  submitFeedback.allPassed
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}
              >
                <span>{submitFeedback.message}</span>
                {submitFeedback.pointsAwarded > 0 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-xs">
                    +{submitFeedback.pointsAwarded} pts
                  </span>
                )}
              </div>
            )}

            {/* Test Case Breakdown if present */}
            {runResult?.testCaseResults && runResult.testCaseResults.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {runResult.testCaseResults.map((tc: any) => (
                    <div
                      key={tc.testCaseIndex}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between font-mono ${
                        tc.passed
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      <span>Case {tc.testCaseIndex} {tc.is_hidden ? '(Hidden)' : ''}</span>
                      {tc.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                    </div>
                  ))}
                </div>

                {/* Show first test case diff if failed */}
                {runResult.testCaseResults.find((tc: any) => !tc.passed) && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-1">
                    <span className="text-rose-400 font-bold block text-[11px]">Failed Case Detail:</span>
                    {(() => {
                      const failedTc = runResult.testCaseResults.find((tc: any) => !tc.passed);
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Expected:</span>
                            <pre className="text-emerald-400 whitespace-pre-wrap">{failedTc.expectedOutput}</pre>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Actual:</span>
                            <pre className="text-rose-400 whitespace-pre-wrap">{failedTc.actualOutput}</pre>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : runResult?.stdout || runResult?.stderr ? (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto">
                {runResult.stdout && (
                  <pre className="text-emerald-400 whitespace-pre-wrap">{runResult.stdout}</pre>
                )}
                {runResult.stderr && (
                  <pre className="text-rose-400 whitespace-pre-wrap mt-1">{runResult.stderr}</pre>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                Click <strong>"Run"</strong> to test against sample cases, or <strong>"Submit"</strong> to run all public and hidden test cases for points (+4 pts)!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
