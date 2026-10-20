'use client';

import React, { useRef } from 'react';
import {
  Download,
  Phone,
  Mail,
  MapPin,
  Globe,
  Code2
} from 'lucide-react';

interface ResumePreviewProps {
  user: any;
  profile: any;
  skills: any[];
  workExperiences: any[];
  education: any[];
  projects: any[];
  certificates: any[];
  template: 'modern' | 'classic' | 'minimal';
  selectedSections: {
    experience: boolean;
    education: boolean;
    projects: boolean;
    skills: boolean;
    certificates: boolean;
  };
}

export default function ResumePreview({
  user,
  profile,
  skills,
  workExperiences,
  education,
  projects,
  certificates,
  template = 'modern',
  selectedSections,
}: ResumePreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const name = user?.full_name || 'Alex Morgan';
  const email = user?.email || 'alex.dev@codenexus.io';
  const headline = profile?.headline || 'Software Engineer';
  const phone = profile?.phone || '+1 (555) 019-2834';
  const location = profile?.location || 'San Francisco, CA';
  const bio = profile?.bio || profile?.career_objective || 'Dedicated Software Engineer with proven problem solving and systems programming experience.';
  const github = profile?.github_url || 'https://github.com/alexmorgan';
  const linkedin = profile?.linkedin_url || 'https://linkedin.com/in/alexmorgan';

  const verifiedSkills = skills.filter((s) => s.is_verified);
  const selfSkills = skills.filter((s) => !s.is_verified);

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-xl border border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <span>ATS-Optimized Resume Preview</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 text-[10px] uppercase font-mono">
              {template}
            </span>
          </h3>
          <p className="text-xs text-slate-400">Standard printable formatting with selectable text</p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-cyan-500/20 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </div>

      {/* Resume Document Paper */}
      <div
        ref={printRef}
        id="resume-printable-area"
        className="bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-2xl border border-slate-300 min-h-[1050px] font-sans print:shadow-none print:border-none print:m-0 print:p-6"
      >
        {/* Header */}
        <header className="border-b-2 border-slate-800 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
                {name}
              </h1>
              <p className="text-base font-semibold text-blue-700 mt-1">
                {headline}
              </p>
            </div>

            <div className="text-xs text-slate-600 space-y-1 sm:text-right">
              <div className="flex items-center sm:justify-end space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>{email}</span>
              </div>
              <div className="flex items-center sm:justify-end space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center sm:justify-end space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{location}</span>
              </div>
            </div>
          </div>

          {/* Social links */}
          <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
            {github && (
              <span className="flex items-center space-x-1">
                <Code2 className="w-3.5 h-3.5 text-slate-700" />
                <span>{github}</span>
              </span>
            )}
            {linkedin && (
              <span className="flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-blue-700" />
                <span>{linkedin}</span>
              </span>
            )}
          </div>
        </header>

        {/* Summary */}
        <section className="mb-6">
          <h2 className="text-xs uppercase tracking-wider font-bold text-slate-950 border-b border-slate-300 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            {bio}
          </p>
        </section>

        {/* Technical Skills */}
        {selectedSections.skills && skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-950 border-b border-slate-300 pb-1 mb-2">
              Technical Proficiencies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-semibold text-slate-900 block text-[11px] mb-1">
                  Code Nexus Verified Skills (Exam Score &gt; 85%):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {verifiedSkills.map((s) => (
                    <span
                      key={s.id || s.name}
                      className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium text-[11px] border border-blue-200 flex items-center space-x-1"
                    >
                      <span>✓ {s.name} ({s.level})</span>
                    </span>
                  ))}
                  {verifiedSkills.length === 0 && (
                    <span className="text-slate-400 italic text-[11px]">Pass certification exams to earn verified skill badges.</span>
                  )}
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-900 block text-[11px] mb-1">
                  Self-Declared Proficiencies:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selfSkills.map((s) => (
                    <span
                      key={s.id || s.name}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] border border-slate-200"
                    >
                      {s.name} ({s.level})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Work Experience */}
        {selectedSections.experience && workExperiences.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-950 border-b border-slate-300 pb-1 mb-3">
              Professional Work Experience
            </h2>
            <div className="space-y-4">
              {workExperiences.map((exp) => (
                <div key={exp.id} className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span className="text-sm font-bold text-slate-950">{exp.role}</span>
                    <span className="text-slate-600 text-[11px] font-medium">
                      {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date}
                    </span>
                  </div>
                  <div className="text-blue-700 font-semibold mb-1">
                    {exp.company} {exp.location ? `• ${exp.location}` : ''}
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical Projects */}
        {selectedSections.projects && projects.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-950 border-b border-slate-300 pb-1 mb-3">
              Technical Projects & Portfolio
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span className="text-xs font-bold text-slate-950">{proj.title}</span>
                    {proj.repo_url && (
                      <span className="text-blue-600 text-[11px] font-mono">{proj.repo_url}</span>
                    )}
                  </div>
                  {proj.technologies && (
                    <p className="text-[11px] font-semibold text-slate-600 mb-1">
                      Technologies: {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                    </p>
                  )}
                  <p className="text-slate-700 leading-relaxed text-xs">
                    {proj.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Official Certifications */}
        {selectedSections.certificates && certificates.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-950 border-b border-slate-300 pb-1 mb-2">
              Verified Certifications (Code Nexus)
            </h2>
            <div className="space-y-2">
              {certificates.map((cert) => (
                <div key={cert.id} className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{cert.course_title}</span>
                    <span className="text-emerald-700 font-semibold ml-2 text-[11px]">
                      (Score: {cert.score_percent}% • Passed &gt; 85%)
                    </span>
                  </div>
                  <span className="text-slate-500 font-mono text-[10px]">ID: {cert.id}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {selectedSections.education && education.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-950 border-b border-slate-300 pb-1 mb-2">
              Education History
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{edu.degree}</span>
                    <span className="text-slate-600 text-[11px]">{edu.year_start} – {edu.year_end || 'Present'}</span>
                  </div>
                  <div className="text-slate-700">
                    {edu.institution} {edu.grade_or_gpa ? `• GPA: ${edu.grade_or_gpa}` : ''}
                  </div>
                  {edu.details && (
                    <p className="text-slate-600 text-[11px] mt-0.5">{edu.details}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
