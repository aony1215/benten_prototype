'use client'
import Link from 'next/link'
import { HierarchyDetail, Shell } from '@/components/Shell'

const programs = [
  { id: 'pg_bidding', name: '入札最適化プログラム' },
  { id: 'pg_reporting', name: '週次レポート自動化プログラム' },
]

export default function Programs() {
  return (
    <Shell crumbs={[{ href: '/programs', label: 'プログラム一覧' }]}>
      <div className="space-y-8">
        <HierarchyDetail />
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">プログラムライブラリ</h2>
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
