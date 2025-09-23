'use client'
import Link from 'next/link'
import { Shell } from '@/components/Shell'
import { AddButton } from '@/components/ui/AddButton'

const brands = [
  { id: 'brd_shoestore', name: 'ShoeStore', account: 'Global Retail Inc.' },
  { id: 'brd_gadgets', name: 'Gadgets+', account: 'Global Retail Inc.' },
  { id: 'brd_futuretech', name: 'FutureTech Gear', account: 'Tech Starter' },
]

export default function Brands() {
  return (
    <Shell crumbs={[{ href: '/brands', label: 'ブランド一覧' }]}>
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-semibold">ブランド一覧</h1>
        <AddButton href="/brands/new">新規登録</AddButton>
      </div>
      <div className="grid gap-3">
        {brands.map(b => (
          <Link key={b.id} href={`/brands/${b.id}`} className="card p-4 card-hover">
            <div className="font-medium">{b.name}</div>
            <div className="text-sm text-slate-500">{b.account}</div>
          </Link>
        ))}
      </div>
    </Shell>
  )
}
