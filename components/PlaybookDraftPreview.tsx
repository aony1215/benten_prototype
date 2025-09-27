'use client'

import { PlaybookDraft } from '@/lib/types/playbook'

export function PlaybookDraftPreview({ draft }: { draft: PlaybookDraft }) {
  return (
    <div className="card divide-y divide-slate-200 overflow-hidden">
      <section className="p-6 space-y-2">
        <h3 className="text-lg font-semibold text-slate-800">はじめに（テーマ/背景）</h3>
        <p className="text-sm text-slate-600">{draft.theme}</p>
        <p className="text-sm text-slate-600 whitespace-pre-line">{draft.data_snapshot.sourceSummary}</p>
        <p className="text-xs text-slate-500">
          スナップショット: {new Date(draft.data_snapshot.generatedAt).toLocaleString()} ／ ハッシュ: {draft.data_snapshot.inputsHash.slice(0, 8)}…
        </p>
      </section>
      <section className="p-6 space-y-2">
        <h3 className="text-lg font-semibold text-slate-800">Logic（意思決定原則）</h3>
        <p className="text-sm text-slate-700 whitespace-pre-line">{draft.logic}</p>
      </section>
      <section className="p-6 space-y-2">
        <h3 className="text-lg font-semibold text-slate-800">Action_template（フェーズ別の進め方）</h3>
        <p className="text-sm text-slate-700 whitespace-pre-line">{draft.action_template}</p>
      </section>
      <section className="p-6 space-y-2">
        <h3 className="text-lg font-semibold text-slate-800">Guardrails（承認/停止/ロールバック規則）</h3>
        <p className="text-sm text-slate-700 whitespace-pre-line">{draft.guardrails}</p>
      </section>
      <section className="p-6 space-y-3">
        <h3 className="text-lg font-semibold text-slate-800">Evidence（参照アーティファクト）</h3>
        {draft.evidence.length ? (
          <ul className="space-y-2 text-sm text-slate-600">
            {draft.evidence.map(item => (
              <li key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                <span className="font-medium text-slate-700">{item.id}</span>
                <span className="text-xs text-slate-500">{item.type} / {item.size ? `${Math.round(item.size / 1024)}KB` : 'size不明'}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">添付された証跡はまだありません。</p>
        )}
      </section>
    </div>
  )
}
