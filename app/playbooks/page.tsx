'use client'
import { Shell } from '@/components/Shell'
import { AddButton } from '@/components/ui/AddButton'

const pbs = [
  { id: 'pb_reporting', name: '週次レポート自動化', version: '0.3.1', status: 'approved' },
  { id: 'pb_bidding', name: '入札最適化（Search）', version: '0.5.0', status: 'approved' },
  { id: 'pb_ma', name: 'MAオンボード（Nurturing）', version: '0.1.4', status: 'draft' },
]

export default function Playbooks() {
  return (
    <Shell crumbs={[{ href: '/playbooks', label: 'プレイブック一覧' }]}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">プレイブック</h1>
            <p className="text-sm text-slate-500">
              Sense → Memory → Action → Artifact → Act → Approval の流れを管理し、再現性を高めます。
            </p>
          </div>
          <AddButton href="/playbooks/new">新しいプレイブックを設計</AddButton>
        </div>

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
      </div>
    </Shell>
  )
}
