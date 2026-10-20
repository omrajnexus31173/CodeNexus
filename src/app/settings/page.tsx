'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  Palette,
  Check,
  Save,
  Type
} from 'lucide-react';

export default function SettingsPage() {
  const { mode, setMode, customBg, setCustomBg } = useTheme();

  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Preset custom dark background hues
  const bgPresets = [
    { name: 'Nexus Deep Blue', hex: '#0a0f1d' },
    { name: 'Onyx Black', hex: '#050508' },
    { name: 'Midnight Slate', hex: '#0f172a' },
    { name: 'Abyssal Navy', hex: '#0b132b' },
    { name: 'Charcoal Dark', hex: '#121212' },
    { name: 'Dark Emerald', hex: '#041611' },
    { name: 'Dark Amethyst', hex: '#120b1e' },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.theme_preference) setMode(data.theme_preference);
        if (data.custom_bg_color) setCustomBg(data.custom_bg_color);
        if (data.editor_theme) setEditorTheme(data.editor_theme);
        if (data.editor_font_size) setEditorFontSize(data.editor_font_size);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme_preference: mode,
          custom_bg_color: customBg,
          editor_theme: editorTheme,
          editor_font_size: editorFontSize,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold font-mono">
          Preferences & Interface
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1 tracking-tight">
          Application & Editor Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize your appearance modes (Dark, Light, System), personalized background color, and coding playground configurations.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-in fade-in flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Settings saved to your profile successfully!</span>
        </div>
      )}

      {/* SECTION 1: APPEARANCE MODE (3 MODES) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Sun className="w-4 h-4 text-cyan-400" />
          <span>Appearance Mode</span>
        </h2>
        <p className="text-xs text-slate-400">
          Choose between Dark, Light, or automatic System-matching mode.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setMode('dark')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
              mode === 'dark'
                ? 'bg-blue-600/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-6 h-6 text-cyan-400" />
            <span className="text-xs font-bold">Dark Mode</span>
          </button>

          <button
            onClick={() => setMode('light')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
              mode === 'light'
                ? 'bg-blue-600/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-6 h-6 text-amber-400" />
            <span className="text-xs font-bold">Light Mode</span>
          </button>

          <button
            onClick={() => setMode('system')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
              mode === 'system'
                ? 'bg-blue-600/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Laptop className="w-6 h-6 text-purple-400" />
            <span className="text-xs font-bold">System Sync</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: CUSTOM BACKGROUND COLOR PICKER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Palette className="w-4 h-4 text-cyan-400" />
            <span>Custom Background Color</span>
          </h2>
          <span className="font-mono text-xs text-cyan-400 font-bold">{customBg}</span>
        </div>
        <p className="text-xs text-slate-400">
          Personalize the entire application background tone by selecting a preset palette or choosing a custom hex color.
        </p>

        {/* Presets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {bgPresets.map((preset) => (
            <button
              key={preset.hex}
              onClick={() => setCustomBg(preset.hex)}
              className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                customBg.toLowerCase() === preset.hex.toLowerCase()
                  ? 'border-cyan-400 ring-2 ring-cyan-500/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
              style={{ backgroundColor: preset.hex }}
            >
              <div
                className="w-4 h-4 rounded-full border border-slate-500 shrink-0"
                style={{ backgroundColor: preset.hex }}
              ></div>
              <span className="text-[11px] font-semibold text-slate-200 truncate">{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Custom Hex Color Input */}
        <div className="pt-2 border-t border-slate-800 flex items-center space-x-3 text-xs">
          <span className="text-slate-300">Choose Hex Color:</span>
          <input
            type="color"
            value={customBg}
            onChange={(e) => setCustomBg(e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
          />
          <input
            type="text"
            value={customBg}
            onChange={(e) => setCustomBg(e.target.value)}
            placeholder="#0a0f1d"
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs text-white uppercase w-28"
          />
        </div>
      </div>

      {/* SECTION 3: CODE EDITOR CONFIGURATION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Type className="w-4 h-4 text-cyan-400" />
          <span>Code Editor Configurations</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-300 block mb-1">Editor Theme</label>
            <select
              value={editorTheme}
              onChange={(e) => setEditorTheme(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            >
              <option value="vs-dark">Visual Studio Dark</option>
              <option value="monokai">Monokai Pro</option>
              <option value="night">Night Owl Deep Slate</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 block mb-1">Editor Font Size</label>
            <select
              value={editorFontSize}
              onChange={(e) => setEditorFontSize(parseInt(e.target.value, 10))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
            >
              <option value={12}>12px (Compact)</option>
              <option value={14}>14px (Standard)</option>
              <option value={16}>16px (Comfortable)</option>
              <option value={18}>18px (Large)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Preferences...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
}
