'use client';

import { useMemo } from 'react';
import { useReportStore } from '@/store/reportStore';
import { ReportPurpose } from '@/types/report';
import clsx from 'clsx';
import { reportSteps } from '@/lib/report/steps';

const purposeTokens: Record<ReportPurpose, string> = {
  QBR: 'from-indigo-400 to-indigo-600',
  Proposal: 'from-emerald-400 to-emerald-600',
  Incident: 'from-amber-400 to-rose-500',
};

const purposeLabels: Record<ReportPurpose, string> = {
  QBR: '四半期レビュー',
  Proposal: '提案づくり',
  Incident: 'インシデント対応',
};

export const ReportHeader = () => {
  const {
    state: { purpose, diffMode, isRunning, activeStep },
    dispatch,
    runModel,
  } = useReportStore();

  const gradient = useMemo(() => purposeTokens[purpose], [purpose]);

  const updatePurpose = (next: ReportPurpose) => {
    dispatch({ type: 'setPurpose', purpose: next });
    dispatch({
      type: 'addLog',
      message: `レポート目的を「${purposeLabels[next]}」に切り替えました。`,
    });
    runModel();
  };

  return (
    <header className="sticky top-0 z-20 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">やさしいレポートづくりウィザード</h1>
            <p className="text-sm text-slate-500">取り込みから共有まで、ひと息で伴走します。</p>
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
                {purposeLabels[token]}
              </button>
            ))}
            <button
              onClick={() => dispatch({ type: 'toggleDiff', diff: !diffMode })}
              className={clsx(
                'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                diffMode ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'
              )}
            >
              {diffMode ? '比較モード: ON' : '比較モード: OFF'}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {reportSteps.map((step, idx) => {
            const isActive = step.id === activeStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => dispatch({ type: 'setStep', step: step.id })}
                className="group flex max-w-xs flex-1 items-center gap-3 rounded-2xl border border-transparent px-2 py-2 text-left transition hover:border-slate-200"
              >
                <div
                  className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold shadow-sm transition',
                    isActive
                      ? `bg-gradient-to-br ${gradient} text-white`
                      : 'bg-white text-slate-500'
                  )}
                >
                  {idx + 1}
                </div>
                <div className="flex flex-col">
                  <span className={clsx('text-sm', isActive ? 'font-semibold text-slate-900' : 'text-slate-600')}>
                    {step.title}
                  </span>
                  <span className="text-xs text-slate-400">{step.subtitle}</span>
                </div>
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            {isRunning ? '集計中…' : '即時反映'}
          </div>
        </div>
      </div>
    </header>
  );
};
