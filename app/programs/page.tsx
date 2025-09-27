'use client'
import Link from 'next/link'
import { HierarchyDetail, Shell, useHierarchyState } from '@/components/Shell'
import type { ReactNode } from 'react'

const programs = [
  { id: 'prog-bidding', name: '入札最適化プログラム' },
  { id: 'prog-reporting', name: '週次レポート自動化プログラム' },
  { id: 'prog-expansion', name: '国際展開プログラム' },
]

function SectionPlaceholder({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
      <p>「{title}」セクションの詳細は右側のパネルで確認できます。</p>
      {description ? <p className="mt-2 text-xs text-slate-500">{description}</p> : null}
    </div>
  )
}

function ProgramsContent() {
  const { activeSection, navigationItems } = useHierarchyState()
  const sectionKey = activeSection ?? 'list'
  const activeNav = navigationItems.find(item => item.params?.section === sectionKey)
  const sectionLabel = activeNav?.label ?? 'セクション'
  const sectionDescription = activeNav?.description

  let mainContent: ReactNode
  if (sectionKey === 'list') {
    mainContent = (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">プログラム一覧</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {programs.map(p => (
            <Link key={p.id} href={`/programs/${p.id}`} className="card card-hover flex flex-col gap-1 p-4">
              <div className="font-medium text-slate-900">{p.name}</div>
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

export default function Programs() {
  return (
    <Shell crumbs={[{ href: '/programs', label: 'プログラム一覧' }]}>
      <ProgramsContent />
    </Shell>
  )
}
