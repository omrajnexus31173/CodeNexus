'use client';

import React, { useEffect, useState } from 'react';
import {
  Library as LibraryIcon,
  BookOpen,
  Lock,
  Unlock,
  Coins,
  Download,
  Eye,
  Search,
  CheckCircle2,
  FileText,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function LibraryPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Reader Modal State
  const [readingResource, setReadingResource] = useState<any>(null);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      const res = await fetch('/api/library');
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
        setUserPoints(data.userPoints || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (resourceId: string, title: string) => {
    if (!confirm(`Unlock "${title}" permanently for 150 points? (Current balance: ${userPoints} pts)`)) {
      return;
    }

    setUnlockingId(resourceId);
    setFeedback(null);
    try {
      const res = await fetch('/api/library/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource_id: resourceId }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: data.message });
        setUserPoints(data.newBalance);
        // Refresh library status
        fetchLibrary();
        setReadingResource(data.resource);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to unlock resource.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setUnlockingId(null);
    }
  };

  const handleRead = async (resItem: any) => {
    // If not unlocked and points >= 150, offer unlock
    if (!resItem.isUnlocked) {
      handleUnlock(resItem.id, resItem.title);
      return;
    }

    setReadingResource(resItem);
  };

  const categories = ['All', 'Book', 'Notes', 'Cheat Sheet', 'Diagram Guide'];

  const filtered = resources.filter((r) => {
    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.language.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold font-mono">
            Knowledge Repository
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1 tracking-tight">
            Code Nexus Technical Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Curated textbooks, system architecture blueprints, and deep-dive notes. Unlock any eligible resource permanently once you reach <strong>150 points</strong> through course completions and coding practice!
          </p>
        </div>

        {/* User Points Card */}
        <div className="flex items-center space-x-3 px-5 py-3 rounded-2xl bg-slate-900 border border-amber-500/30 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Your Balance</span>
            <span className="text-xl font-bold text-amber-400">{userPoints} pts</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search book title or topic..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[10px] font-mono font-semibold uppercase border border-purple-500/20">
                    {item.category}
                  </span>

                  {item.isUnlocked ? (
                    <span className="flex items-center space-x-1 text-emerald-400 text-xs font-semibold">
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-amber-400 text-xs font-semibold">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{item.unlock_cost} pts</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">By {item.author}</p>

                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center space-x-4 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-800/80">
                  <span>{item.pages_or_read_time}</span>
                  <span>•</span>
                  <span>{item.file_size}</span>
                  <span>•</span>
                  <span className="uppercase font-mono text-[10px] text-slate-400">{item.language}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center space-x-2">
                {item.isUnlocked ? (
                  <button
                    onClick={() => handleRead(item)}
                    className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Book & Notes</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnlock(item.id, item.title)}
                    disabled={unlockingId === item.id || userPoints < item.unlock_cost}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm shadow-amber-500/20 disabled:opacity-40"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>{unlockingId === item.id ? 'Unlocking...' : `Unlock for ${item.unlock_cost} pts`}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reader / Preview Modal */}
      {readingResource && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-purple-400 font-semibold">
                  Unlocked Reader • {readingResource.category}
                </span>
                <h3 className="text-base font-bold text-white">{readingResource.title}</h3>
              </div>
              <button
                onClick={() => setReadingResource(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 font-sans text-xs text-slate-200 leading-relaxed whitespace-pre-wrap space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-bold text-cyan-400 block mb-1">Executive Summary:</span>
                <p className="text-slate-300">{readingResource.content_summary}</p>
              </div>

              <div className="p-6 bg-slate-950/70 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300">
                {readingResource.pdf_preview_text}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Permanent ownership in your Code Nexus library</span>
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Save Notes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
