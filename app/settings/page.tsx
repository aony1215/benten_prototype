'use client'
import { Shell } from '@/components/Shell'
import { CTA } from '@/components/ui/CTA'

export default function SettingsPage() {
  return (
    <Shell crumbs={[{ href: '/settings', label: '設定' }]}>
      <div className="max-w-xl space-y-4">
        <h1 className="font-semibold text-lg">アカウント設定</h1>
        <div className="card p-4 space-y-3">
          <div>
            <label className="text-xs text-slate-500">表示名</label>
            <input className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300" defaultValue="Shin" />
          </div>
          <div>
            <label className="text-xs text-slate-500">メール</label>
            <input className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300" defaultValue="shin@example.com" />
          </div>
          <div className="flex items-center gap-2">
            <CTA variant="outline">キャンセル</CTA>
            <CTA>保存</CTA>
          </div>
        </div>
      </div>
    </Shell>
  )
}
