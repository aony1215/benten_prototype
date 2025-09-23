'use client'
import Link from 'next/link'
import { Shell } from '@/components/Shell'

const my = [
  { id: 'prj_x', name: 'プロジェクトX', owner: 'あなた', target: 'A社（顧客）' },
  { id: 'prj_y', name: 'プロジェクトY', owner: 'あなた', target: 'ShoeStore（ブランド）' },
]

export default function MyProjects() {
  return (
    <Shell crumbs={[{ href: '/projects/my', label: 'Myプロジェクト' }]}>
      <div className="grid gap-3">
        {my.map(p => (
          <div key={p.id} className="card p-4 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-slate-500">{p.target}</div>
              </div>
              <Link className="text-xs px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-50" href={`/projects/${p.id}`}>詳細</Link>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}
