'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
export function Hint({ text, side='top', children }: { text: string; side?: 'top'|'bottom'; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: side==='top'? -4 : 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: side==='top'? -4 : 4 }} transition={{ duration: 0.14 }}
            className={`pointer-events-none absolute z-50 px-2 py-1 rounded-md bg-slate-900 text-white text-[11px] whitespace-nowrap ${side==='top'? '-top-1 translate-y-[-100%] left-1/2 -translate-x-1/2' : 'top-full mt-1 left-1/2 -translate-x-1/2'}`}>
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
