'use client'
import { ProgressBar } from '@/components/ui/ProgressBar'
export function WizardLayout({ stepIdx, total, title, question, children, onBack, onNext, nextDisabled }: {
  stepIdx: number; total: number; title: string; question: string; children: React.ReactNode; onBack: ()=>void; onNext: ()=>void; nextDisabled?: boolean
}) {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 pt-6">
        <div className="text-xs uppercase tracking-wide text-slate-500">Step {stepIdx + 1} / {total}</div>
        <div className="mt-3">
          <div className="font-semibold tracking-tight">{title}</div>
          <div className="text-slate-500 text-sm">{question}</div>
        </div>
      </div>
      <div className="px-6 pb-20 pt-4">{children}</div>
      <div className="sticky bottom-0 w-full border-t border-slate-200 bg-white/80 backdrop-blur px-6 py-4 flex items-center justify-end gap-3">
        <button className="px-4 py-2 rounded-xl hover:bg-slate-100 border border-slate-300" onClick={onBack}>戻る</button>
        <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50" onClick={onNext} disabled={nextDisabled}>次へ</button>
      </div>
    </div>
  )
}
