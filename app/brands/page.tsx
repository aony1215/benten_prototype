'use client'
import Link from 'next/link'
import { HierarchyDetail, Shell } from '@/components/Shell'
import { AddButton } from '@/components/ui/AddButton'

const brands = [
  { id: 'brand-shoestore', name: 'ShoeStore', account: 'A社（Global Retail Inc.）' },
  { id: 'brand-gadgets', name: 'Gadgets+', account: 'A社（Global Retail Inc.）' },
  { id: 'brand-futuretech', name: 'FutureTech Gear', account: 'B社（Tech Starter）' },
]

export default function Brands() {
  return (
    <Shell crumbs={[{ href: '/brands', label: 'ブランド一覧' }]}>
      <div className="space-y-8">
        <HierarchyDetail />
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
      </div>
    </Shell>
  )
}
