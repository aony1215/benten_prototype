'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, X } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { CTA } from '@/components/ui/CTA';
import { ReportProvider } from '@/store/reportStore';
import { ReportWizard } from '@/components/report/ReportWizard';
import type { Crumb } from '@/components/Breadcrumbs';
import type { KpiDef, TipRule } from '@/types/report';

type ProjectSummary = {
  id: string;
  name: string;
};

type ContractSummary = {
  budget?: number;
  consumed?: number;
};

type CustomerSnapshot = {
  name: string;
  kpi: { cpa?: number; roas?: number; progress?: number };
  contract: ContractSummary;
  issues: string[];
  projects: ProjectSummary[];
};

type CustomerDetailClientProps = {
  crumbs: Crumb[];
  customer: CustomerSnapshot;
  kpis: KpiDef[];
  tipRules: TipRule[];
};

const formatJPY = (n: number) =>
  new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(n);

export const CustomerDetailClient = ({ crumbs, customer, kpis, tipRules }: CustomerDetailClientProps) => {
  const [showWizard, setShowWizard] = useState(false);

  const { progressPct, budgetLabel, consumedLabel } = useMemo(() => {
    const consumption = customer.contract?.consumed ?? 0;
    const budget = customer.contract?.budget ?? 1;
    const rate = Math.min(1, Math.max(0, budget === 0 ? 0 : consumption / budget));
    return {
      progressPct: Math.round(rate * 100),
      budgetLabel: customer.contract?.budget != null ? formatJPY(customer.contract.budget) : '—',
      consumedLabel: customer.contract?.consumed != null ? formatJPY(customer.contract.consumed) : '—',
    };
  }, [customer.contract]);

  return (
    <Shell crumbs={crumbs}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="kpi">
          <div className="text-sm text-slate-500">課題リスト</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {customer.issues.length > 0 ? (
              customer.issues.map((it, index) => <li key={index}>{it}</li>)
            ) : (
              <li>特筆すべき課題はありません</li>
            )}
          </ul>
        </div>
        <div className="kpi">
          <div className="text-sm text-slate-500">契約状況</div>
          <div className="mt-2 text-sm">契約金額：{budgetLabel}</div>
          <div className="text-sm">
            消化額：{consumedLabel} <span className="text-slate-500">（{progressPct}%）</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-2 bg-indigo-600" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div className="kpi">
          <div className="text-sm text-slate-500">KPI達成率</div>
          <div className="mt-2 text-2xl font-semibold">{Math.round((customer.kpi.progress ?? 0) * 100)}%</div>
          <div className="text-xs text-slate-500">CPA: {customer.kpi.cpa ?? '—'} / ROAS: {customer.kpi.roas ?? '—'}</div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="font-semibold">アクション</div>
            <p className="mt-1 text-sm text-slate-600">
              このセクションではデータ取り込みから可視化、ヒント確認、書き出しまでを一息で進められます。
            </p>
          </div>
          {showWizard && (
            <button
              type="button"
              onClick={() => setShowWizard(false)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              閉じる
            </button>
          )}
        </div>

        {!showWizard ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <CTA onClick={() => alert('提案書最適化（デモ）')}>提案書最適化</CTA>
            <CTA onClick={() => setShowWizard(true)}>レポーティング開始</CTA>
            <CTA variant="outline" onClick={() => alert('新プロジェクト作成（デモ）')}>
              新プロジェクト作成
            </CTA>
          </div>
        ) : (
          <div className="mt-4">
            <div className="text-xs font-medium uppercase text-slate-400">Report Run</div>
            <p className="mt-1 text-sm text-slate-500">
              取り込み → フィールド選択 → チャート → ヒント → 出力を順番に進めましょう。
            </p>
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <ReportProvider kpis={kpis} tipRules={tipRules}>
                <ReportWizard variant="embedded" />
              </ReportProvider>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="font-semibold">関連プロジェクト</div>
        <div className="mt-2 grid gap-2">
          {customer.projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-150 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
            >
              <span>{project.name}</span>
              <ChevronRight
                className="h-4 w-4 text-slate-400 transition-colors duration-150 group-hover:text-indigo-500"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </Shell>
  );
};

