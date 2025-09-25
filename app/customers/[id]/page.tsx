'use client'
import Link from 'next/link'
import { Shell } from '@/components/Shell'
import { CTA } from '@/components/ui/CTA'
import { ChevronRight } from 'lucide-react'
import { CUSTOMER_DATA, formatJPY } from '@/app/customers/data'
import { useRouter } from 'next/navigation'

export default function CustomerDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const c = CUSTOMER_DATA[params.id] ?? { name: params.id, kpi: {}, contract: {}, issues: [], projects: [] }
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
          <CTA onClick={() => router.push(`/customers/${params.id}/reporting`)}>レポーティング開始</CTA>
          <CTA variant="outline" onClick={() => alert('新プロジェクト作成（デモ）')}>新プロジェクト作成</CTA>
        </div>
      </div>

      <div className="mt-4 card p-4">
        <div className="font-semibold">関連プロジェクト</div>
        <div className="mt-2 grid gap-2">
          {c.projects.map((p: any) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-150 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
            >
              <span>{p.name}</span>
              <ChevronRight className="h-4 w-4 text-slate-400 transition-colors duration-150 group-hover:text-indigo-500" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </Shell>
  )
}
