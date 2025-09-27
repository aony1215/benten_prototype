'use client';

import { useMemo } from 'react';
import { useReportStore } from '@/store/reportStore';
import { ReportPurpose } from '@/types/report';

const purposeLabels: Record<ReportPurpose, string> = {
  QBR: '四半期レビュー',
  Proposal: '提案づくり',
  Incident: 'インシデント対応',
};

export const TipsPanel = () => {
  const {
    state: { tips, kpis, kpiSelections, purpose },
    applyTip,
    dispatch,
  } = useReportStore();

  const groupedTips = useMemo(() => {
    return tips.reduce<Record<string, typeof tips>>((acc, tip) => {
      const key = tip.when.purpose ?? 'general';
      acc[key] = acc[key] ? [...acc[key], tip] : [tip];
      return acc;
    }, {});
  }, [tips]);

  const toggleKpi = (id: string) => {
    const next = kpiSelections.includes(id)
      ? kpiSelections.filter((item) => item !== id)
      : [...kpiSelections, id];
    dispatch({ type: 'setKpiSelections', ids: next });
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">おすすめのヒント（虎の巻）</h2>
          <p className="text-sm text-slate-500">レポートの目的と選んだ指標に合わせて、次の一手をそっとご提案します。</p>
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
          モード: {purposeLabels[purpose]}
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase text-slate-500">注目したい KPI</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {kpis.map((kpi) => {
            const active = kpiSelections.includes(kpi.id);
            return (
              <button
                key={kpi.id}
                onClick={() => toggleKpi(kpi.id)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {kpi.title}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {Object.entries(groupedTips).map(([group, groupTips]) => (
          <div key={group} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <h4 className="text-xs font-semibold uppercase text-slate-500">{group === 'general' ? '全体へのヒント' : group}</h4>
            <div className="mt-3 space-y-3">
              {groupTips.map((tip) => (
                <div
                  key={tip.id}
                  className="flex items-center justify-between rounded-xl bg-white p-3 text-sm text-slate-700 shadow-sm"
                >
                  <div>
                    <p className="font-medium">{tip.suggest.label}</p>
                    <p className="text-xs text-slate-500">アクション: {tip.suggest.action}</p>
                  </div>
                  <button
                    onClick={() => applyTip(tip)}
                    className="rounded-full border border-slate-900 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-slate-900 hover:text-white"
                  >
                    反映する
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {tips.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-500">
            データとKPIを選ぶと、ぴったりのヒントがここに届きます。
          </div>
        )}
      </div>
    </section>
  );
};
