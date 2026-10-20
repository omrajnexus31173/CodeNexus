'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Terminal,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Coins,
  Lightbulb,
  AlertCircle
} from 'lucide-react';

export default function PracticeListPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedLang, setSelectedLang] = useState('all');
  const [selectedDiff, setSelectedDiff] = useState('all');
  const [selectedProgression, setSelectedProgression] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [topicOptions, setTopicOptions] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const topicFromUrl = params.get('topicId');
    const progressionFromUrl = params.get('progression');
    if (topicFromUrl) setSelectedTopic(topicFromUrl);
    if (progressionFromUrl) setSelectedProgression(progressionFromUrl);
    if (params.get('validationStatus') === 'tested') setVerifiedOnly(true);
    fetchTopicOptions();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [selectedLang, selectedDiff, selectedProgression, verifiedOnly, selectedTopic, page]);

  const fetchTopicOptions = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        const options = (data.courses || []).flatMap((course: any) =>
          (course.topics || []).map((topic: any) => ({ ...topic, courseTitle: course.title }))
        );
        setTopicOptions(options);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        language: selectedLang,
        difficulty: selectedDiff,
        progression: selectedProgression,
        validationStatus: verifiedOnly ? 'tested' : 'all',
        topicId: selectedTopic,
        search,
        page: page.toString(),
        limit: '20',
      });

      const res = await fetch(`/api/questions?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const languagesList = [
    { id: 'all', label: 'All Tracks' },
    { id: 'python', label: 'Python' },
    { id: 'c', label: 'C Language' },
    { id: 'cpp', label: 'C++' },
    { id: 'java', label: 'Java' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'sql', label: 'SQL' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold font-mono">
            Practice Arena & Question Bank
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1 tracking-tight">
            Algorithmic & System Challenges
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Solve problems to earn <strong>4 points</strong> each. Each hint used deducts <strong>-1 point</strong> (max 2 hints). Revealing solutions without solving awards <strong>0 points</strong>.
          </p>
        </div>

        {/* Scoring pill rule reminder */}
        <div className="flex items-center space-x-3 text-xs bg-slate-900 border border-slate-800 p-2.5 rounded-xl shrink-0">
          <span className="text-emerald-400 font-semibold">Solve: +4 pts</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400">Hint: -1 pt</span>
          <span className="text-slate-600">|</span>
          <span className="text-purple-400 font-semibold">Unlock Book: 150 pts</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Language Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
          {languagesList.map((lang) => (
            <button
              key={lang.id}
              onClick={() => { setSelectedLang(lang.id); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedLang === lang.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Difficulty & Search */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedDiff}
            onChange={(e) => { setSelectedDiff(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={selectedProgression}
            onChange={(e) => { setSelectedProgression(e.target.value); setSelectedDiff('all'); setPage(1); }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            aria-label="Filter by progression stage"
          >
            <option value="all">All Progression Stages</option>
            <option value="Beginner">Beginner · fundamentals</option>
            <option value="Intermediate">Intermediate · combined concepts</option>
            <option value="Advanced">Advanced · algorithmic reasoning</option>
          </select>

          <label className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => { setVerifiedOnly(e.target.checked); setPage(1); }}
              className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
            />
            Execution-tested only
          </label>

          <select
            value={selectedTopic}
            onChange={(e) => { setSelectedTopic(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 max-w-[220px]"
            aria-label="Filter by lesson topic"
          >
            <option value="all">All Lesson Topics</option>
            {topicOptions.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.courseTitle}: {topic.title}
              </option>
            ))}
          </select>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-60">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problem..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </form>
        </div>
      </div>

      {/* Questions Table */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-base font-semibold text-white">No questions found matching criteria</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting filters or searching another keyword.</p>
        </div>
      ) : (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Problem Title</th>
                  <th className="py-3.5 px-4 font-semibold">Track</th>
                  <th className="py-3.5 px-4 font-semibold">Difficulty</th>
                  <th className="py-3.5 px-4 font-semibold">Time Bound</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {questions.map((q) => {
                  const isSolved = q.userAttempt?.status === 'solved';
                  const isRevealed = q.userAttempt?.revealed_solution;
                  return (
                    <tr
                      key={q.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => window.location.href = `/practice/${q.id}`}
                    >
                      <td className="py-3.5 px-4">
                        {isSolved ? (
                          <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[10px]">Solved</span>
                          </span>
                        ) : isRevealed ? (
                          <span className="text-amber-400 text-[10px]">Revealed</span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Unsolved</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {q.title}
                        </span>
                        <span className="block mt-0.5 font-mono text-[9px] text-slate-500">
                          topic: {q.topic_id || '—'} • {q.validation_status === 'tested' ? 'tested' : `${q.validation_status || 'generated'} · unverified`}
                        </span>
                        {q.tags && q.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {q.tags.slice(0, 3).map((tag: string) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded text-[9px] font-mono"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800/80 font-mono uppercase text-[10px] text-cyan-300 font-semibold">
                          {q.language}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            q.difficulty === 'Easy'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : q.difficulty === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                        <span className="block mt-1 text-[9px] uppercase tracking-wide text-slate-500">
                          {q.progression || ''}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {q.expected_time_complexity || 'O(N)'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/practice/${q.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600/80 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
                        >
                          <span>{isSolved ? 'Review' : 'Solve'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Showing page {page} of {totalPages} ({total} questions total)</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-slate-850 hover:bg-slate-800 rounded-lg disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 bg-slate-850 hover:bg-slate-800 rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
