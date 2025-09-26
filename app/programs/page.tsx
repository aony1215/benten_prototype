'use client'
import Link from 'next/link'
import { HierarchyDetail, Shell } from '@/components/Shell'

const programs = [
  { id: 'prog-bidding', name: '入札最適化プログラム' },
  { id: 'prog-reporting', name: '週次レポート自動化プログラム' },
  { id: 'prog-expansion', name: '国際展開プログラム' },
]

export default function Programs() {
  return (
    <Shell crumbs={[{ href: '/programs', label: 'プログラム一覧' }]}>
      <div className="space-y-8">
        <HierarchyDetail
          emptyState={
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
              中央のプログラム一覧からプログラムを選択すると詳細がここに表示されます。
            </div>
          }
        />
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
      </div>
    </Shell>
  )
}
