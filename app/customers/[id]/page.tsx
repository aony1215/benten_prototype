'use client'
import Link from 'next/link'
import { Shell } from '@/components/Shell'
import { CTA } from '@/components/ui/CTA'

// Demo data
const DATA: Record<string, any> = {
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
  const c = DATA[params.id] ?? { name: params.id, kpi:{}, contract:{}, issues:[], projects:[] }
  const crumbs = [
    { href: '/customers', label: '顧客一覧' },
    { href: `/customers/${params.id}`, label: c.name },
  ]
  const consumption = c.contract?.consumed ?? 0
  const budget = c.contract?.budget ?? 1
  const rate = Math.min(1, Math.max(0, consumption / budget))
  const pct = Math.round(rate * 100)

  return (
    <Shell crumbs={crumbs}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="kpi">
          <div className="text-sm text-slate-500">課題リスト</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
            {c.issues.map((it: string, i: number) => <li key={i}>{it}</li>)}
            {c.issues.length === 0 && <li>特筆すべき課題はありません</li>}
          </ul>
        </div>
        <div className="kpi">
          <div className="text-sm text-slate-500">契約状況</div>
          <div className="mt-2 text-sm">契約金額：{formatJPY(budget)}</div>
          <div className="text-sm">消化額：{formatJPY(consumption)} <span className="text-slate-500">（{pct}%）</span></div>
          <div className="mt-2 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-2 bg-indigo-600" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="kpi">
          <div className="text-sm text-slate-500">KPI達成率</div>
          <div className="mt-2 text-2xl font-semibold">{Math.round((c.kpi.progress ?? 0) * 100)}%</div>
          <div className="text-xs text-slate-500">CPA: {c.kpi.cpa ?? '—'} / ROAS: {c.kpi.roas ?? '—'}</div>
        </div>
      </div>

      <div className="mt-4 card p-4">
        <div className="font-semibold">アクション</div>
        <div className="mt-2 flex flex-wrap gap-2">
          <CTA onClick={() => alert('提案書最適化（デモ）')}>提案書最適化</CTA>
          <CTA onClick={() => alert('レポーティング開始（デモ）')}>レポーティング開始</CTA>
          <CTA variant="outline" onClick={() => alert('新プロジェクト作成（デモ）')}>新プロジェクト作成</CTA>
        </div>
      </div>

      <div className="mt-4 card p-4">
        <div className="font-semibold">関連プロジェクト</div>
        <div className="mt-2 grid gap-2">
          {c.projects.map((p: any) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-sm">{p.name}</Link>
          ))}
        </div>
      </div>
    </Shell>
  )
}
