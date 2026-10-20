'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';
import ResumePreview from '@/components/ResumePreview';

export default function ResumeBuilderPage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Template Options: modern, classic, minimal
  const [template, setTemplate] = useState<'modern' | 'classic' | 'minimal'>('modern');

  // Configurable Section Inclusions
  const [selectedSections, setSelectedSections] = useState({
    experience: true,
    education: true,
    projects: true,
    skills: true,
    certificates: true,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/career-profile');
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sec: keyof typeof selectedSections) => {
    setSelectedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  if (loading || !profileData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { user, profile, skills, workExperiences, education, projects, certificates } = profileData;

  const warnings: string[] = [];
  if (!profile?.phone) warnings.push('Contact phone number is not set in career profile.');
  if (!profile?.location) warnings.push('Location (City, Country) is missing.');
  if (!skills || skills.length === 0) warnings.push('No skills added yet.');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold font-mono">
            Document Generation Engine
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1 tracking-tight">
            ATS-Friendly Professional Resume Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Format your verified Code Nexus credentials, projects, and work experiences into clean ATS-parseable templates and download directly in PDF format with selectable text.
          </p>
        </div>

        <Link
          href="/profile"
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors shrink-0"
        >
          Edit Raw Profile Data
        </Link>
      </div>

      {/* Warnings Banner if any missing fields */}
      {warnings.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs space-y-1">
          <span className="font-bold flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Profile Completeness Recommendations:</span>
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-slate-300 pt-1">
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Builder Configuration Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        {/* Template Chooser */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Select ATS Template</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'modern', name: 'Modern Tech' },
              { id: 'classic', name: 'Executive' },
              { id: 'minimal', name: 'Monochrome' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id as any)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  template === t.id
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Section Toggles */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Include / Exclude Sections</span>
          </label>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.keys(selectedSections).map((secKey) => {
              const active = (selectedSections as any)[secKey];
              return (
                <button
                  key={secKey}
                  onClick={() => toggleSection(secKey as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold uppercase text-[10px] font-mono transition-colors border ${
                    active
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  {active ? '✓ ' : '× '} {secKey}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Resume Preview & Download Component */}
      <ResumePreview
        user={user}
        profile={profile}
        skills={skills}
        workExperiences={workExperiences}
        education={education}
        projects={projects}
        certificates={certificates}
        template={template}
        selectedSections={selectedSections}
      />
    </div>
  );
}
