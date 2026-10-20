'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  FolderGit2,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Save,
  Camera,
  Image as ImageIcon,
  ExternalLink,
  Lock,
  Globe,
  Sparkles
} from 'lucide-react';

export default function CareerProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Editable Form State
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [careerObjective, setCareerObjective] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  // Lists
  const [skills, setSkills] = useState<any[]>([]);
  const [workExperiences, setWorkExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  // Add Item States
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/career-profile');
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);

        setFullName(data.user?.full_name || '');
        setHeadline(data.profile?.headline || '');
        setBio(data.profile?.bio || '');
        setCareerObjective(data.profile?.career_objective || '');
        setPhone(data.profile?.phone || '');
        setLocation(data.profile?.location || '');
        setGithubUrl(data.profile?.github_url || '');
        setLinkedinUrl(data.profile?.linkedin_url || '');
        setPortfolioUrl(data.profile?.portfolio_url || '');
        setIsPublic(data.profile?.is_public !== false);

        setSkills(data.skills || []);
        setWorkExperiences(data.workExperiences || []);
        setEducation(data.education || []);
        setProjects(data.projects || []);
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const res = await fetch('/api/career-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          headline,
          bio,
          career_objective: careerObjective,
          phone,
          location,
          github_url: githubUrl,
          linkedin_url: linkedinUrl,
          portfolio_url: portfolioUrl,
          is_public: isPublic,
          skills,
          workExperiences,
          education,
          projects,
        }),
      });

      if (res.ok) {
        setSaveMessage('✅ Career Profile updated successfully!');
        setTimeout(() => setSaveMessage(''), 4000);
      }
    } catch (err: any) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills((prev) => [
      ...prev,
      {
        name: newSkillName.trim(),
        level: newSkillLevel,
        is_verified: false,
      },
    ]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddExperience = () => {
    setWorkExperiences((prev) => [
      ...prev,
      {
        role: 'Software Engineer',
        company: 'Company Name',
        location: 'City, Country',
        start_date: '2023',
        end_date: 'Present',
        is_current: true,
        description: 'Describe your key impact, engineering achievements, and technologies used.',
        photo_1: '',
        photo_2: '',
      },
    ]);
  };

  const handleUpdateExperience = (index: number, field: string, val: any) => {
    setWorkExperiences((prev) =>
      prev.map((exp, i) => (i === index ? { ...exp, [field]: val } : exp))
    );
  };

  const handleRemoveExperience = (index: number) => {
    setWorkExperiences((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddEducation = () => {
    setEducation((prev) => [
      ...prev,
      {
        degree: 'B.S. in Computer Science',
        institution: 'University Name',
        year_start: '2020',
        year_end: '2024',
        grade_or_gpa: '3.8',
        details: 'Relevant coursework and academic milestones.',
      },
    ]);
  };

  const handleUpdateEducation = (index: number, field: string, val: any) => {
    setEducation((prev) =>
      prev.map((edu, i) => (i === index ? { ...edu, [field]: val } : edu))
    );
  };

  const handleRemoveEducation = (index: number) => {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddProject = () => {
    setProjects((prev) => [
      ...prev,
      {
        title: 'Project Name',
        description: 'Describe the problem solved, architecture, and results.',
        technologies: ['C++', 'Python'],
        repo_url: 'https://github.com/username/project',
        live_url: '',
      },
    ]);
  };

  const handleUpdateProject = (index: number, field: string, val: any) => {
    setProjects((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: val } : p))
    );
  };

  const handleRemoveProject = (index: number) => {
    setProjects((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading || !profileData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner and Save Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold font-mono">
            Automated Career Profile
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1 tracking-tight">
            Developer Portfolio & Career Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Built from your Code Nexus certifications, verified exams, projects, and work history.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/resume"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
          >
            Preview ATS Resume
          </Link>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-in fade-in">
          {saveMessage}
        </div>
      )}

      {/* Main Form Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info & Contacts */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-xs">
              Personal Information
            </h3>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Systems Engineer | C++ & Python Specialist"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">GitHub URL</label>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">LinkedIn URL</label>
              <input
                type="text"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300">Public Profile Visibility</span>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors ${
                  isPublic ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isPublic ? 'Public' : 'Private'}
              </button>
            </div>
          </div>

          {/* Official Certificates Badge List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-xs flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Code Nexus Verified Credentials</span>
            </h3>

            {profileData.certificates?.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No certificates earned yet. Pass any course exam with &gt;85% to verify your skills.</p>
            ) : (
              <div className="space-y-3">
                {profileData.certificates?.map((cert: any) => (
                  <div key={cert.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span>{cert.course_title}</span>
                      <span className="text-emerald-400 font-mono text-[10px]">{cert.score_percent}%</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {cert.id}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Summary, Skills, Work Experience (with max 2 photos), Education, Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio & Objective */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-xs">
              Professional Bio & Career Objective
            </h3>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">About Me / Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Career Objective</label>
              <textarea
                value={careerObjective}
                onChange={(e) => setCareerObjective(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Technical Skills Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-xs flex items-center space-x-2">
                <span>Technical Skills & Proficiency</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Beginner • Intermediate • Advanced • Expert</span>
            </div>

            {/* Add Skill Row */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g. C++, Python, SQL, Docker..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Skills Chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((s, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-xl border text-xs flex items-center space-x-2 ${
                    s.is_verified
                      ? 'bg-blue-950/40 border-blue-500/40 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  {s.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{s.name} ({s.level})</span>
                  {!s.is_verified && (
                    <button
                      onClick={() => handleRemoveSkill(idx)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Work Experiences (Max 2 Photos Requirement) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-xs">
                  Work Experience & Internships
                </h3>
                <span className="text-[10px] text-slate-400">Supports maximum 2 photos per experience entry</span>
              </div>
              <button
                type="button"
                onClick={handleAddExperience}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs rounded-lg border border-slate-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Experience</span>
              </button>
            </div>

            <div className="space-y-4">
              {workExperiences.map((exp, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-cyan-400 text-xs">Entry #{idx + 1}</span>
                    <button
                      onClick={() => handleRemoveExperience(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => handleUpdateExperience(idx, 'role', e.target.value)}
                      placeholder="Role / Title"
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                      placeholder="Company Name"
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                    <input
                      type="text"
                      value={exp.start_date}
                      onChange={(e) => handleUpdateExperience(idx, 'start_date', e.target.value)}
                      placeholder="Start Date"
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                    <input
                      type="text"
                      value={exp.end_date}
                      onChange={(e) => handleUpdateExperience(idx, 'end_date', e.target.value)}
                      placeholder="End Date (or Present)"
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>

                  <textarea
                    value={exp.description}
                    onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                    rows={2}
                    placeholder="Describe engineering contributions, systems built, results achieved..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />

                  {/* 2 Photos Constraint: photo_1 and photo_2 */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <span className="text-[11px] text-slate-400 block font-semibold flex items-center space-x-1">
                      <Camera className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Experience Media Photos (Max 2 Photos):</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={exp.photo_1 || ''}
                        onChange={(e) => handleUpdateExperience(idx, 'photo_1', e.target.value)}
                        placeholder="Photo 1 URL (e.g. workspace, project photo)"
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={exp.photo_2 || ''}
                        onChange={(e) => handleUpdateExperience(idx, 'photo_2', e.target.value)}
                        placeholder="Photo 2 URL (e.g. team or architecture photo)"
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-xs">
                Education History
              </h3>
              <button
                type="button"
                onClick={handleAddEducation}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs rounded-lg border border-slate-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-cyan-400 text-xs">Degree #{idx + 1}</span>
                    <button
                      onClick={() => handleRemoveEducation(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                      placeholder="Degree / Major"
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                      placeholder="University / College"
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                    <input
                      type="text"
                      value={edu.year_start}
                      onChange={(e) => handleUpdateEducation(idx, 'year_start', e.target.value)}
                      placeholder="Start Year"
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                    <input
                      type="text"
                      value={edu.year_end}
                      onChange={(e) => handleUpdateEducation(idx, 'year_end', e.target.value)}
                      placeholder="End Year"
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Projects */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-xs">
                Technical Projects & Portfolio
              </h3>
              <button
                type="button"
                onClick={handleAddProject}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs rounded-lg border border-slate-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            <div className="space-y-4">
              {projects.map((p, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-cyan-400 text-xs">Project #{idx + 1}</span>
                    <button
                      onClick={() => handleRemoveProject(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={p.title}
                    onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                    placeholder="Project Title"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-bold"
                  />

                  <textarea
                    value={p.description}
                    onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                    rows={2}
                    placeholder="Project description, architecture details..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />

                  <input
                    type="text"
                    value={p.repo_url || ''}
                    onChange={(e) => handleUpdateProject(idx, 'repo_url', e.target.value)}
                    placeholder="GitHub Repo URL"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-[11px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
