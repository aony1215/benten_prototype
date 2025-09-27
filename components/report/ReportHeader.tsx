'use client';

import { useMemo } from 'react';
import { useReportStore } from '@/store/reportStore';
import { ReportPurpose } from '@/types/report';
import clsx from 'clsx';

const steps = ['Ingest', 'Fields', 'Visualize', 'Tips', 'Output'];

const purposeTokens: Record<ReportPurpose, string> = {
  QBR: 'from-indigo-400 to-indigo-600',
  Proposal: 'from-emerald-400 to-emerald-600',
  Incident: 'from-amber-400 to-rose-500',
};

export const ReportHeader = () => {
  const {
    state: { purpose, diffMode, isRunning },
    dispatch,
    runModel,
  } = useReportStore();

  const gradient = useMemo(() => purposeTokens[purpose], [purpose]);

  const updatePurpose = (next: ReportPurpose) => {
    dispatch({ type: 'setPurpose', purpose: next });
    dispatch({ type: 'addLog', message: `Purpose switched to ${next}` });
    runModel();
  };

  return (
    <header className="sticky top-0 z-20 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Immersive Report Builder</h1>
            <p className="text-sm text-slate-500">Assemble ingest → analyze → output in minutes.</p>
          </div>
          <div className="flex items-center gap-2">
            {(['QBR', 'Proposal', 'Incident'] as ReportPurpose[]).map((token) => (
              <button
                key={token}
                onClick={() => updatePurpose(token)}
                className={clsx(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  purpose === token
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {token}
              </button>
            ))}
            <button
              onClick={() => dispatch({ type: 'toggleDiff', diff: !diffMode })}
              className={clsx(
                'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                diffMode ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'
              )}
            >
              {diffMode ? 'Diff ON' : 'Diff OFF'}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {steps.map((step, idx) => (
            <div key={step} className="flex items-center gap-2 text-sm text-slate-600">
              <div
                className={clsx(
                  'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold shadow-sm',
                  `bg-gradient-to-br ${gradient} text-white`
                )}
              >
                {idx + 1}
              </div>
              <span className="whitespace-nowrap">{step}</span>
              {idx < steps.length - 1 && <div className="h-px w-12 bg-slate-200" />}
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {isRunning ? 'Running query…' : 'Live'}
          </div>
        </div>
      </div>
    </header>
  );
};
