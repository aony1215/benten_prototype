'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { clsx } from 'clsx'

type AddButtonProps = {
  href: string
  children: React.ReactNode
  className?: string
}

export function AddButton({ href, children, className }: AddButtonProps) {
  return (
    <Link
      href={href}
      className={clsx(
        'group inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300',
        className,
      )}
    >
      <span className="grid h-7 w-7 place-items-center rounded-xl bg-indigo-100 text-indigo-600 transition-colors duration-200 group-hover:bg-indigo-600 group-hover:text-white">
        <Plus className="h-4 w-4" aria-hidden="true" />
      </span>
      <span>{children}</span>
    </Link>
  )
}

