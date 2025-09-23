'use client'
import { motion } from 'framer-motion'
export function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round(((step + 1) / Math.max(total, 1)) * 100)
  return (
    <div className="w-full">
      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
        <motion.div className="h-1.5 bg-indigo-600" initial={false} animate={{ width: `${pct}%` }} transition={{ type:'spring', stiffness: 280, damping: 26 }} />
      </div>
      <div className="mt-1 text-[11px] text-slate-500 text-right">{pct}%</div>
    </div>
  )
}
