'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { BookOpenCheck, FolderKanban, Landmark, Layers, User, Users2 } from 'lucide-react'
import type { ComponentType } from 'react'

export type ViewId = 'projects' | 'customer' | 'brand' | 'program' | 'playbook' | 'settings'

export type ViewConfig = {
  id: ViewId
  label: string
  icon: ComponentType<any>
  home: string
}

export const VIEWS: ViewConfig[] = [
  { id: 'projects', label: 'Myプロジェクト', icon: FolderKanban, home: '/projects/my' },
  { id: 'customer', label: '顧客', icon: Users2, home: '/customers' },
  { id: 'brand', label: 'ブランド', icon: Landmark, home: '/brands' },
  { id: 'program', label: 'プログラム', icon: Layers, home: '/programs' },
  { id: 'playbook', label: 'プレイブック', icon: BookOpenCheck, home: '/playbooks' },
  { id: 'settings', label: 'アカウント設定', icon: User, home: '/settings' },
]

const PATH_VIEW_MAP: Array<{ prefix: string; view: ViewId }> = [
  { prefix: '/projects/my', view: 'projects' },
  { prefix: '/customers', view: 'customer' },
  { prefix: '/brands', view: 'brand' },
  { prefix: '/programs', view: 'program' },
  { prefix: '/playbooks', view: 'playbook' },
  { prefix: '/settings', view: 'settings' },
  { prefix: '/datasources', view: 'settings' },
]

function isViewId(value: unknown): value is ViewId {
  return typeof value === 'string' && VIEWS.some(view => view.id === value)
}

export function resolveViewHome(id: ViewId): string {
  const view = VIEWS.find(v => v.id === id)
  return view?.home ?? '/'
}

export function useCurrentView(): ViewId {
  const pathname = usePathname() || '/'
  const sp = useSearchParams()

  const forced = PATH_VIEW_MAP.find(entry => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`))
  if (forced) {
    return forced.view
  }

  const fromQuery = sp?.get('v')
  if (isViewId(fromQuery)) {
    return fromQuery
  }

  return 'projects'
}
