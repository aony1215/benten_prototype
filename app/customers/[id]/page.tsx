'use client'
import Link from 'next/link'
import { HierarchyDetail, Shell, useHierarchyState } from '@/components/Shell'
import { CTA } from '@/components/ui/CTA'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

// Demo data
type CustomerSnapshot = {
  name: string
  kpi: { cpa?: number; roas?: number; progress?: number }
  contract: { budget?: number; consumed?: number }
  issues: string[]
  projects: Array<{ id: string; name: string }>
}

const DATA: Record<string, CustomerSnapshot> = {
  acc_globalretail: {
    name: 'A社（Global Retail Inc.）',
    kpi: { cpa: 1200, roas: 2.1, progress: 0.76 },
    contract: { budget: 2000000, consumed: 1260000 },
    issues: ['計測欠損の可能性（LP遷移率急落）', '在庫データの遅延', '検索キャンペーンで学習リセット頻発'],
    projects: [{ id:'prj_x', name:'プロジェクトX' }, { id:'prj_q4', name:'Q4 週次レポート自動化' }]
  },
  acc_techstarter: {
    name: 'B社（Tech Starter）',
    kpi: { cpa: 8400, roas: 1.6, progress: 0.42 },
    contract: { budget: 1500000, consumed: 380000 },
    issues: ['CV計測差分（MAとGAのズレ）'],
    projects: [
      { id: 'prj_y', name: 'ブランド新規獲得強化' },
      { id: 'prj_launch', name: '新商品ローンチ支援' },
    ],
  }
}

function formatJPY(n: number) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(n)
}

export default function CustomerDetail({ params }: { params: { id: string } }) {
  const snapshot: CustomerSnapshot =
    DATA[params.id] ?? { name: params.id, kpi: {}, contract: {}, issues: [], projects: [] }
  const crumbs = [
    { href: '/customers', label: '顧客一覧' },
    { href: `/customers/${params.id}`, label: snapshot.name },
  ]

  return (
    <Shell crumbs={crumbs}>
      <CustomerDetailContent snapshot={snapshot} />
    </Shell>
  )
}

function SectionPlaceholder({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
      <p>「{title}」セクションの詳細は右側のパネルで確認できます。</p>
      {description ? <p className="mt-2 text-xs text-slate-500">{description}</p> : null}
    </div>
  )
}

function CustomerDetailContent({ snapshot }: { snapshot: CustomerSnapshot }) {
  const { activeSection, navigationItems } = useHierarchyState()
  const sectionKey = activeSection ?? 'overview'
  const activeNav = navigationItems.find(item => item.params?.section === sectionKey)
  const sectionLabel = activeNav?.label ?? 'セクション'
  const sectionDescription = activeNav?.description

  const consumption = snapshot.contract?.consumed ?? 0
  const budget = snapshot.contract?.budget ?? 1
  const rate = Math.min(1, Math.max(0, consumption / budget))
  const pct = Math.round(rate * 100)

  let mainContent: ReactNode
  if (sectionKey === 'overview') {
    mainContent = (
      <div className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">課題リスト</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
              {snapshot.issues.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
              {snapshot.issues.length === 0 && <li>特筆すべき課題はありません</li>}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">契約状況</div>
            <div className="mt-2 text-sm">契約金額：{formatJPY(budget)}</div>
            <div className="text-sm">
              消化額：{formatJPY(consumption)} <span className="text-slate-500">（{pct}%）</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-2 bg-indigo-600" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">KPI達成率</div>
            <div className="mt-2 text-2xl font-semibold">{Math.round((snapshot.kpi.progress ?? 0) * 100)}%</div>
            <div className="text-xs text-slate-500">
              CPA: {snapshot.kpi.cpa ?? '—'} / ROAS: {snapshot.kpi.roas ?? '—'}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="font-semibold">アクション</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <CTA onClick={() => alert('提案書最適化（デモ）')}>提案書最適化</CTA>
            <CTA onClick={() => alert('レポーティング開始（デモ）')}>レポーティング開始</CTA>
            <CTA variant="outline" onClick={() => alert('新プロジェクト作成（デモ）')}>
              新プロジェクト作成
            </CTA>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="font-semibold">関連プロジェクト</div>
          <div className="mt-2 grid gap-2">
            {snapshot.projects.map(project => (
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
            {snapshot.projects.length === 0 ? (
              <p className="text-sm text-slate-500">関連プロジェクトはまだ登録されていません。</p>
            ) : null}
          </div>
        </div>
      </div>
    )
  } else {
    mainContent = (
      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">{sectionLabel}</h2>
          {sectionDescription ? <p className="text-sm text-slate-500">{sectionDescription}</p> : null}
        </div>
        <SectionPlaceholder title={sectionLabel} description={sectionDescription} />
      </section>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-8">{mainContent}</div>
      <HierarchyDetail />
    </div>
  )
}
