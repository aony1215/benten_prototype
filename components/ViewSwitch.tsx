'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Users2, Landmark, Layers } from 'lucide-react'
import { clsx } from 'clsx'

const VIEWS = [
  { id: 'customer', label: '顧客', Icon: Users2 },
  { id: 'brand', label: 'ブランド', Icon: Landmark },
  { id: 'program', label: 'プログラム', Icon: Layers },
] as const

export type ViewId = typeof VIEWS[number]['id']

export function useCurrentView(): ViewId {
  const sp = useSearchParams()
  const v = (sp?.get('v') || 'customer') as ViewId
  return (['customer','brand','program'].includes(v) ? v : 'customer') as ViewId
}

export function ViewSwitch() {
  const router = useRouter()
  const pathname = usePathname() || '/'
  const sp = useSearchParams()
  const current = (sp?.get('v') || 'customer') as ViewId

  const setView = (next: ViewId) => {
    const params = new URLSearchParams(sp?.toString() || '')
    params.set('v', next)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div role="radiogroup" aria-label="ビュー切り替え" className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
      {VIEWS.map(({ id, label, Icon }) => {
        const active = current === id
        return (
          <button
            key={id}
            role="radio"
            aria-checked={active}
            onClick={() => setView(id)}
            className={clsx(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition',
              active ? 'bg-indigo-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100'
            )}
            title={`${label}ビュー`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
