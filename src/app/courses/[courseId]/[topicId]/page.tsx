'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  FileCode2,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Coins,
  AlertTriangle,
  XCircle,
  Info,
  Layers,
  Globe,
  Terminal,
  Table,
  Lightbulb,
  Award,
  Copy
} from 'lucide-react';
import FlowchartDiagram from '@/components/FlowchartDiagram';
import CodeEditor from '@/components/CodeEditor';

export default function TopicLessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;
  const topicId = params?.topicId as string;

  const [topicData, setTopicData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [practiceRecommendations, setPracticeRecommendations] = useState<any[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsMessage, setRecommendationsMessage] = useState('');

  // Language explanation tab ('en' = English, 'hi' = Hinglish)
  const [explanationLanguage, setExplanationLanguage] = useState<'en' | 'hi'>('en');

  // Active code example tab (1 = Foundational, 2 = Intermediate, 3 = Practical)
  const [activeExampleTab, setActiveExampleTab] = useState<1 | 2 | 3>(1);

  // Live sandbox runner for example snippets
  const [exampleOutputs, setExampleOutputs] = useState<{ [key: number]: string }>({});
  const [isExecutingExample, setIsExecutingExample] = useState(false);
  const [copiedExample, setCopiedExample] = useState(false);

  // Interactive Quiz state (server-scored; answers are not shipped client-side)
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<{ [key: number]: number }>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizError, setQuizError] = useState('');

  // Assignment code state
  const [assignmentCode, setAssignmentCode] = useState('');
  const [assignmentOutput, setAssignmentOutput] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');

  useEffect(() => {
    if (topicId) {
      fetchTopic();
      fetchPracticeRecommendations();
    }
  }, [topicId]);

  const fetchPracticeRecommendations = async () => {
    setRecommendationsLoading(true);
    try {
      const res = await fetch(`/api/topics/${topicId}/recommendations?limit=5`);
      if (res.ok) {
        const data = await res.json();
        setPracticeRecommendations(data.recommendations || []);
        setRecommendationsMessage(data.message || '');
      } else {
        setPracticeRecommendations([]);
        setRecommendationsMessage('Practice recommendations could not be loaded for this lesson.');
      }
    } catch (err) {
      console.error(err);
      setPracticeRecommendations([]);
      setRecommendationsMessage('Practice recommendations could not be loaded for this lesson.');
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const fetchTopic = async () => {
    try {
      const res = await fetch(`/api/topics/${topicId}`);
      if (res.ok) {
        const data = await res.json();
        setTopicData(data);
        setAssignmentCode(
          data.userProgress?.assignment_code || data.topic.assignment_starter_code || ''
        );
        setIsCompleted(data.userProgress?.completed || false);
        if (data.quizProgress) {
          const restored: { [key: number]: number } = {};
          (data.quizProgress.answers || []).forEach((answer: number | null, idx: number) => {
            if (answer !== null && answer !== undefined) restored[idx] = answer;
          });
          setSelectedQuizAnswers(restored);
          setQuizResult({ ...data.quizProgress, persisted: true });
        } else {
          setSelectedQuizAnswers({});
          setQuizResult(null);
        }
      } else {
        router.push(`/courses/${courseId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Sandbox-runnable language per course. Returns null for tracks whose
  // snippets target an external runtime/schema (course DB tables, a
  // browser CSS engine, or the Flutter/Dart toolchain) so the UI can
  // honestly present those as static worked examples instead of sending
  // them to the wrong compiler.
  // Browser-only topics whose snippets need a live DOM (document/window):
  // they are honestly presented as static worked examples even though
  // their course (javascript) is otherwise sandbox-runnable in Node.
  const STATIC_TOPIC_IDS = new Set(['js-dom-basics', 'js-events-delegation']);

  const getRunnerLang = (cid: string, tid?: string): string | null => {
    if (tid && STATIC_TOPIC_IDS.has(tid)) return null;
    if (cid === 'python') return 'python';
    if (cid === 'cpp') return 'cpp';
    if (cid === 'java') return 'java';
    if (cid === 'javascript') return 'javascript';
    if (cid === 'c-lang') return 'c';
    if (cid === 'dsa') return 'c';
    if (cid === 'system-design') return 'javascript';
    return null; // sql-databases, html-css, app-dev
  };

  const getEditorLang = (cid: string) => {
    if (cid === 'sql-databases') return 'sql';
    if (cid === 'html-css') return 'css';
    if (cid === 'app-dev') return 'dart';
    return getRunnerLang(cid) || 'text';
  };

  const STATIC_RUN_MESSAGE =
    'Static worked example: this snippet targets the course database schema, a browser, or the Flutter toolchain, so it is not executed in the code sandbox. Study the documented expected result alongside the walkthrough.';

  // Run any example snippet directly inside the bubblewrap sandbox
  const handleRunExample = async (exampleNum: 1 | 2 | 3, codeToRun: string) => {
    setIsExecutingExample(true);
    setExampleOutputs(prev => ({
      ...prev,
      [exampleNum]: 'Executing in isolated container sandbox...'
    }));

    try {
      const lang = getRunnerLang(topicData.topic.course_id, topicData.topic.id);
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang, code: codeToRun }),
      });
      const data = await res.json();
      if (data.status === 'Accepted') {
        setExampleOutputs(prev => ({
          ...prev,
          [exampleNum]: data.stdout || '(Executed with return code 0 and no output)'
        }));
      } else {
        setExampleOutputs(prev => ({
          ...prev,
          [exampleNum]: data.stderr || data.stdout || `Execution status: ${data.status}`
        }));
      }
    } catch (err: any) {
      setExampleOutputs(prev => ({
        ...prev,
        [exampleNum]: 'Execution error: ' + err.message
      }));
    } finally {
      setIsExecutingExample(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(true);
    setTimeout(() => setCopiedExample(false), 2000);
  };

  const handleTestAssignment = async () => {
    if (!getRunnerLang(topicData.topic.course_id, topicData.topic.id)) {
      setAssignmentOutput(STATIC_RUN_MESSAGE + ' Compare your attempt with the model solution, then mark the topic complete.');
      return;
    }
    setIsEvaluating(true);
    setAssignmentOutput('Compiling and executing assignment code in isolated sandbox...');
    try {
      const lang = getRunnerLang(topicData.topic.course_id, topicData.topic.id);
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang, code: assignmentCode }),
      });
      const data = await res.json();
      if (data.status === 'Accepted') {
        setAssignmentOutput(data.stdout || 'Program compiled and executed with 0 return code.');
      } else {
        setAssignmentOutput(data.stderr || data.stdout || `Execution status: ${data.status}`);
      }
    } catch (err: any) {
      setAssignmentOutput('Execution error: ' + err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleMarkCompleted = async () => {
    setSavingProgress(true);
    setRewardMessage('');
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: topicId,
          course_id: courseId,
          assignment_code: assignmentCode,
          completed: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsCompleted(true);
        if (data.pointsAwarded > 0) {
          setRewardMessage(`🎉 Outstanding! You completed the course and earned +${data.pointsAwarded} Points!`);
        } else {
          setRewardMessage('✅ Topic marked as completed! Progress saved.');
        }
      }
    } catch (err) {
      console.error('Failed to save progress:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  if (loading || !topicData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { topic, prevTopic, nextTopic } = topicData;
  const currentLang = getEditorLang(topic.course_id);
  const isSandboxRunnable = getRunnerLang(topic.course_id, topic.id) !== null;

  // Safe parsing helper for JSONB fields
  const parseJsonField = (field: any, fallback: any = []) => {
    if (!field) return fallback;
    if (typeof field === 'object') return field;
    try {
      return JSON.parse(field);
    } catch {
      return fallback;
    }
  };

  const learningObjectives = parseJsonField(topic.learning_objectives, []);
  const prerequisites = parseJsonField(topic.prerequisites, []);
  const expectedOutcomes = parseJsonField(topic.expected_outcomes, []);
  const syntaxGuide = parseJsonField(topic.syntax_guide, {});
  const codeWalkthrough = parseJsonField(topic.code_walkthrough, null);
  const rulesAndRestrictions = parseJsonField(topic.rules_and_restrictions, []);
  const commonMistakes = parseJsonField(topic.common_mistakes, []);
  const comparisonTable = parseJsonField(topic.comparison_table, null);
  const practicalApps = parseJsonField(topic.practical_applications, []);
  const quizQuestions = parseJsonField(topic.quiz_questions, []);
  const keyTakeaways = parseJsonField(topic.key_takeaways, []);

  const allQuizAnswered = quizQuestions.length > 0 && quizQuestions.every((_: any, idx: number) => selectedQuizAnswers[idx] !== undefined);
  const handleSubmitQuiz = async () => {
    setQuizSubmitting(true);
    setQuizError('');
    try {
      const answers = quizQuestions.map((_: any, idx: number) => selectedQuizAnswers[idx] ?? null);
      const res = await fetch(`/api/topics/${topicId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Quiz submission failed');
      setQuizResult(data);
      setTopicData((prev: any) => prev ? { ...prev, quizProgress: data.persisted ? data : prev.quizProgress } : prev);
    } catch (err: any) {
      setQuizError(err.message || 'Quiz submission failed');
    } finally {
      setQuizSubmitting(false);
    }
  };
  const handleRetakeQuiz = () => {
    setSelectedQuizAnswers({});
    setQuizResult(null);
    setQuizError('');
  };

  // Active example configuration
  const currentExample = {
    title: activeExampleTab === 1 ? topic.code_example_1_title :
           activeExampleTab === 2 ? topic.code_example_2_title : topic.code_example_3_title,
    code: activeExampleTab === 1 ? topic.code_example_1_code :
          activeExampleTab === 2 ? topic.code_example_2_code : topic.code_example_3_code,
    explanation: activeExampleTab === 1 ? topic.code_example_1_explanation :
                 activeExampleTab === 2 ? topic.code_example_2_explanation : topic.code_example_3_explanation,
    expectedOutput: activeExampleTab === 1 ? topic.code_example_1_output :
                    activeExampleTab === 2 ? topic.code_example_2_output : topic.code_example_3_output,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
          <span>/</span>
          <Link href={`/courses/${courseId}`} className="hover:text-cyan-400 font-medium transition-colors">
            {topic.course_title}
          </Link>
          <span>/</span>
          <span className="text-slate-200 truncate">{topic.title}</span>
        </div>

        <div className="flex items-center space-x-3">
          {topic.validation_status && (
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 text-[10px] font-mono font-semibold uppercase">
              {topic.validation_status}
            </span>
          )}
          {isCompleted ? (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center space-x-1.5 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed</span>
            </span>
          ) : (
            <button
              onClick={handleMarkCompleted}
              disabled={savingProgress}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50 shadow-md shadow-emerald-600/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{savingProgress ? 'Saving...' : 'Mark Completed'}</span>
            </button>
          )}
        </div>
      </div>

      {rewardMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-in fade-in">
          {rewardMessage}
        </div>
      )}

      {/* SECTION 1: TOPIC HERO HEADER & LEARNING OBJECTIVES */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 text-[10px] font-mono font-semibold uppercase tracking-wider">
            Curriculum Standard v2.0
          </span>
          <span className="text-slate-500 text-xs">•</span>
          <span className="text-slate-400 text-xs font-mono uppercase">{topic.course_id}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {topic.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-4xl">
          {topic.description}
        </p>

        {/* Objectives, Prerequisites & Expected Outcomes Pills */}
        {(learningObjectives.length > 0 || prerequisites.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {learningObjectives.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Learning Objectives</span>
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {learningObjectives.map((obj: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">{obj}</li>
                  ))}
                </ul>
              </div>
            )}

            {prerequisites.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Prerequisites</span>
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {prerequisites.map((req: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {expectedOutcomes.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Expected Mastery</span>
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {expectedOutcomes.map((outc: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">{outc}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2 & 3: FORMAL DEFINITION & DUAL-LANGUAGE EXPLANATION */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Formal Technical Definition */}
        {topic.formal_definition && (
          <div className="p-4 rounded-xl bg-slate-950/90 border-l-4 border-l-cyan-500 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
              Formal Technical Specification
            </span>
            <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
              "{topic.formal_definition}"
            </p>
          </div>
        )}

        {/* Dual Language Switcher Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Intuitive Explanation
            </h2>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 space-x-1">
            <button
              onClick={() => setExplanationLanguage('en')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                explanationLanguage === 'en'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Simple English</span>
            </button>
            <button
              onClick={() => setExplanationLanguage('hi')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                explanationLanguage === 'hi'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇮🇳 Hinglish Mode</span>
            </button>
          </div>
        </div>

        {/* Core Concept Content Body */}
        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
          {explanationLanguage === 'en' ? (
            topic.content_simple_english
          ) : (
            topic.hinglish_explanation || topic.content_simple_english
          )}
        </div>

        {/* Why It Matters Callout */}
        {topic.why_it_matters && (
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] block">
              💡 Why This Matters in Real Engineering:
            </span>
            <p className="leading-relaxed">{topic.why_it_matters}</p>
          </div>
        )}
      </section>

      {/* SECTION 4: VISUAL SVG DIAGRAM */}
      {(topic.diagram_svg || topic.flowchart_code) && (
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Visual Conceptual Diagram
            </h2>
          </div>
          {topic.diagram_svg ? (
            <div
              className="w-full flex justify-center items-center py-4 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: topic.diagram_svg }}
            />
          ) : (
            <FlowchartDiagram svgContent={topic.flowchart_code} title={topic.title} />
          )}
        </section>
      )}

      {/* SECTION 5: SYNTAX GUIDE */}
      {syntaxGuide?.template && (
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <FileCode2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Syntax Guide & Structural Anatomy
            </h2>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-300">
            <pre>{syntaxGuide.template}</pre>
          </div>
          {syntaxGuide.components && syntaxGuide.components.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {syntaxGuide.components.map((c: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                  <span className="font-mono text-cyan-400 font-bold block">{c.name}</span>
                  <span className="text-slate-400">{c.role}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* SECTION 6: THREE PROGRESSIVE CODE EXAMPLES WITH INTERACTIVE SANDBOX RUNNER */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Progressive Code Examples</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              From foundational mechanics to enterprise-grade production architecture
            </p>
          </div>

          {/* Three Tab Selectors */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 space-x-1">
            <button
              onClick={() => setActiveExampleTab(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeExampleTab === 1
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Foundational
            </button>
            <button
              onClick={() => setActiveExampleTab(2)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeExampleTab === 2
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Logic & Edge Cases
            </button>
            <button
              onClick={() => setActiveExampleTab(3)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeExampleTab === 3
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Practical Application
            </button>
          </div>
        </div>

        {/* Current Example Card */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white">
              {currentExample.title}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopyCode(currentExample.code)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1 transition-colors"
                title="Copy snippet"
              >
                {copiedExample ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedExample ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => handleRunExample(activeExampleTab, currentExample.code)}
                disabled={isExecutingExample}
                className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50 shadow-md shadow-cyan-600/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isExecutingExample ? 'Running...' : 'Run in Sandbox'}</span>
              </button>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto text-cyan-300">
            <pre>{currentExample.code}</pre>
          </div>

          {/* Explanation */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-cyan-400 block mb-1">Architecture & Mechanism:</span>
            {currentExample.explanation}
          </div>

          {/* Expected vs Actual Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Expected Output:
              </span>
              <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap">
                {currentExample.expectedOutput || 'Outputs execution results to standard output.'}
              </pre>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1">
                <Terminal className="w-3 h-3" />
                <span>Live Sandbox Terminal:</span>
              </span>
              <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">
                {exampleOutputs[activeExampleTab] || 'Click "Run in Sandbox" to execute this code live.'}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: STEP-BY-STEP CODE WALKTHROUGH */}
      {codeWalkthrough && codeWalkthrough.steps && (
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Step-by-Step Code Walkthrough
            </h2>
          </div>

          {codeWalkthrough.code && (
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto" aria-label="Walkthrough code with line numbers">
              <pre className="min-w-max">
                {String(codeWalkthrough.code).split('\n').map((line: string, idx: number) => {
                  const lineNumber = idx + 1;
                  const isReferenced = codeWalkthrough.steps.some((st: any) => Number(st.line) === lineNumber);
                  return (
                    <div
                      key={idx}
                      id={`walkthrough-line-${lineNumber}`}
                      className={`flex ${isReferenced ? 'bg-cyan-950/40 rounded' : ''}`}
                    >
                      <span className="select-none w-10 shrink-0 pr-3 text-right text-slate-500" aria-hidden="true">{lineNumber}</span>
                      <code className="whitespace-pre">{line || ' '}</code>
                    </div>
                  );
                })}
              </pre>
            </div>
          )}

          <div className="space-y-2 pt-2">
            {codeWalkthrough.steps.map((st: any, idx: number) => (
              <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/70">
                <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono text-slate-400">Line {st.line}:</span>
                    <span className="text-xs text-slate-200 font-medium">{st.explanation}</span>
                  </div>
                  {st.state && (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40 inline-block">
                      State Change: {st.state}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 8 & 9: RULES & COMMON MISTAKES (DIFF VIEWER) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rules and Restrictions */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Rules & Language Restrictions
            </h2>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {rulesAndRestrictions.map((rule: string, idx: number) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold shrink-0">•</span>
                <span className="leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Common Mistakes & Bug Diff */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <XCircle className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Common Pitfalls & Fixes
            </h2>
          </div>
          <div className="space-y-3">
            {commonMistakes.map((m: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-red-400 block">{m.title}</span>
                <div className="font-mono text-[11px] bg-red-950/30 text-red-300 p-2 rounded border border-red-900/40 overflow-x-auto">
                  <pre>{m.incorrect_code}</pre>
                </div>
                <div className="font-mono text-[11px] bg-emerald-950/30 text-emerald-300 p-2 rounded border border-emerald-900/40 overflow-x-auto">
                  <pre>{m.corrected_code}</pre>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{m.explanation}</p>
                {m.debug_tip && (
                  <span className="text-[10px] text-amber-300 font-semibold block">
                    🔧 Tip: {m.debug_tip}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: COMPARISON TABLE */}
      {comparisonTable && comparisonTable.headers && (
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Table className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {comparisonTable.title || 'Technical Concept Comparison'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950">
                  {comparisonTable.headers.map((h: string, idx: number) => (
                    <th key={idx} className="p-3 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {comparisonTable.rows.map((row: string[], rIdx: number) => (
                  <tr key={rIdx} className="hover:bg-slate-950/50 transition-colors">
                    {row.map((cell: string, cIdx: number) => (
                      <td key={cIdx} className={`p-3 leading-relaxed ${cIdx === 0 ? 'font-semibold text-white' : ''}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SECTION 11: PRACTICAL APPLICATIONS */}
      {practicalApps.length > 0 && (
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Real-World Production Applications</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {practicalApps.map((app: string, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-center space-x-2.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
                <span>{app}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 12: INTERACTIVE SELF-ASSESSMENT QUIZ */}
      {quizQuestions.length > 0 && (
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Quick Concept Check (Assessment Quiz)
            </h2>
          </div>

          <div className="space-y-6">
            {quizQuestions.map((q: any, qIdx: number) => {
              const selectedIdx = selectedQuizAnswers[qIdx];
              const isSubmitted = !!quizResult;
              const correctIdx = quizResult?.correctIndices?.[qIdx];
              const isCorrect = !!quizResult?.results?.[qIdx];
              const explanation = quizResult?.explanations?.[qIdx];

              return (
                <div key={q.id ?? qIdx} className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-white block">
                    Question {qIdx + 1}: {q.question}
                  </span>

                  <div className="space-y-2 pt-1">
                    {q.options.map((opt: string, optIdx: number) => {
                      const isChosen = selectedIdx === optIdx;
                      let btnStyle = 'border-slate-800 text-slate-300 hover:bg-slate-900';

                      if (isSubmitted) {
                        if (optIdx === correctIdx) {
                          btnStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold';
                        } else if (isChosen) {
                          btnStyle = 'border-red-500 bg-red-950/40 text-red-300';
                        }
                      } else if (isChosen) {
                        btnStyle = 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isSubmitted}
                          onClick={() => setSelectedQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                          className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isSubmitted && optIdx === correctIdx && (
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isSubmitted && (
                    <div className={`p-3 rounded-lg text-xs leading-relaxed ${
                      isCorrect ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-300' : 'bg-red-950/30 border border-red-500/30 text-red-300'
                    }`}>
                      <span className="font-bold block mb-1">
                        {isCorrect ? '✅ Correct!' : '❌ Incorrect.'}
                      </span>
                      {explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-slate-800">
            {!quizResult ? (
              <button
                disabled={!allQuizAnswered || quizSubmitting}
                onClick={handleSubmitQuiz}
                className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors disabled:opacity-40"
              >
                {quizSubmitting ? 'Scoring...' : 'Submit Quiz'}
              </button>
            ) : (
              <>
                <span className="text-sm font-bold text-white">
                  Score: {quizResult.score} / {quizResult.totalQuestions}
                </span>
                <span className="text-xs text-slate-400">
                  {quizResult.persisted ? 'Saved to your learning progress.' : 'Guest result — log in to save future quiz attempts.'}
                </span>
                <button
                  onClick={handleRetakeQuiz}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Retake Quiz
                </button>
              </>
            )}
            {!quizResult && !allQuizAnswered && (
              <span className="text-xs text-slate-500">Answer every question to submit. Scoring is done on the server.</span>
            )}
          </div>
          {quizError && (
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/30 text-red-300 text-xs" role="alert">
              {quizError}
            </div>
          )}
        </section>
      )}

      {/* SECTION 13: KEY TAKEAWAYS & QUICK REVISION NOTES */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>Key Takeaways & Quick Revision Cheat Sheet</span>
        </h2>
        {keyTakeaways.length > 0 && (
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            {keyTakeaways.map((k: string, idx: number) => (
              <li key={idx} className="leading-relaxed">{k}</li>
            ))}
          </ul>
        )}
        {topic.quick_revision_notes && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-yellow-200/90 font-mono">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Quick Revision Summary:
            </span>
            {topic.quick_revision_notes}
          </div>
        )}
      </section>

      {/* SECTION 14: TOPIC CODING PRACTICE / ASSIGNMENT */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                Section 14: Practical Exercise
              </span>
              <span className="text-xs text-slate-400 font-medium">Hands-On Sandbox Practice</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Apply Your Knowledge
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              {showSolution ? 'Hide Model Solution' : 'View Model Solution'}
            </button>
          </div>
        </div>

        {/* Assignment Prompt */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-200 leading-relaxed">
          <span className="font-bold text-cyan-400 block mb-1 text-xs">Task Objective:</span>
          {topic.assignment_prompt}
        </div>

        {/* Solution toggle if requested */}
        {showSolution && (
          <div className="bg-blue-950/30 border border-blue-500/30 p-4 rounded-xl text-xs text-slate-200 space-y-2">
            <span className="font-semibold text-cyan-400 block">Reference Model Solution:</span>
            <pre className="font-mono bg-slate-950 p-3 rounded-lg overflow-x-auto text-emerald-400">
              {topic.assignment_solution}
            </pre>
          </div>
        )}

        {/* Assignment Code Editor */}
        <div className="h-64">
          <CodeEditor
            language={currentLang}
            value={assignmentCode}
            onChange={(val) => setAssignmentCode(val)}
            onRun={handleTestAssignment}
            onSubmit={handleMarkCompleted}
            isExecuting={isEvaluating}
            isSubmitting={savingProgress}
          />
        </div>

        {/* Execution Output Panel */}
        {assignmentOutput && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider block mb-1">
              Sandbox Terminal Output:
            </span>
            <pre className="text-emerald-400 whitespace-pre-wrap">{assignmentOutput}</pre>
          </div>
        )}

        {/* Completion Confirmation Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {isCompleted ? (
              <span className="text-emerald-400 font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Topic completed! Ready for the next lesson.</span>
              </span>
            ) : (
              <span>Execute your solution in the sandbox and mark this topic completed.</span>
            )}
          </div>

          <button
            onClick={handleMarkCompleted}
            disabled={savingProgress}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{savingProgress ? 'Saving...' : isCompleted ? 'Update Progress' : 'Mark Topic Completed'}</span>
          </button>
        </div>
      </section>

      {/* Topic-aware recommendations from the execution-tested question pool */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm" aria-labelledby="topic-practice-next">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 id="topic-practice-next" className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Practice This Topic Next</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Execution-tested challenges mapped to this exact lesson, ordered from Beginner to Advanced.
            </p>
          </div>
          <Link
            href={`/practice?topicId=${topic.id}`}
            className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 inline-flex items-center space-x-1"
          >
            <span>View topic practice</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendationsLoading ? (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : practiceRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {practiceRecommendations.map((question) => (
              <Link
                key={question.id}
                href={`/practice/${question.id}`}
                className="group p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {question.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {question.recommendation_reason}
                    </p>
                  </div>
                  {question.attempt_status === 'solved' && (
                    <span className="shrink-0 inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Solved</span>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    question.difficulty === 'Easy'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : question.difficulty === 'Medium'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  }`}>
                    {question.progression} · {question.difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-semibold">
                    Execution-tested
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                    {question.expected_time_complexity || 'O(N)'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {recommendationsMessage || 'No execution-tested practice question is mapped to this lesson yet. No unrelated or generated question was substituted.'}
          </div>
        )}
      </section>

      {/* Prev / Next Bottom Navigation */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-6">
        {prevTopic ? (
          <Link
            href={`/courses/${courseId}/${prevTopic.id}`}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous: {prevTopic.title}</span>
          </Link>
        ) : (
          <div></div>
        )}

        {nextTopic ? (
          <Link
            href={`/courses/${courseId}/${nextTopic.id}`}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all"
          >
            <span>Next: {nextTopic.title}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            href={`/exam/${courseId}`}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all"
          >
            <span>Take Final Certification Exam</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
