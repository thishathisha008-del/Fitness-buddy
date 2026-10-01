import React, { useState } from 'react';
import { ShieldAlert, X, ChevronDown, ChevronUp } from 'lucide-react';

export const MedicalDisclaimerBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-slate-900/95 border-b border-amber-500/20 px-4 py-2.5 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="truncate">
            <span className="font-semibold text-amber-300">Medical & Safety Notice:</span> FitBuddy AI generates informational fitness & nutrition recommendations only. Not a substitute for medical advice or certified clinical care.
          </p>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-amber-400 hover:text-amber-300 underline font-medium shrink-0 flex items-center gap-0.5"
          >
            {isExpanded ? 'Less' : 'Read details'}
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors"
          aria-label="Dismiss disclaimer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800 text-slate-400 space-y-1">
          <p>
            Always consult a physician or licensed healthcare provider before beginning any strenuous workout routine or altering your diet, especially if you have pre-existing cardiovascular conditions, joint injuries, pregnancy, or metabolic disorders.
          </p>
          <p>
            If you experience sharp pain, dizziness, lightheadedness, or shortness of breath during any exercise, stop immediately and seek medical attention.
          </p>
        </div>
      )}
    </div>
  );
};
