'use client'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ViewSwitch, useCurrentView } from '@/components/ViewSwitch'
import { Breadcrumbs, Crumb } from '@/components/Breadcrumbs'
import { BookOpenCheck, FolderKanban, Users2, Landmark, Layers, User, Database } from 'lucide-react'
import { clsx } from 'clsx'
import React from 'react'

type NavItem = { href: string; label: string; icon?: React.ComponentType<any> }

function useNav(): { items: NavItem[] } {
  const v = useCurrentView()
  const items: Record<string, NavItem[]> = {
    customer: [
      { href: '/projects/my', label: 'Myプロジェクト', icon: FolderKanban },
      { href: '/customers', label: '顧客一覧', icon: Users2 },
    ],
    brand: [
      { href: '/projects/my', label: 'Myプロジェクト', icon: FolderKanban },
      { href: '/brands', label: 'ブランド一覧', icon: Landmark },
    ],
    program: [
      { href: '/projects/my', label: 'Myプロジェクト', icon: FolderKanban },
      { href: '/programs', label: 'プログラム一覧', icon: Layers },
    ],
  }
  return { items: items[v] }
}

const persistentItems: NavItem[] = [
  { href: '/playbooks', label: 'プレイブック', icon: BookOpenCheck },
  { href: '/datasources', label: 'データソース', icon: Database },
]

function withView(href: string, sp: URLSearchParams | null): string {
  const params = new URLSearchParams(sp?.toString() || '')
  if (!params.get('v')) params.set('v', 'customer')
  return `${href}?${params.toString()}`
}

export function Shell({ children, crumbs }: { children: React.ReactNode; crumbs?: Crumb[] }) {
  const pathname = usePathname() || '/'
  const sp = useSearchParams()
  const { items } = useNav()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Left nav */}
      <aside className="fixed inset-y-0 left-0 z-40 w-[244px] border-r border-slate-200 bg-white flex flex-col">
        <div className="h-14 px-3 border-b border-slate-200 flex items-center gap-2">
          <div className="h-8 w-8 rounded-2xl bg-indigo-600 text-white grid place-items-center font-bold">B</div>
          <div className="font-semibold tracking-tight">Benten</div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {items.map(it => {
            const Icon = it.icon || FolderKanban
            const active = pathname.startsWith(it.href)
            return (
              <div key={it.href} className="mb-1">
                <Link
                  href={withView(it.href, sp)}
                  aria-current={active ? 'page' : undefined}
                  className={clsx(
                    'group flex items-center gap-3 rounded-xl px-3 py-2 font-medium text-slate-600 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200',
                    active
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'hover:bg-indigo-50/70 hover:text-indigo-700',
                  )}
                >
                  <div
                    className={clsx(
                      'grid h-9 w-9 place-items-center rounded-xl transition-colors duration-150',
                      active
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700',
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{it.label}</span>
                </Link>
              </div>
            )
          })}
        </nav>
        <div className="border-t border-slate-200 p-3 space-y-2">
          {persistentItems.map(it => {
            const Icon = it.icon || FolderKanban
            const active = pathname.startsWith(it.href)
            return (
              <Link
                key={it.href}
                href={withView(it.href, sp)}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'group flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-slate-600 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200',
                  active
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'hover:bg-indigo-50/70 hover:text-indigo-700',
                )}
              >
                <div
                  className={clsx(
                    'grid h-8 w-8 place-items-center rounded-xl transition-colors duration-150',
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700',
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span>{it.label}</span>
              </Link>
            )
          })}
          <Link
            href={withView('/settings', sp)}
            className={clsx(
              'group flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-indigo-50/70 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200',
              pathname.startsWith('/settings') && 'bg-indigo-50 text-indigo-700 shadow-sm',
            )}
          >
            <div
              className={clsx(
                'grid h-8 w-8 place-items-center rounded-full transition-colors duration-150',
                pathname.startsWith('/settings')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700',
              )}
            >
              <User
                className={clsx(
                  'w-4 h-4',
                  pathname.startsWith('/settings') ? 'text-white' : undefined,
                )}
              />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">アカウント設定</div>
              <div className="text-xs text-slate-500">Settings</div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Header */}
      <div className="ml-[244px] min-h-screen">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
            <Breadcrumbs crumbs={crumbs} />
            <ViewSwitch />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </div>
    </div>
  )
}
