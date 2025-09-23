'use client'
import { useId } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Users2, Landmark, Layers, ChevronDown } from 'lucide-react'

const VIEWS = [
  { id: 'customer', label: '顧客', Icon: Users2 },
  { id: 'brand', label: 'ブランド', Icon: Landmark },
  { id: 'program', label: 'プログラム', Icon: Layers },
] as const

export type ViewId = typeof VIEWS[number]['id']

export function useCurrentView(): ViewId {
  const sp = useSearchParams()
  const v = (sp?.get('v') || 'customer') as ViewId
  return (['customer', 'brand', 'program'].includes(v) ? v : 'customer') as ViewId
}

export function ViewSwitch() {
  const selectId = useId()
  const router = useRouter()
  const pathname = usePathname() || '/'
  const sp = useSearchParams()
  const current = (sp?.get('v') || 'customer') as ViewId

  const setView = (next: ViewId) => {
    const params = new URLSearchParams(sp?.toString() || '')
    params.set('v', next)
    router.replace(`${pathname}?${params.toString()}`)
  }

  const selectedView = VIEWS.find(view => view.id === current) ?? VIEWS[0]
  const SelectedIcon = selectedView.Icon

  return (
    <div className="relative inline-flex items-center">
      <label htmlFor={selectId} className="sr-only">
        ビュー切り替え
      </label>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
        <SelectedIcon className="h-4 w-4" aria-hidden="true" />
      </span>
      <select
        id={selectId}
        value={current}
        onChange={event => setView(event.target.value as ViewId)}
        className="appearance-none rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm font-medium text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
      >
        {VIEWS.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-400">
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </span>
    </div>
  )
}
