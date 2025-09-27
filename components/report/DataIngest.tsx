'use client';

import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { useReportStore } from '@/store/reportStore';
import { DatasetInfo } from '@/types/report';

const sampleDatasets = [
  {
    id: 'sample-csv',
    label: '広告サマリー（CSV）',
    url: '/data/sample.csv',
  },
  {
    id: 'sample-parquet',
    label: '広告サマリー（Parquet）',
    url: '/data/sample.parquet',
  },
];

export const DataIngest = () => {
  const {
    state: { logs, client },
    dispatch,
  } = useReportStore();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDatasetLoaded = (dataset: DatasetInfo) => {
    dispatch({ type: 'setDataset', dataset });
    dispatch({ type: 'setAvailableFields', fields: dataset.columns });
  };

  const parseFileList = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const [file] = Array.from(files);
    dispatch({ type: 'addLog', message: `${file.name} をやさしく読み込みます…` });
    let dataset: DatasetInfo;
    if (file.name.endsWith('.csv')) {
      dataset = await client.loadCsvFile(file);
    } else if (file.name.endsWith('.parquet') || file.name.endsWith('.pq')) {
      dataset = await client.loadParquetFile(file);
    } else {
      dataset = await client.loadCsvFile(file);
    }
    handleDatasetLoaded(dataset);
  };

  const onDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    await parseFileList(event.dataTransfer.files);
  };

  const onSelectSample = async (url: string, label: string) => {
    dispatch({ type: 'addLog', message: `${label} を読み込み中です。` });
    const dataset = await client.loadFromUrl(url, label);
    handleDatasetLoaded(dataset);
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    parseFileList(event.target.files);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">ファイルやサンプルを準備しましょう</h2>
          <p className="text-sm text-slate-500">CSV / Parquet をそのままドラッグ＆ドロップ。サンプルもご利用いただけます。</p>
        </div>
        <div className="flex gap-2">
          {sampleDatasets.map((dataset) => (
            <button
              key={dataset.id}
              onClick={() => onSelectSample(dataset.url, dataset.label)}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-slate-300"
            >
              {dataset.label}
            </button>
          ))}
        </div>
      </div>
      <div
        className={`mt-4 flex h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed transition ${
          isDragging ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" className="hidden" onChange={onFileChange} accept=".csv,.parquet,.pq" />
        <p className="text-sm font-medium text-slate-700">ファイルをここにドロップ、またはクリックして選択</p>
        <p className="text-xs text-slate-500">CSV / Parquet / Arrow (デモ) に対応しています</p>
      </div>
      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase text-slate-500">進行メモ</h3>
        <div className="mt-2 max-h-28 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
          {logs.length === 0 && <p>まだ記録はありません。データを読み込むと状況がここに表示されます。</p>}
          {logs.map((log, index) => (
            <p key={`${log}-${index}`} className="mb-1 last:mb-0">
              {log}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};
