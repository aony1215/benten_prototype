'use client'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
const hoverTap = { whileHover: { scale: 1.01 }, whileTap: { scale: 0.985 } }
const spring = { type: 'spring', stiffness: 280, damping: 26 } as const
export function CTA({ children, className = '', variant = 'primary', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'ghost'|'outline' }) {
  const base = 'group inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 cursor-pointer'
  const styles: Record<string,string> = { primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow', ghost: 'bg-transparent hover:bg-slate-100', outline: 'border border-slate-300 hover:bg-slate-50' }
  return (<motion.button {...hoverTap} transition={spring} className={clsx(base, styles[variant], className)} {...rest}>{children}</motion.button>)
}
