'use client'

import { useMemo, useState } from 'react'
import { Shell } from '@/components/Shell'
import { CTA } from '@/components/ui/CTA'
import { CUSTOMER_DATA } from '@/app/customers/data'
import { CheckCircle2, MessageSquare, NotebookPen, Sparkles, Star } from 'lucide-react'

type ReportingTab = 'context' | 'comments' | 'playbook'

const CONTEXT_ITEMS = {
  issues: ['計測欠損', '在庫データ遅延', '検索キャンペーン学習リセット'],
  knowledge: ['9/15 議事録（棚卸MTG）', '先週のフィードバックメモ'],
  manual: ['報告相手は事業部長。意思決定を後押しするトーンで。'],
}

const FEEDBACK_ITEMS = [
  {
    id: 'fb-correction',
    type: 'correction' as const,
    label: '修正指示',
    excerpt: '日予算の10%抑制を推奨します。',
    detail:
      '報告相手は事業部長。これでは弱い。「機会損失リスクを回避するため、必須のアクションです」というニュアンスに。金額インパクトも添えて。',
  },
  {
    id: 'fb-praise',
    type: 'praise' as const,
    label: '高評価',
    excerpt: '前回の報告会でご質問のあった関西エリアの動向について、先回りして分析を行いました。',
    detail:
      'この先回りでの分析は、クライアントからの信頼を得る上で非常に重要。我々のチームの「勝ち筋」として、今後も必ず継続したい。',
  },
]

const PLAYBOOK_SUGGESTIONS = [
  {
    id: 'suggest-tone',
    title: '意思決定者向けの推奨表現を強化',
    body: '報告相手に事業部長が含まれる場合、推奨アクションの文言を「必須」「不可欠」などの断定的なトーンに自動で調整します。',
  },
  {
    id: 'suggest-anticipate',
    title: '先回り分析を基本ロジックに追加',
    body: '過去の会議での質問を参照し、次回レポートでは関連分析を先に提示するステップを標準化します。',
  },
]

const highlightStyles: Record<'correction' | 'praise', string> = {
  correction: 'bg-yellow-100 ring-1 ring-yellow-200 shadow-[inset_0_0_0_1px_rgba(234,179,8,0.4)]',
  praise: 'bg-emerald-100 ring-1 ring-emerald-200 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.3)]',
}

