import React from 'react';
import Link from 'next/link';
import { Code2, ShieldCheck, Award, Library, Terminal, BookOpen, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand and Description */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                <Code2 className="w-4 h-4 text-cyan-200" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">Code Nexus</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              The premier learning platform and coding playground for mastering C, C++, Python, Java, SQL, Full-Stack, and System Design with sandboxed execution, verifiable certificates, and automated career portfolios.
            </p>
            <div className="flex items-center space-x-3 text-slate-500">
              <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>PostgreSQL 17 Running</span>
              </span>
              <span className="text-slate-700">|</span>
              <span className="inline-flex items-center space-x-1 text-cyan-400 text-[11px]">
                <ShieldCheck className="w-3 h-3" />
                <span>Isolated Sandbox</span>
              </span>
            </div>
          </div>

          {/* Programming Tracks */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">
              Course Syllabi
            </h4>
            <ul className="space-y-2">
              <li><Link href="/courses/c-lang" className="hover:text-cyan-400 transition-colors">C Systems & Memory Layout</Link></li>
              <li><Link href="/courses/cpp" className="hover:text-cyan-400 transition-colors">C++ Modern OOP & STL</Link></li>
              <li><Link href="/courses/python" className="hover:text-cyan-400 transition-colors">Python, NumPy & PyTorch</Link></li>
              <li><Link href="/courses/java" className="hover:text-cyan-400 transition-colors">Java Enterprise & Streams</Link></li>
              <li><Link href="/courses/sql-databases" className="hover:text-cyan-400 transition-colors">SQL & PostgreSQL Architecture</Link></li>
              <li><Link href="/courses/dsa" className="hover:text-cyan-400 transition-colors">Data Structures & Algorithms</Link></li>
              <li><Link href="/courses/system-design" className="hover:text-cyan-400 transition-colors">System Design & Scalability</Link></li>
            </ul>
          </div>

          {/* Platform Features */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">
              Developer Ecosystem
            </h4>
            <ul className="space-y-2">
              <li><Link href="/practice" className="hover:text-cyan-400 transition-colors flex items-center space-x-1"><Terminal className="w-3 h-3" /><span>Practice Question Bank</span></Link></li>
              <li><Link href="/exam" className="hover:text-cyan-400 transition-colors flex items-center space-x-1"><Award className="w-3 h-3" /><span>Certification Examination Hall</span></Link></li>
              <li><Link href="/verify-certificate" className="hover:text-cyan-400 transition-colors flex items-center space-x-1"><ShieldCheck className="w-3 h-3" /><span>Certificate Verifier</span></Link></li>
              <li><Link href="/library" className="hover:text-cyan-400 transition-colors flex items-center space-x-1"><Library className="w-3 h-3" /><span>Resource Library (150 Pts)</span></Link></li>
              <li><Link href="/resume" className="hover:text-cyan-400 transition-colors">ATS Resume Builder & PDF Export</Link></li>
              <li><Link href="/profile" className="hover:text-cyan-400 transition-colors">Automated Career Profile</Link></li>
            </ul>
          </div>

          {/* Scoring Rules Transparency */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">
              Scoring & Rewards
            </h4>
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Practice Solved:</span>
                <span>+4 points</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>Hint Used (max 2):</span>
                <span>-1 point / hint</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Reveal Solution:</span>
                <span>0 points</span>
              </div>
              <div className="flex justify-between text-cyan-400 font-medium">
                <span>Course Completion:</span>
                <span>+50 points</span>
              </div>
              <div className="flex justify-between text-indigo-400 font-medium">
                <span>Exam Passed (&gt; 85%):</span>
                <span>+10 points</span>
              </div>
              <div className="flex justify-between text-purple-400 font-semibold border-t border-slate-800 pt-1">
                <span>Library Unlock:</span>
                <span>150 points</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <p>© 2026 Code Nexus Technologies Inc. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Built with precision for software engineers worldwide.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
