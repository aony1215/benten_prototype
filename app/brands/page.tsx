'use client'
import Link from 'next/link'
import { HierarchyDetail, Shell, useHierarchyState } from '@/components/Shell'
import { AddButton } from '@/components/ui/AddButton'
import type { ReactNode } from 'react'

const brands = [
  { id: 'brand-shoestore', name: 'ShoeStore', account: 'A社（Global Retail Inc.）' },
  { id: 'brand-gadgets', name: 'Gadgets+', account: 'A社（Global Retail Inc.）' },
  { id: 'brand-futuretech', name: 'FutureTech Gear', account: 'B社（Tech Starter）' },
]

function SectionPlaceholder({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
      <p>「{title}」セクションの詳細は右側のパネルで確認できます。</p>
      {description ? <p className="mt-2 text-xs text-slate-500">{description}</p> : null}
    </div>
  )
}

function BrandsContent() {
  const { activeSection, navigationItems } = useHierarchyState()
  const sectionKey = activeSection ?? 'list'
  const activeNav = navigationItems.find(item => item.params?.section === sectionKey)
  const sectionLabel = activeNav?.label ?? 'セクション'
  const sectionDescription = activeNav?.description

  let mainContent: ReactNode
  if (sectionKey === 'list') {
    mainContent = (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">ブランド一覧</h2>
          <AddButton href="/brands/new">新規登録</AddButton>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {brands.map(b => (
            <Link key={b.id} href={`/brands/${b.id}`} className="card card-hover flex flex-col gap-1 p-4">
              <div className="font-medium text-slate-900">{b.name}</div>
              <div className="text-sm text-slate-500">{b.account}</div>
            </Link>
          ))}
        </div>
      </section>
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

export default function Brands() {
  return (
    <Shell crumbs={[{ href: '/brands', label: 'ブランド一覧' }]}>
      <BrandsContent />
    </Shell>
  )
}
