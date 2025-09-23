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
                <Link href={withView(it.href, sp)} className={clsx("flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100", active && "bg-indigo-50 text-indigo-700")}>
                  <div className="p-2 rounded-xl bg-slate-100"><Icon className="w-4 h-4" /></div>
                  <span className="font-medium">{it.label}</span>
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
                className={clsx(
                  'flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-100',
                  active && 'bg-indigo-50 text-indigo-700',
                )}
              >
                <div className="p-2 rounded-xl bg-slate-100">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm">{it.label}</span>
              </Link>
            )
          })}
          <Link
            href={withView('/settings', sp)}
            className={clsx(
              'flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-100',
              pathname.startsWith('/settings') && 'bg-indigo-50 text-indigo-700',
            )}
          >
            <div
              className={clsx(
                'h-8 w-8 rounded-full grid place-items-center',
                pathname.startsWith('/settings') ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200',
              )}
            >
              <User
                className={clsx(
                  'w-4 h-4',
                  pathname.startsWith('/settings') ? 'text-indigo-700' : 'text-slate-600',
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
