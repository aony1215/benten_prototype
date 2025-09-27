'use client';

import { useMemo } from 'react';
import { QueryResult } from '@/types/report';

interface ChartCardProps {
  title: string;
  result?: QueryResult;
  comparison?: QueryResult;
  loading?: boolean;
  comment?: string;
  onCommentChange?: (value: string) => void;
}

const barColors = ['#0f172a', '#2563eb', '#7c3aed', '#0ea5e9'];

const buildSeries = (result?: QueryResult) => {
  if (!result || result.rows.length === 0) return [] as Array<{ label: string; value: number; series: string }>;
  const measureColumns = result.columns.filter((column) => typeof result.rows[0][column] === 'number');
  const series: Array<{ label: string; value: number; series: string }> = [];
  result.rows.slice(0, 10).forEach((row) => {
    const label = result.columns.find((column) => typeof row[column] !== 'number') ?? result.columns[0];
    measureColumns.forEach((column, idx) => {
      const value = Number(row[column] ?? 0);
      series.push({ label: String(row[label] ?? `Row ${idx}`), value, series: column });
    });
  });
  return series;
};

export const ChartCard = ({ title, result, comparison, loading, comment, onCommentChange }: ChartCardProps) => {
  const currentSeries = useMemo(() => buildSeries(result), [result]);
  const comparisonSeries = useMemo(() => buildSeries(comparison), [comparison]);

  const maxValue = useMemo(() => {
    const values = [...currentSeries, ...comparisonSeries].map((item) => item.value);
    return values.length ? Math.max(...values) : 1;
  }, [currentSeries, comparisonSeries]);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {loading && <p className="text-xs text-slate-500">最新の結果を反映しています…</p>}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          {currentSeries.length === 0 && !loading && <p className="text-sm text-slate-500">まだ表示できるデータがありません。</p>}
          {currentSeries.slice(0, 8).map((item, index) => (
            <div key={`${item.label}-${item.series}`} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span>{item.label}</span>
                <span>{item.value.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (item.value / maxValue) * 100)}%`,
                    backgroundColor: barColors[index % barColors.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {comparisonSeries.length > 0 ? (
            comparisonSeries.slice(0, 8).map((item, index) => (
              <div key={`${item.label}-${item.series}`} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                  <span>{item.label}</span>
                  <span>{item.value.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (item.value / maxValue) * 100)}%`,
                      backgroundColor: barColors[(index + 1) % barColors.length],
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
              比較モードをオンにすると、ひとつ前の結果と並べて確認できます。
            </div>
          )}
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase text-slate-500">表形式で確認</h4>
        <div className="mt-2 overflow-x-auto rounded-xl border border-slate-100">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {result?.columns.map((column) => (
                  <th key={column} className="px-3 py-2 text-left font-medium">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result?.rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="bg-white hover:bg-slate-50">
                  {result.columns.map((column) => (
                    <td key={column} className="px-3 py-2 text-slate-600">
                      {typeof row[column] === 'number'
                        ? Number(row[column]).toLocaleString(undefined, { maximumFractionDigits: 2 })
                        : String(row[column] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase text-slate-500">ひとことメモ</h4>
        <textarea
          value={comment ?? ''}
          onChange={(event) => onCommentChange?.(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
          placeholder="気づきや共有したいメッセージをどうぞ（この端末だけに保存されます）。"
          rows={3}
        />
      </div>
    </div>
  );
};
