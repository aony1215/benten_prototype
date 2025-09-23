'use client'
import { Shell } from '@/components/Shell'
import { CTA } from '@/components/ui/CTA'

const DATA: Record<string, any> = {
  brd_shoestore: { name: 'ShoeStore', notes: ['CPAが目標より+12%','在庫更新が遅延'] },
  brd_gadgets: { name: 'Gadgets+', notes: ['CVタグの改修予定'] },
}

export default function BrandDetail({ params }: { params: { id: string } }) {
  const b = DATA[params.id] ?? { name: params.id, notes: [] }
  return (
    <Shell crumbs={[{ href: '/brands', label: 'ブランド一覧' }, { href: `/brands/${params.id}`, label: b.name }]}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="kpi">
          <div className="text-sm text-slate-500">KPIカード</div>
          <div className="mt-2 text-sm text-slate-600">CPA / ROAS / 新規比率 など</div>
        </div>
        <div className="kpi">
          <div className="text-sm text-slate-500">今週のRun</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>入札最適化（毎日）</li>
            <li>在庫フィード検証</li>
          </ul>
        </div>
        <div className="kpi">
          <div className="text-sm text-slate-500">アラート</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
            {b.notes.map((n: string, i: number) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      </div>
      <div className="mt-4 card p-4">
        <div className="font-semibold">アクション</div>
        <div className="mt-2 flex flex-wrap gap-2">
          <CTA>新規キャンペーン起案</CTA>
          <CTA>広告文の最適化</CTA>
          <CTA variant="outline">レポート出力</CTA>
        </div>
      </div>
    </Shell>
  )
}
