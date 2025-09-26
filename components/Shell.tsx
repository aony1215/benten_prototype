'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { Breadcrumbs, Crumb } from '@/components/Breadcrumbs'
import { clsx } from 'clsx'
import React from 'react'
import {
  BarChart3,
  BookOpenCheck,
  Database,
  FilePenLine,
  FolderKanban,
  Landmark,
  Layers,
  Megaphone,
  NotebookPen,
  Sparkles,
  User,
  Users2,
} from 'lucide-react'
import { resolveViewHome, useCurrentView, VIEWS, type ViewId } from '@/components/ViewSwitch'

type ModeNavDefinition = {
  path: string
  label: string
  description?: string
  icon: React.ComponentType<any>
  params?: Record<string, string>
}

type ModeNavItem = ModeNavDefinition & {
  href: string
  isActive: boolean
}

type ModeOption = {
  id: ViewId
  label: string
  icon: React.ComponentType<any>
  href: string
  isActive: boolean
}

const MODE_NAV_DEFINITIONS: Record<ViewId, ModeNavDefinition[]> = {
  projects: [
    {
      path: '/projects/my',
      label: 'Myプロジェクト',
      description: '担当プロジェクトの状況を確認',
      icon: FolderKanban,
    },
    {
      path: '/projects/my',
      label: 'レポート',
      description: '最新の成果物と指標をチェック',
      params: { section: 'reports' },
      icon: BarChart3,
    },
  ],
  customer: [
    {
      path: '/customers',
      label: '顧客一覧',
      description: '管理中の顧客アカウント',
      icon: Users2,
    },
    {
      path: '/customers',
      label: 'ショートカット',
      description: '重要な顧客ビューへ素早く移動',
      params: { section: 'shortcuts' },
      icon: Sparkles,
    },
  ],
  brand: [
    {
      path: '/brands',
      label: 'ブランド一覧',
      description: 'ブランドプロファイルの管理',
      icon: Landmark,
    },
    {
      path: '/brands',
      label: '関連キャンペーン',
      description: 'ブランドに紐づくアクティビティ',
      params: { section: 'campaigns' },
      icon: Megaphone,
    },
  ],
  program: [
    {
      path: '/programs',
      label: 'プログラム一覧',
      description: '進行中のプログラムを俯瞰',
      icon: Layers,
    },
    {
      path: '/programs',
      label: 'テンプレート',
      description: '再利用可能なプログラム設計',
      params: { section: 'templates' },
      icon: NotebookPen,
    },
  ],
  playbook: [
    {
      path: '/playbooks',
      label: 'プレイブック',
      description: 'チームで共有する運用ナレッジ',
      icon: BookOpenCheck,
    },
    {
      path: '/playbooks',
      label: '下書き',
      description: '作成途中のプレイブック',
      params: { section: 'drafts' },
      icon: FilePenLine,
    },
  ],
  settings: [
    {
      path: '/settings',
      label: 'アカウント設定',
      description: 'プロフィールや通知設定を管理',
      icon: User,
    },
    {
      path: '/datasources',
      label: 'データソース',
      description: '接続済みの外部データを管理',
      icon: Database,
    },
  ],
}

const CONTROLLED_QUERY_KEYS = Array.from(
  new Set(
    Object.values(MODE_NAV_DEFINITIONS)
      .flat()
      .flatMap(def => Object.keys(def.params ?? {})),
  ),
)

function createHrefWithView(
  path: string,
  sp: ReadonlyURLSearchParams | null,
  view: ViewId,
  extraParams?: Record<string, string>,
): string {
  const params = new URLSearchParams(sp?.toString() || '')
  CONTROLLED_QUERY_KEYS.forEach(key => {
    if (!extraParams || !(key in extraParams)) {
      params.delete(key)
    }
  })
  params.set('v', view)
  if (extraParams) {
    Object.entries(extraParams).forEach(([key, value]) => {
      params.set(key, value)
    })
  }
  const query = params.toString()
  return query ? `${path}?${query}` : `${path}`
}

