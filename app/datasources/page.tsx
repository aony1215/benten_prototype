'use client'

import { Shell } from '@/components/Shell'
import { CTA } from '@/components/ui/CTA'

const sources = [
  { id: 'ga4', name: 'Google Analytics 4', type: 'Analytics', status: '連携中', lastSynced: '2024/05/15 09:00' },
  { id: 'google_ads', name: 'Google広告アカウント', type: 'Ads', status: '連携中', lastSynced: '2024/05/14 18:30' },
  { id: 'salesforce', name: 'Salesforce', type: 'CRM', status: '未連携', lastSynced: null },
]

export default function DataSourcesPage() {
  return (
    <Shell crumbs={[{ href: '/datasources', label: 'データソース' }]}>
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-semibold">データソースの紐付け</h1>
            <p className="text-sm text-slate-500">プレイブックで利用するデータソースの連携状態を管理します。</p>
          </div>
          <CTA className="sm:self-end">新しいソースを追加</CTA>
        </div>
        <div className="grid gap-3">
          {sources.map(source => (
            <div key={source.id} className="card p-4 flex items-start justify-between">
              <div>
                <div className="font-medium">{source.name}</div>
                <div className="text-xs text-slate-500">{source.type}</div>
              </div>
              <div className="text-right">
                <div
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border ${
                    source.status === '連携中'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-300 bg-slate-100 text-slate-600'
                  }`}
                >
                  {source.status}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  最終同期: {source.lastSynced ?? '未同期'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  )
}
