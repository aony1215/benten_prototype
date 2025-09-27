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
      dispatch({ type: 'addLog', message: 'まずはグラフを更新してから書き出してください。' });
      return;
    }
    setIsExporting(true);
    dispatch({ type: 'addLog', message: `${format.toUpperCase()} 形式でやさしく書き出しています…` });
    try {
      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, model, datasetName: dataset?.name, purpose }),
      });
      if (!response.ok) {
        throw new Error('書き出しに失敗しました');
      }
      const blob = await response.blob();
      downloadBlob(blob, `report-${Date.now()}.${format === 'html' ? 'html' : format}`);
      dispatch({ type: 'addLog', message: `${format.toUpperCase()} の書き出しが完了しました。` });
    } catch (error) {
      console.error(error);
      dispatch({ type: 'addLog', message: `書き出しエラー: ${(error as Error).message}` });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">仕上げと共有</h2>
          <p className="text-sm text-slate-500">PDF・PPTX・HTML の3種類で優しく書き出せます。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => triggerExport('pdf')}
            className="rounded-full border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-900 hover:text-white"
            disabled={isExporting}
          >
            PDFで保存
          </button>
          <button
            onClick={() => triggerExport('pptx')}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
            disabled={isExporting}
          >
            PPTXで保存
          </button>
          <button
            onClick={() => triggerExport('html')}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
            disabled={isExporting}
          >
            HTMLで共有
          </button>
        </div>
      </div>
    </section>
  );
};
