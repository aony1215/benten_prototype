'use client';

import { useEffect, useMemo } from 'react';
import { useReportStore } from '@/store/reportStore';
import { ChartCard } from '@/components/report/ChartCard';

export const ChartGrid = () => {
  const {
    state: { result, previousResult, diffMode, model, dataset, isRunning, comments },
    runModel,
    dispatch,
  } = useReportStore();

  const modelKey = useMemo(
    () =>
      JSON.stringify({
        dims: model.dims,
        measures: model.measures,
        filters: model.filters,
        sort: model.sort,
        limit: model.limit,
      }),
    [model]
  );

  useEffect(() => {
    if (!dataset) return;
    if (model.measures.length === 0 && model.dims.length === 0) return;
    runModel();
  }, [dataset, modelKey, runModel]);

  const title = model.measures.length
    ? `${model.measures.map((measure) => measure.name).join('・')} × ${model.dims.map((dim) => dim.name).join('・') || '全体'}`
    : 'プレビュー';

  const commentKey = `chart-${title}`;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">グラフで傾向をやさしく確認</h2>
          <p className="text-sm text-slate-500">結果は楽観的に先回り表示。体感レスポンス 0.5 秒以内を目指しています。</p>
        </div>
        <div className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
          {dataset ? `使用中: ${dataset.name}` : 'データセット未選択'}
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-1">
        <ChartCard
          title={title}
          result={result}
          comparison={diffMode ? previousResult : undefined}
          loading={isRunning}
          comment={comments[commentKey]}
          onCommentChange={(value) => dispatch({ type: 'updateComments', id: commentKey, text: value })}
        />
      </div>
    </section>
  );
};
