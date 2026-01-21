
import React from 'react';
import { ScriptSection } from '../types';

interface NarrativeCardProps {
  section: ScriptSection;
  isActive: boolean;
}

export const NarrativeCard: React.FC<NarrativeCardProps> = ({ section, isActive }) => {
  return (
    <div 
      className={`p-6 border-l-2 transition-all duration-700 transform ${
        isActive 
          ? 'border-amber-600 bg-amber-950/20 translate-x-2' 
          : 'border-white/10 opacity-40 grayscale'
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs cinzel tracking-widest text-amber-500 uppercase">{section.label}</span>
        <span className="text-xs font-mono text-white/40">{section.timeframe}</span>
      </div>
      <p className="text-xl md:text-2xl leading-relaxed italic text-white/90">
        {section.text}
      </p>
    </div>
  );
};
