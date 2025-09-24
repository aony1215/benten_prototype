'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Users2, Landmark, Layers, ChevronDown, Check } from 'lucide-react'

const VIEWS = [
  { id: 'customer', label: '顧客', Icon: Users2 },
  { id: 'brand', label: 'ブランド', Icon: Landmark },
  { id: 'program', label: 'プログラム', Icon: Layers },
] as const

export type ViewId = typeof VIEWS[number]['id']

export function useCurrentView(): ViewId {
  const pathname = usePathname() || '/'
  const sp = useSearchParams()
  const forcedView = (() => {
    if (pathname === '/customers' || pathname.startsWith('/customers/')) return 'customer'
    if (pathname === '/brands' || pathname.startsWith('/brands/')) return 'brand'
    if (pathname === '/programs' || pathname.startsWith('/programs/')) return 'program'
    return null
  })()

  if (forcedView) {
    return forcedView
  }

  const v = sp?.get('v') as ViewId | null
  if (v && ['customer', 'brand', 'program'].includes(v)) {
    return v
  }

  return 'customer'
}

export function ViewSwitch() {
  const router = useRouter()
  const sp = useSearchParams()
  const current = useCurrentView()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const setView = (next: ViewId) => {
    const viewHomes: Record<ViewId, string> = {
      customer: '/customers',
      brand: '/brands',
      program: '/programs',
    }

    const params = new URLSearchParams(sp?.toString() || '')
    params.set('v', next)
    router.push(`${viewHomes[next]}?${params.toString()}`)
  }

  const selectedView = VIEWS.find(view => view.id === current) ?? VIEWS[0]
  const SelectedIcon = selectedView.Icon

  return (
    <div ref={menuRef} className="relative inline-flex text-sm font-medium">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="ビュー切り替え"
        onClick={() => setIsOpen(open => !open)}
        className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white py-2 pl-3 pr-2 text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
      >
        <span className="grid h-6 w-6 place-items-center rounded-xl bg-slate-100 text-slate-600">
          <SelectedIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span>{selectedView.label}</span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {isOpen ? (
        <div
          role="menu"
          aria-label="ビューの選択肢"
          className="absolute right-0 top-full z-20 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg ring-1 ring-black/5"
        >
          {VIEWS.map(({ id, label, Icon }) => {
            const isActive = current === id
            return (
              <button
                key={id}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  setIsOpen(false)
                  if (id !== current) {
                    setView(id)
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                }`}
              >
                <span className="grid h-7 w-7 place-items-center rounded-xl bg-slate-100">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="flex-1 font-medium">{label}</span>
                {isActive ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