function buildModeOptions(
  sp: ReadonlyURLSearchParams | null,
  currentView: ViewId,
): ModeOption[] {
  return VIEWS.map(view => ({
    id: view.id,
    label: view.label,
    icon: view.icon,
    href: createHrefWithView(resolveViewHome(view.id), sp, view.id),
    isActive: currentView === view.id,
  }))
}

function buildModeNavItems(
  definitions: ModeNavDefinition[],
  sp: ReadonlyURLSearchParams | null,
  currentView: ViewId,
  pathname: string,
): ModeNavItem[] {
  return definitions.map(def => {
    const href = createHrefWithView(def.path, sp, currentView, def.params)
    const basePath = def.path
    const matchesPath = pathname === basePath || pathname.startsWith(`${basePath}/`)
    const matchesParams = def.params
      ? Object.entries(def.params).every(([key, value]) => sp?.get(key) === value)
      : true
    const isActive = matchesPath && matchesParams
    return { ...def, href, isActive }
  })
}

function useNav() {
  const pathname = usePathname() || '/'
  const sp = useSearchParams()
  const currentView = useCurrentView()

  const modeOptions = buildModeOptions(sp, currentView)
  const subNavDefinitions = MODE_NAV_DEFINITIONS[currentView] ?? []
  const items = buildModeNavItems(subNavDefinitions, sp, currentView, pathname)

  return { modeOptions, items, currentView, isExpanded: items.length > 0 }
}

export function Shell({ children, crumbs }: { children: React.ReactNode; crumbs?: Crumb[] }) {
  const { modeOptions, items, isExpanded } = useNav()
  const activeMode = modeOptions.find(mode => mode.isActive)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-[320px] border-r border-slate-200 bg-white shadow-sm">
        <div className="flex w-20 flex-col border-r border-slate-100 bg-white">
          <div className="flex h-14 items-center justify-center border-b border-slate-100">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-indigo-600 font-semibold text-white">B</div>
          </div>
          <nav className="flex-1 space-y-3 py-4">
            {modeOptions.map(option => {
              const Icon = option.icon
              return (
                <Link
                  key={option.id}
                  href={option.href}
                  aria-current={option.isActive ? 'page' : undefined}
                  className={clsx(
                    'mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-slate-500 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200',
                    option.isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{option.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        <div
          className={clsx(
            'flex flex-1 flex-col border-l border-slate-200 bg-white transition-[width] duration-300 ease-in-out',
            isExpanded ? 'w-[240px]' : 'w-0',
          )}
        >
          <div
            className={clsx(
              'flex h-full flex-col overflow-hidden transition-opacity duration-200',
              isExpanded ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <div className="border-b border-slate-100 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">モード</div>
              <div className="mt-1 text-lg font-semibold text-slate-800">{activeMode?.label}</div>
            </div>
            <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
              {items.map(item => {
                const Icon = item.icon
                const keySuffix = item.params
                  ? Object.entries(item.params)
                      .map(([k, v]) => `${k}:${v}`)
                      .join('|')
                  : 'root'
                return (
                  <Link
                    key={`${item.path}-${keySuffix}`}
                    href={item.href}
                    aria-current={item.isActive ? 'page' : undefined}
                    className={clsx(
                      'group flex items-start gap-3 rounded-2xl px-3 py-3 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200',
                      item.isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'text-slate-600 hover:bg-indigo-50/70 hover:text-indigo-700',
                    )}
                  >
                    <span
                      className={clsx(
                        'mt-0.5 grid h-9 w-9 place-items-center rounded-xl border border-transparent bg-slate-100 text-slate-600 transition-colors duration-150',
                        item.isActive
                          ? 'border-indigo-100 bg-indigo-600 text-white shadow-sm'
                          : 'group-hover:bg-indigo-100 group-hover:text-indigo-700',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold leading-tight">{item.label}</span>
                      {item.description ? (
                        <span className="mt-1 block text-xs text-slate-500">{item.description}</span>
                      ) : null}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </aside>

      <div className="ml-[320px] min-h-screen">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <Breadcrumbs crumbs={crumbs} />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </div>
    </div>
  )
}
