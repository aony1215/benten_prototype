'use client';

import { useMemo, useState } from 'react';
import { DataIngest } from '@/components/report/DataIngest';
import { FieldPicker } from '@/components/report/FieldPicker';
import { ChartGrid } from '@/components/report/ChartGrid';
import { TipsPanel } from '@/components/report/TipsPanel';
import { ExportBar } from '@/components/report/ExportBar';
import { useReportStore } from '@/store/reportStore';
import { getNextStep, getPrevStep, reportSteps } from '@/lib/report/steps';

const stepComponents = {
  ingest: <DataIngest />,
  fields: <FieldPicker />,
  visualize: <ChartGrid />,
  tips: <TipsPanel />,
  output: <ExportBar />,
} as const;

type ReportWizardProps = {
  variant?: 'page' | 'embedded';
};

export const ReportWizard = ({ variant = 'page' }: ReportWizardProps) => {
  const {
    state: { activeStep, dataset, model, result, tips, isRunning },
    dispatch,
    runModel,
  } = useReportStore();
  const [pending, setPending] = useState(false);

  const stepIndex = useMemo(() => reportSteps.findIndex((step) => step.id === activeStep), [activeStep]);
  const currentStep = reportSteps[stepIndex] ?? reportSteps[0];
  const isLastStep = stepIndex === reportSteps.length - 1;

  const canProceed = useMemo(() => {
    switch (activeStep) {
      case 'ingest':
        return Boolean(dataset);
      case 'fields':
        return model.measures.length > 0 || model.dims.length > 0;
      case 'visualize':
        return Boolean(result && result.rows.length > 0);
      case 'tips':
        return tips.length > 0 || !isRunning;
      case 'output':
        return Boolean(result && result.rows.length > 0);
      default:
        return true;
    }
  }, [activeStep, dataset, model.dims.length, model.measures.length, result, tips.length, isRunning]);

  const handleNext = async () => {
    const next = getNextStep(activeStep);
    if (!next) return;
    setPending(true);
    try {
      if (activeStep === 'fields') {
        await runModel();
      }
      dispatch({ type: 'setStep', step: next });
    } finally {
      setPending(false);
    }
  };

  const handlePrev = () => {
    const prev = getPrevStep(activeStep);
    if (!prev) return;
    dispatch({ type: 'setStep', step: prev });
  };

  const containerClass =
    variant === 'page'
      ? 'mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8'
      : 'flex flex-col gap-4';

  const panelClass =
    variant === 'page'
      ? 'rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'
      : 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm';

  const footerClass =
    variant === 'page'
      ? 'flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between'
      : 'flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between';

  return (
    <main className={containerClass}>
      <div className={panelClass}>
        <p className="text-xs font-semibold uppercase text-slate-400">STEP {stepIndex + 1}</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">{currentStep.title}</h2>
        <p className="mt-1 text-sm text-slate-500">{currentStep.subtitle}</p>
      </div>
      <div>{stepComponents[activeStep]}</div>
      <div className={footerClass}>
        <p className="text-sm text-slate-600">
          {isLastStep
            ? 'おつかれさまでした。必要に応じて書き出しメニューをご利用ください。'
            : canProceed
                ? '次のステップに進んで、体験をやさしく積み上げましょう。'
                : '必要な項目をそろえると、次のステップに進めます。'}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={stepIndex === 0 || pending}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            もどる
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed || pending || isLastStep}
            className="rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLastStep ? '完了しました' : '次へすすむ'}
          </button>
        </div>
      </div>
    </main>
  );
};
