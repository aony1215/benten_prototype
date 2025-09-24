'use client'

import Link from 'next/link'
import { ChevronRight, Sparkles } from 'lucide-react'

import { Shell } from '@/components/Shell'

const pbs = [
  { id: 'pb_reporting', name: '週次レポート自動化', version: '0.3.1', status: 'approved', href: '/playbooks/reporting' },
  { id: 'pb_bidding', name: '入札最適化（Search）', version: '0.5.0', status: 'approved' },
  { id: 'pb_ma', name: 'MAオンボード（Nurturing）', version: '0.1.4', status: 'draft' },
]

export default function Playbooks() {
  return (
    <Shell crumbs={[{ href: '/playbooks', label: 'プレイブック一覧' }]}> 
      <div className="grid gap-3">
        {pbs.map(p => {
          const content = (
            <div className="card p-4 transition-all duration-150">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    {p.id === 'pb_reporting' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
                        <Sparkles className="h-3 w-3" /> 新UI
                      </span>
                    )}
                    <span>{p.name}</span>
                  </div>
                  <div className="text-sm text-slate-500">v{p.version}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-600">{p.status}</div>
                  {p.href && (
                    <ChevronRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-indigo-500" aria-hidden="true" />
                  )}
                </div>
              </div>
            </div>
          )

          return p.href ? (
            <Link
              key={p.id}
              href={p.href}
              className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
            >
              {content}
            </Link>
          ) : (
            <div key={p.id}>{content}</div>
          )
        })}
      </div>
    </Shell>
  )
}
