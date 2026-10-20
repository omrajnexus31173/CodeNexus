import React from 'react';

interface FlowchartProps {
  svgContent?: string;
  title?: string;
}

export default function FlowchartDiagram({ svgContent, title = 'Concept Flowchart' }: FlowchartProps) {
  if (!svgContent) return null;

  return (
    <div className="my-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-inner">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>{title}</span>
        </span>
        <span className="text-[10px] text-slate-500 font-mono">Visual Logic Flow</span>
      </div>

      <div
        className="overflow-x-auto flex justify-center py-2 text-slate-200"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
}
