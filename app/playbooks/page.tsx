'use client'
import { Shell } from '@/components/Shell'
import { useSearchParams } from 'next/navigation'

const pbs = [
  { id: 'pb_reporting', name: '週次レポート自動化', version: '0.3.1', status: 'approved' },
  { id: 'pb_bidding', name: '入札最適化（Search）', version: '0.5.0', status: 'approved' },
  { id: 'pb_ma', name: 'MAオンボード（Nurturing）', version: '0.1.4', status: 'draft' },
]

const sectionCopy = {
  default: {
    title: '公開中のプレイブック',
    description: 'チームで共有する運用ナレッジ',
    empty: '公開中のプレイブックはまだありません。',
  },
  drafts: {
    title: '下書きのプレイブック',
    description: '作成途中のプレイブック',
    empty: '下書き中のプレイブックはまだありません。',
  },
} as const

export default function Playbooks() {
  const sp = useSearchParams()
  const section = sp?.get('section')
  const isDraftSection = section === 'drafts'
  const copy = isDraftSection ? sectionCopy.drafts : sectionCopy.default
  const filteredPbs = pbs.filter(pb =>
    isDraftSection ? pb.status === 'draft' : pb.status === 'approved',
  )

  return (
    <Shell crumbs={[{ href: '/playbooks', label: 'プレイブック一覧' }]}>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">{copy.title}</h1>
          <p className="text-sm text-slate-500">{copy.description}</p>
        </div>
        {filteredPbs.length ? (
          <div className="grid gap-3">
            {filteredPbs.map(p => (
              <div key={p.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-slate-500">v{p.version}</div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-lg border border-slate-300">
                    {p.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center">
            <p className="text-sm text-slate-500">{copy.empty}</p>
          </div>
        )}
      </div>
    </Shell>
  )
}
