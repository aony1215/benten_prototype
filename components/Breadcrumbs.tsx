'use client'
import Link from 'next/link'
import type { Route } from 'next'
import { Home, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

export type Crumb = { href: string; label: string }
export function Breadcrumbs({ crumbs }: { crumbs?: Crumb[] }) {
  if (!crumbs || crumbs.length === 0) {
    return (
      <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
        <ol className="flex items-center gap-1">
          <li className="inline-flex items-center gap-1">
            <Home className="w-4 h-4 text-slate-400" />
            <Link href={'/' as Route} className="hover:underline">
              ホーム
            </Link>
          </li>
        </ol>
      </nav>
    )
  }
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-700">
      <ol className="flex items-center gap-1 flex-wrap">
        <li className="inline-flex items-center gap-1">
          <Home className="w-4 h-4 text-slate-400" />
          <Link href={'/' as Route} className="hover:underline">
            ホーム
          </Link>
        </li>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1
          return (
            <li key={c.href} className={clsx('inline-flex items-center gap-1 max-w-[220px]')}>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              {last ? (
                <span className="font-medium text-slate-900 truncate">{c.label}</span>
              ) : (
                <Link href={c.href as Route} className="hover:underline truncate">
                  {c.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
