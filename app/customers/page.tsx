'use client'
import Link from 'next/link'
import { Shell } from '@/components/Shell'

const customers = [
  { id: 'acc_globalretail', name: 'A社（Global Retail Inc.）', website: 'https://www.globalretail.example' },
  { id: 'acc_techstarter', name: 'B社（Tech Starter）', website: 'https://www.techstarter.example' },
]

export default function Customers() {
  return (
    <Shell crumbs={[{ href: '/customers', label: '顧客一覧' }]}>
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-semibold">顧客一覧</h1>
        <Link href="/customers/new" className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50">新規登録</Link>
      </div>
      <div className="grid gap-3">
        {customers.map(c => (
          <Link key={c.id} href={`/customers/${c.id}`} className="card p-4 card-hover">
            <div className="font-medium">{c.name}</div>
            <div className="text-sm text-slate-500">{c.website}</div>
          </Link>
        ))}
      </div>
    </Shell>
  )
}
