'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Send, RotateCcw, Copy, Check, Settings, Terminal, Maximize2, Minimize2 } from 'lucide-react';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (val: string) => void;
  onRun?: () => void;
  onSubmit?: () => void;
  onReset?: () => void;
  isExecuting?: boolean;
  isSubmitting?: boolean;
  fontSize?: number;
  readOnly?: boolean;
}

export default function CodeEditor({
  language,
  value,
  onChange,
  onRun,
  onSubmit,
  onReset,
  isExecuting = false,
  isSubmitting = false,
  fontSize = 14,
  readOnly = false,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'monokai' | 'night'>('vs-dark');
  const [curFontSize, setCurFontSize] = useState(fontSize);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = (value || '').split('\n');
  const lineCount = Math.max(lines.length, 1);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Run shortcut: Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (onSubmit) onSubmit();
      else if (onRun) onRun();
      return;
    }

    // Tab key support
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 4 spaces
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const syncScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const getThemeClass = () => {
    if (editorTheme === 'monokai') return 'bg-[#272822] text-[#f8f8f2]';
    if (editorTheme === 'night') return 'bg-[#0f172a] text-[#e2e8f0]';
    return 'bg-[#1e1e1e] text-[#d4d4d4]'; // vs-dark
  };

  return (
    <div className="flex flex-col h-full border border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-lg">
      {/* Editor Top Bar */}
      <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 rounded-md font-mono text-cyan-400 font-semibold uppercase text-[11px]">
            <Terminal className="w-3.5 h-3.5" />
            <span>{language}</span>
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Font Size Toggle */}
          <div className="hidden sm:flex items-center space-x-1 bg-slate-800/80 px-2 py-0.5 rounded-md text-[11px]">
            <button
              onClick={() => setCurFontSize(Math.max(12, curFontSize - 1))}
              className="text-slate-400 hover:text-white px-1"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-slate-300 font-mono">{curFontSize}px</span>
            <button
              onClick={() => setCurFontSize(Math.min(20, curFontSize + 1))}
              className="text-slate-400 hover:text-white px-1"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Reset Button */}
          {onReset && (
            <button
              onClick={onReset}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Reset to Starter Code"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Run Code Button */}
          {onRun && (
            <button
              onClick={onRun}
              disabled={isExecuting || isSubmitting}
              className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-colors border border-slate-700 disabled:opacity-50"
              title="Run Code (Ctrl + Enter)"
            >
              <Play className={`w-3.5 h-3.5 text-emerald-400 ${isExecuting ? 'animate-spin' : ''}`} />
              <span>{isExecuting ? 'Running...' : 'Run'}</span>
            </button>
          )}

          {/* Submit Code Button */}
          {onSubmit && (
            <button
              onClick={onSubmit}
              disabled={isExecuting || isSubmitting}
              className="flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-lg text-xs shadow-sm shadow-emerald-500/20 transition-all disabled:opacity-50"
              title="Submit for Evaluation (+4 Points)"
            >
              <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-pulse' : ''}`} />
              <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Code Textarea with Line Numbers */}
      <div className={`relative flex-1 flex overflow-hidden ${getThemeClass()}`}>
        {/* Line Numbers Column */}
        <div
          ref={lineNumbersRef}
          className="select-none py-3 px-2 text-right font-mono text-slate-500 bg-black/20 border-r border-slate-800/60 overflow-hidden shrink-0"
          style={{ fontSize: `${curFontSize}px`, minWidth: '3rem', lineHeight: '1.5' }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-[1.5]">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={syncScroll}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          placeholder={`Write your ${language} code here...`}
          className="flex-1 w-full h-full p-3 bg-transparent outline-none resize-none font-mono leading-[1.5] whitespace-pre overflow-auto"
          style={{ fontSize: `${curFontSize}px` }}
        />
      </div>

      {/* Footer shortcut helper */}
      <div className="px-3 py-1 bg-slate-950 border-t border-slate-900 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">Tab</kbd> for 4 spaces</span>
        <span><kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">Enter</kbd> to Run/Submit</span>
      </div>
    </div>
  );
}
