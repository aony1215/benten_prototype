'use client'
import Link from 'next/link'
import { Shell } from '@/components/Shell'

const programs = [
  { id: 'pg_bidding', name: '入札最適化プログラム' },
  { id: 'pg_reporting', name: '週次レポート自動化プログラム' },
]

export default function Programs() {
  return (
    <Shell crumbs={[{ href: '/programs', label: 'プログラム一覧' }]}>
      <div className="grid gap-3">
        {programs.map(p => (
          <Link key={p.id} href={`/programs/${p.id}`} className="card p-4 card-hover">
            <div className="font-medium">{p.name}</div>
          </Link>
        ))}
      </div>
    </Shell>
  )
}
