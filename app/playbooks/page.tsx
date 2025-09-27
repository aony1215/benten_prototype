'use client'
import Link from 'next/link'

import { Shell } from '@/components/Shell'

const pbs = [
  { id: 'pb_reporting', name: '週次レポート自動化', version: '0.3.1', status: 'approved' },
  { id: 'pb_bidding', name: '入札最適化（Search）', version: '0.5.0', status: 'approved' },
  { id: 'pb_ma', name: 'MAオンボード（Nurturing）', version: '0.1.4', status: 'draft' },
]

export default function Playbooks() {
  return (
    <Shell crumbs={[{ href: '/playbooks', label: 'プレイブック一覧' }]}>
      <div className="space-y-8">
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold text-slate-900">プレイブックを選ぶ</h1>
              <p className="text-sm text-slate-600">
                チームのベストプラクティスや自動化されたAIフローをまとめています。新しいワークフローもすぐに設計できます。
              </p>
            </div>
            <Link
              href="/playbooks/new"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
            >
              + 新しいワークフローをつくる
            </Link>
          </div>
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
