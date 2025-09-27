'use client';

import { useState } from 'react';
import { useReportStore } from '@/store/reportStore';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const ExportBar = () => {
  const {
    state: { result, model, dataset, purpose },
    dispatch,
  } = useReportStore();
  const [isExporting, setIsExporting] = useState(false);

  const triggerExport = async (format: 'pdf' | 'pptx' | 'html') => {
    if (!result) {
      dispatch({ type: 'addLog', message: 'Run the model before exporting.' });
      return;
    }
    setIsExporting(true);
    dispatch({ type: 'addLog', message: `Exporting ${format.toUpperCase()}…` });
    try {
      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, model, datasetName: dataset?.name, purpose }),
      });
      if (!response.ok) {
        throw new Error('Export failed');
      }
      const blob = await response.blob();
      downloadBlob(blob, `report-${Date.now()}.${format === 'html' ? 'html' : format}`);
      dispatch({ type: 'addLog', message: `${format.toUpperCase()} ready` });
    } catch (error) {
      console.error(error);
      dispatch({ type: 'addLog', message: `Export failed: ${(error as Error).message}` });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">5. Output</h2>
          <p className="text-sm text-slate-500">Generate PDF, PPTX, or shareable HTML snapshots.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => triggerExport('pdf')}
            className="rounded-full border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-900 hover:text-white"
            disabled={isExporting}
          >
            Export PDF
          </button>
          <button
            onClick={() => triggerExport('pptx')}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
            disabled={isExporting}
          >
            Export PPTX
          </button>
          <button
            onClick={() => triggerExport('html')}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
            disabled={isExporting}
          >
            Export HTML
          </button>
        </div>
      </div>
    </section>
  );
};
