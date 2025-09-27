'use client'
import { HierarchyDetail, Shell, useHierarchyState } from '@/components/Shell'
import { CTA } from '@/components/ui/CTA'
import type { ReactNode } from 'react'

type BrandSnapshot = {
  name: string
  notes: string[]
}

const DATA: Record<string, BrandSnapshot> = {
  brd_shoestore: { name: 'ShoeStore', notes: ['CPAが目標より+12%', '在庫更新が遅延'] },
  brd_gadgets: { name: 'Gadgets+', notes: ['CVタグの改修予定'] },
  brd_futuretech: { name: 'FutureTech Gear', notes: ['新商品のローンチ準備', '在庫連携テスト進行中'] },
}

export default function BrandDetail({ params }: { params: { id: string } }) {
  const snapshot: BrandSnapshot = DATA[params.id] ?? { name: params.id, notes: [] }
  return (
    <Shell crumbs={[{ href: '/brands', label: 'ブランド一覧' }, { href: `/brands/${params.id}`, label: snapshot.name }]}>
      <BrandDetailContent snapshot={snapshot} />
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

function BrandDetailContent({ snapshot }: { snapshot: BrandSnapshot }) {
  const { activeSection, navigationItems } = useHierarchyState()
  const sectionKey = activeSection ?? 'overview'
  const activeNav = navigationItems.find(item => item.params?.section === sectionKey)
  const sectionLabel = activeNav?.label ?? 'セクション'
  const sectionDescription = activeNav?.description

  let mainContent: ReactNode
  if (sectionKey === 'overview') {
    mainContent = (
      <div className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">KPIカード</div>
            <div className="mt-2 text-sm text-slate-600">CPA / ROAS / 新規比率 など</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">今週のRun</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>入札最適化（毎日）</li>
              <li>在庫フィード検証</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">アラート</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {snapshot.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
              {snapshot.notes.length === 0 ? <li>特筆すべきアラートはありません</li> : null}
            </ul>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="font-semibold">アクション</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <CTA>新規キャンペーン起案</CTA>
            <CTA>広告文の最適化</CTA>
            <CTA variant="outline">レポート出力</CTA>
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
