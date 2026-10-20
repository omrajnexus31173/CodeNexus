'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Code2,
  Terminal,
  BookOpen,
  Award,
  Library,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  Coins,
  Play
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Interactive Live Playground Demo on Landing Page
  const [demoLang, setDemoLang] = useState('python');
  const [demoCode, setDemoCode] = useState(`def welcome():
    languages = ["C", "C++", "Python", "SQL", "Java", "DSA"]
    print("Welcome to Code Nexus Academy!")
    print(f"Mastering: {', '.join(languages)}")

welcome()`);
  const [demoOutput, setDemoOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
          router.push('/dashboard');
          return;
        }
      }
    } catch {
      // not logged in
    } finally {
      setLoading(false);
    }
  };

  const handleRunDemo = async () => {
    setIsRunning(true);
    setDemoOutput('Compiling and executing in isolated sandbox...');
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: demoLang, code: demoCode }),
      });
      const data = await res.json();
      if (data.status === 'Accepted') {
        setDemoOutput(data.stdout || 'Program executed successfully with 0 output.');
      } else {
        setDemoOutput(data.stderr || data.stdout || `Execution status: ${data.status}`);
      }
    } catch (err: any) {
      setDemoOutput('Execution failed: ' + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const setCodeForLang = (lang: string) => {
    setDemoLang(lang);
    if (lang === 'c') {
      setDemoCode(`#include <stdio.h>

int main() {
    printf("Code Nexus C Systems Lab\\n");
    printf("Pointer & Memory Architecture Ready!\\n");
    return 0;
}`);
    } else if (lang === 'cpp') {
      setDemoCode(`#include <iostream>
#include <vector>

int main() {
    std::vector<int> scores = {92, 88, 95};
    std::cout << "Code Nexus C++ Modern Track\\nTop Score: " << scores[2] << std::endl;
    return 0;
}`);
    } else if (lang === 'python') {
      setDemoCode(`def welcome():
    languages = ["C", "C++", "Python", "SQL", "Java", "DSA"]
    print("Welcome to Code Nexus Academy!")
    print(f"Mastering: {', '.join(languages)}")

welcome()`);
    } else if (lang === 'javascript') {
      setDemoCode(`const platform = "Code Nexus";
console.log(\`Running in high-speed V8 engine on \${platform}!\`);`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow backdrop */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-blue-600/20 to-purple-600/20 blur-[100px] rounded-full"></div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-cyan-400 text-xs font-medium mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Complete Developer Academy & Career Builder</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Master Programming Languages from <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Basics to Systems Architecture</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Learn C, C++, Python, SQL, Java, DSA, and System Design with simplified step-by-step explanations, visual flowcharts, 2+ code examples per topic, sandboxed coding playgrounds, 2-hour certification exams, and automated career portfolios.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-800 hover:border-slate-700 transition-all"
          >
            Sign In with Email
          </Link>

          <Link
            href="/courses"
            className="px-6 py-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-cyan-300 font-semibold text-sm border border-cyan-500/30 transition-all flex items-center space-x-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Explore Syllabi</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left text-xs text-slate-300">
          <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>2+ Real Code Examples for Every Topic</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Visual Flowcharts & SVG Logic Diagrams</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>2-Hour Exams & &gt;85% Certificates</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>150 Points Unlocks Library Books</span>
          </div>
        </div>
      </section>

      {/* Interactive Live Playground Demo */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Top Bar */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <span className="text-xs font-semibold text-slate-300 font-mono">
                Code Nexus Isolated Compiler Demo
              </span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg text-xs">
              {['python', 'c', 'cpp', 'javascript'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCodeForLang(lang)}
                  className={`px-3 py-1 rounded-md uppercase font-mono text-[11px] font-semibold transition-colors ${
                    demoLang === lang ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              onClick={handleRunDemo}
              disabled={isRunning}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-all shadow-sm shadow-emerald-500/20 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </button>
          </div>

          {/* Split Editor and Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 min-h-[260px]">
            {/* Editor Code */}
            <div className="p-4 bg-slate-950/60 font-mono text-xs">
              <textarea
                value={demoCode}
                onChange={(e) => setDemoCode(e.target.value)}
                spellCheck={false}
                rows={10}
                className="w-full h-full bg-transparent outline-none resize-none text-cyan-300 font-mono leading-relaxed"
              />
            </div>

            {/* Terminal Output */}
            <div className="p-4 bg-black/40 font-mono text-xs flex flex-col justify-between">
              <div>
                <div className="text-slate-500 text-[11px] mb-2 uppercase tracking-wider flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Terminal Standard Output (stdout):</span>
                </div>
                <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                  {demoOutput || 'Click "Run Code" to compile and execute in the live sandbox!'}
                </pre>
              </div>
              <div className="text-[10px] text-slate-500 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span>Runtimes: Python 3.13 | GCC 14 | G++ 14 | OpenJDK 17 | Node 20</span>
                <span className="text-cyan-400">Isolated 5s CPU Sandbox</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            How Code Nexus Transforms Your Coding Journey
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            A comprehensive, connected learning operating system designed for genuine engineering mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Structured Courses & Flowcharts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every topic is explained in the simplest English, accompanied by visual SVG logic flowcharts and at least 2 complete code examples. Completing any course awards you <strong>+50 points</strong>.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Practice Arena & Hints</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Practice up to 4,000 questions per language. Solve questions for <strong>4 points</strong> each. Use hints if needed (-1 point per hint, up to 2 hints). All scoring is recorded in an auditable ledger.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Exams & Verifiable Certificates</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Take the 2-hour fullscreen examination. If you score <strong>&gt; 85%</strong>, receive an official Code Nexus Certificate with a unique ID and public verification page, plus <strong>+10 points</strong>.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Library className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">150-Point Library Unlocks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Accumulate 150 points through practice and courses to permanently unlock premium textbooks, architecture blueprints, and interview cheat sheets in your personal library.
            </p>
          </div>

          {/* Pillar 5 */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Automated Career Profile</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your career profile builds automatically from your verified exam scores, courses completed, work experiences (with max 2 photos), education, and project portfolio.
            </p>
          </div>

          {/* Pillar 6 */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">ATS Resume Builder & PDF Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select which skills, experiences, and certifications to showcase, preview in real-time, and download your clean ATS-compliant PDF resume with one click.
            </p>
          </div>
        </div>
      </section>

      {/* Syllabi Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Available Programming Tracks & Syllabi
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Every course features detailed lesson plans, flowchart diagrams, and 2+ working code examples per topic.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: 'c-lang', title: 'C Systems & Memory Layout', desc: 'Basics, compilation, pointers, malloc, structs, POSIX files, multithreading.', icon: Cpu },
            { id: 'cpp', title: 'C++ Modern OOP & STL', desc: 'Namespaces, references, inheritance, virtual functions, templates, STL, C++20.', icon: Layers },
            { id: 'python', title: 'Python & AI Libraries', desc: 'Dynamic typing, comprehension, NumPy, Pandas, Matplotlib, PyTorch, OpenCV.', icon: Code2 },
            { id: 'java', title: 'Java Enterprise Track', desc: 'JVM architecture, OOP, Collections Framework, Streams API, concurrency.', icon: Terminal },
            { id: 'sql-databases', title: 'SQL & PostgreSQL', desc: 'RDBMS models, DDL, DML, complex JOINs, Window Functions, CTEs, indexes.', icon: Database },
            { id: 'dsa', title: 'Data Structures & Algorithms', desc: 'Big O, linked lists, trees, graphs, sorting, searching, dynamic programming.', icon: ShieldCheck },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.id}
                href={`/courses/${c.id}`}
                className="group bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 p-5 rounded-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {c.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {c.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-cyan-400 font-semibold">
                  <span>View Full Syllabus</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