export default function ReportingSession({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<ReportingTab>('context')
  const customer = CUSTOMER_DATA[params.id]
  const customerName = customer?.name ?? params.id

  const crumbs = useMemo(
    () => [
      { href: '/customers', label: '顧客一覧' },
      { href: `/customers/${params.id}`, label: customerName },
      { href: `/customers/${params.id}/reporting`, label: 'レポーティング' },
    ],
    [customerName, params.id],
  )

  const tabButtonBase =
    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200'

  return (
    <Shell crumbs={crumbs}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-indigo-100 bg-indigo-50/70 px-6 py-5 text-slate-700 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Step 1</div>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">AIとの対話画面 ― 思考のキャンバスが開かれる</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {customerName}向けの週次レポーティングをAIと共同で磨き上げています。左側ではドキュメントを読みながらマーキング、右側では参照したコンテキストやフィードバック履歴を追跡できます。
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-slate-600">
            <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm">
              <MessageSquare className="h-4 w-4 text-indigo-500" aria-hidden="true" />
              <span>進行中の対話: 週次パフォーマンスレポート</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm">
              <NotebookPen className="h-4 w-4 text-indigo-500" aria-hidden="true" />
              <span>目的: 事業部長への報告資料を確定</span>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="card overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 2</div>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">コア体験：テキストへのマーキングと対話</h2>
              <p className="mt-2 text-sm text-slate-600">
                AIが生成したドキュメントを読み込み、専門家としての視点でハイライトとコメントを積み重ねます。
              </p>
            </div>

            <div className="space-y-8 px-6 py-6 text-sm leading-relaxed text-slate-700">
              <div className="space-y-4">
                <p>
                  「…防風ダウンジャケットはCPAが非常に好調ですが、在庫逼迫の懸念を考慮し、
                  <span className={`mx-1 rounded-md px-1.5 py-0.5 ${highlightStyles.correction}`}>日予算の10%抑制を推奨します。</span>
                  」
                </p>
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                  <div className="flex items-center gap-2 font-semibold">
                    <MessageSquare className="h-4 w-4" aria-hidden="true" /> 修正指示
                  </div>
                  <p className="mt-1 text-sm leading-relaxed">
                    報告相手は事業部長。これでは弱い。「機会損失リスクを回避するため、必須のアクションです」というニュアンスに。金額インパクトも添えて。
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p>
                  「また、前回の報告会でご質問のあった関西エリアの動向について、
                  <span className={`mx-1 rounded-md px-1.5 py-0.5 ${highlightStyles.praise}`}>先回りして分析を行いました。</span>
                  」
                </p>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  <div className="flex items-center gap-2 font-semibold">
                    <Star className="h-4 w-4" aria-hidden="true" /> 高評価
                  </div>
                  <p className="mt-1 text-sm leading-relaxed">
                    この先回りでの分析は、クライアントからの信頼を得る上で非常に重要。我々のチームの「勝ち筋」として、今後も必ず継続したい。
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 3</div>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">フィードバックを反映した再生成</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    ハイライトされた指示をもとに、AIがレポート本文を即座に書き換えます。
                  </p>
                </div>
                <div className="flex gap-2">
                  <CTA variant="outline">フィードバックを反映して再生成</CTA>
                  <CTA>この内容でレポートを確定</CTA>
                </div>
              </div>

              <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700">
                <p>
                  「…防風ダウンジャケットはCPAが非常に好調ですが、在庫逼迫による機会損失リスク（推定<strong> 480万円</strong>）を回避するため、<strong>日予算の10%抑制は必須のアクションです。</strong>」
                </p>
                <p>
                  「<span className="font-semibold text-emerald-700">（高評価）</span> また、前回の報告会でご質問のあった関西エリアの動向について、先回りして分析を行いました。」
                </p>
              </div>
            </div>
          </section>

          <aside className="card flex h-fit flex-col">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 2.5</div>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">思考の前提パネル</h2>
            </div>
            <div className="px-5 py-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('context')}
                  className={`${tabButtonBase} ${activeTab === 'context' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <NotebookPen className="h-4 w-4" aria-hidden="true" /> コンテキスト
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('comments')}
                  className={`${tabButtonBase} ${activeTab === 'comments' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <MessageSquare className="h-4 w-4" aria-hidden="true" /> コメント
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('playbook')}
                  className={`${tabButtonBase} ${activeTab === 'playbook' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" /> 提案
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4 px-5 pb-6">
              {activeTab === 'context' && (
                <div className="space-y-5">
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">参照した課題</h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700">
                      {CONTEXT_ITEMS.issues.map(item => (
                        <li key={item} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-slate-300" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">参照したナレッジ</h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700">
                      {CONTEXT_ITEMS.knowledge.map(item => (
                        <li key={item} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-slate-300" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">手動での追記</h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700">
                      {CONTEXT_ITEMS.manual.map(item => (
                        <li key={item} className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">{item}</li>
                      ))}
                    </ul>
                  </section>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {FEEDBACK_ITEMS.map(item => (
                    <div
                      key={item.id}
                      className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        item.type === 'correction'
                          ? 'border-yellow-200 bg-yellow-50 text-yellow-900'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        {item.type === 'correction' ? <MessageSquare className="h-4 w-4" aria-hidden="true" /> : <Star className="h-4 w-4" aria-hidden="true" />}
                        {item.label}
                      </div>
                      <p className="mt-1 text-xs font-semibold">「{item.excerpt}」</p>
                      <p className="mt-1 text-sm">{item.detail}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'playbook' && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-900">
                    <div className="flex items-center gap-2 font-semibold">
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      Benten Copilot の提案
                    </div>
                    <p className="mt-1 text-sm leading-relaxed">
                      レポート確定後、今回の対話から抽出されたロジックをプレイブックに反映できます。
                    </p>
                  </div>
                  {PLAYBOOK_SUGGESTIONS.map(item => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                      <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{item.body}</p>
                      <button className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                        <Sparkles className="h-4 w-4" aria-hidden="true" /> 承認して v1.5 にアップデート
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>

        <section className="card border-indigo-100 bg-indigo-50/60 px-6 py-5 text-sm text-slate-700">
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Step 4</div>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">対話から「知の資産」へ</h2>
              <p className="mt-1 text-sm leading-relaxed">
                レポートを確定した瞬間、Benten Copilot がプレイブックの改善提案を生成。承認すればチーム全体の知識として共有され、次回以降のレポートに自動反映されます。
              </p>
            </div>
            <CTA variant="primary" className="self-start md:self-auto">
              提案を確認する
            </CTA>
          </div>
        </section>
      </div>
    </Shell>
  )
}
