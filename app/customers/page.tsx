'use client'
import Link from 'next/link'
import { Shell } from '@/components/Shell'
import { AddButton } from '@/components/ui/AddButton'

const customers = [
  { id: 'cust-global-retail', name: 'A社（Global Retail Inc.）', website: 'https://www.globalretail.example' },
  { id: 'cust-tech-starter', name: 'B社（Tech Starter）', website: 'https://www.techstarter.example' },
]

export default function Customers() {
  return (
    <Shell crumbs={[{ href: '/customers', label: '顧客一覧' }]}>
      <div className="space-y-8">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">顧客一覧</h2>
            <AddButton href="/customers/new">新規登録</AddButton>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {customers.map(c => (
              <Link key={c.id} href={`/customers/${c.id}`} className="card card-hover flex flex-col gap-1 p-4">
                <div className="font-medium text-slate-900">{c.name}</div>
                <div className="text-sm text-slate-500">{c.website}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  )
}
