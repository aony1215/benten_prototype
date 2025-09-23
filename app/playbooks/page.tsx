'use client'
import { Shell } from '@/components/Shell'

const pbs = [
  { id: 'pb_reporting', name: '週次レポート自動化', version: '0.3.1', status: 'approved' },
  { id: 'pb_bidding', name: '入札最適化（Search）', version: '0.5.0', status: 'approved' },
  { id: 'pb_ma', name: 'MAオンボード（Nurturing）', version: '0.1.4', status: 'draft' },
]

export default function Playbooks() {
  return (
    <Shell crumbs={[{ href: '/playbooks', label: 'プレイブック一覧' }]}>
      <div className="grid gap-3">
        {pbs.map(p => (
          <div key={p.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-slate-500">v{p.version}</div>
              </div>
              <div className="text-xs px-2 py-1 rounded-lg border border-slate-300">{p.status}</div>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}
