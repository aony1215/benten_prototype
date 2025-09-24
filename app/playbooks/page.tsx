'use client'

import { Shell } from '@/components/Shell'
import { useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  Gauge,
  Lightbulb,
  MessageCircle,
  MessageSquarePlus,
  RefreshCcw,
  Sparkles,
  Target,
  Wand2,
} from 'lucide-react'

type Playbook = {
  id: string
  name: string
  version: string
  status: 'approved' | 'draft' | 'deprecated'
  persona: string
  summary: string
  domain: string
}

type CommentStatus = '改善済' | '改善中' | '改善待ち'

type Comment = {
  id: string
  author: string
  body: string
  quote: string
  status: CommentStatus
  createdAt: string
}

type ImprovementStatus = '完了' | 'レビュー中' | '改善待ち'

type Improvement = {
  id: string
  title: string
  status: ImprovementStatus
  summary: string
  updatedAt: string
  linkedCommentId?: string
  impact?: string
}

type ActiveSelection = {
  text: string
  top: number
  left: number
}

const playbooks: Playbook[] = [
  {
    id: 'pb_reporting',
    name: '週次レポート自動化',
    version: '0.3.1',
    status: 'approved',
    persona: 'Brand Marketer',
    summary:
      'Senseスナップショットとゴールデンデータを突合し、ウェブ広告レポートの文脈とインサイトを自動生成します。コメントドリブンで改善が循環。',
    domain: 'Reporting',
  },
  {
    id: 'pb_bidding',
    name: '入札最適化（Search）',
    version: '0.5.0',
    status: 'approved',
    persona: 'CoE / Media Ops',
    summary: 'ROASと在庫制約を両立させるBid制御。shadow→canary→prodの段階展開をガードレール化。',
    domain: 'Bidding',
  },
  {
    id: 'pb_ma',
    name: 'MAオンボード（Nurturing）',
    version: '0.1.4',
    status: 'draft',
    persona: 'Lifecycle Marketing',
    summary: '初回体験から定着までのシナリオをMAに自動配信。決裁条件とログをEvidence化。',
    domain: 'Lifecycle',
  },
]

const initialComments: Comment[] = [
  {
    id: 'c1',
    author: '佐藤 (CS)',
    body: 'ブランドリフトの説明をもう少し短くまとめたいです。意思決定者が見るスライド用に20文字程度で。',
    quote: 'ブランドリフトは比較週比で +6.2pt と想定以上の伸長。',
    status: '改善中',
    createdAt: '2024/04/10 09:21',
  },
  {
    id: 'c2',
    author: '田中 (アナリスト)',
    body: 'Paid SearchのCPA改善は、ネガティブKWの除外効果を追加の根拠として追記ください。',
    quote: 'Paid SearchはCPAが -18% で改善。',
    status: '改善済',
    createdAt: '2024/04/09 17:45',
  },
]

const initialImprovements: Improvement[] = [
  {
    id: 'imp1',
    title: 'ブランドリフト要約の再生成',
    status: 'レビュー中',
    summary: 'コメント c1 を反映した20文字版の要約を生成中。出力はApproverレビュー待ち。',
    updatedAt: '2024/04/10 09:32',
    linkedCommentId: 'c1',
    impact: '期待効果: 意思決定速度 +15%',
  },
  {
    id: 'imp2',
    title: 'ネガティブKW根拠の追加',
    status: '完了',
    summary: 'GA4の検索語句レポートとキャンペーンログから除外KWの効果を挿入しました。',
    updatedAt: '2024/04/09 18:02',
    linkedCommentId: 'c2',
    impact: '再現性スコア +0.08',
  },
]

const goldenScore = {
  score: 0.87,
  rubric: [
    { label: 'コンテキスト整合性', value: 0.92 },
    { label: 'データカバレッジ', value: 0.88 },
    { label: '洞察の再現性', value: 0.81 },
  ],
  drift: -0.03,
}

export default function Playbooks() {
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>('pb_reporting')
  const selectedPlaybook = useMemo(
    () => playbooks.find(pb => pb.id === selectedPlaybookId) ?? playbooks[0],
    [selectedPlaybookId],
  )

  const [contextMode, setContextMode] = useState<'auto' | 'manual'>('auto')
  const [manualContext, setManualContext] = useState(
    '顧客: Global Retail Inc. / ブランド: ShoeStore\n注力キャンペーン: Q4 Holiday Push\nフォーカスKPI: ROAS 4.0, 新規購入比率 30%\n伝えたい背景: 在庫調整によりDisplay投資を抑制、Search偏重の方針。',
  )

  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [improvements, setImprovements] = useState<Improvement[]>(initialImprovements)
  const [activeSelection, setActiveSelection] = useState<ActiveSelection | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const insightRef = useRef<HTMLDivElement | null>(null)

  const handleMouseUp = () => {
    if (typeof window === 'undefined') return
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setActiveSelection(null)
      return
    }
    const text = selection.toString().trim()
    if (!text) {
      setActiveSelection(null)
      return
    }
    const range = selection.getRangeAt(0)
    const container = insightRef.current
    if (!container) return
    const ancestor = range.commonAncestorContainer
    const containerNode: Node = ancestor.nodeType === Node.TEXT_NODE ? ancestor.parentNode ?? ancestor : ancestor
    if (!container.contains(containerNode)) {
      setActiveSelection(null)
      return
    }
    const rect = range.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const relativeTop = rect.top - containerRect.top + container.scrollTop
    const relativeLeft = rect.left - containerRect.left + container.scrollLeft
    setActiveSelection({
      text,
      top: Math.max(relativeTop, 0),
      left: Math.max(relativeLeft, 0),
    })
  }

  const handleAddComment = () => {
    if (!activeSelection || !commentDraft.trim()) return
    const id = `c${Date.now()}`
    const timestamp = new Date().toLocaleString('ja-JP', { hour12: false })
    const newComment: Comment = {
      id,
      author: 'あなた',
      body: commentDraft.trim(),
      quote: activeSelection.text,
      status: '改善待ち',
      createdAt: timestamp,
    }
    const newImprovement: Improvement = {
      id: `imp${Date.now()}`,
      title: `コメント起点の改善 (${activeSelection.text.slice(0, 12)}…)`,
      status: '改善待ち',
      summary: 'Golden Ledgerに登録し、プレイブックの改善Runをキューに追加しました。',
      updatedAt: timestamp,
      linkedCommentId: id,
    }
    setComments(prev => [newComment, ...prev])
    setImprovements(prev => [newImprovement, ...prev])
    setActiveSelection(null)
    setCommentDraft('')
  }

  const cancelComposer = () => {
    setActiveSelection(null)
    setCommentDraft('')
    if (typeof window !== 'undefined') {
      const selection = window.getSelection()
      selection?.removeAllRanges()
    }
  }

  return (
    <Shell crumbs={[{ href: '/playbooks', label: 'プレイブック' }]}> 
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Playbook Library</div>
                <div className="mt-1 text-base font-semibold">自動化テンプレート</div>
              </div>
              <Sparkles className="h-5 w-5 text-indigo-500" />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              顧客 / ブランド / プログラムの切り口にかかわらず、Single Truthで管理されたプレイブックを再利用できます。
            </p>
          </div>
          <div className="space-y-3">
            {playbooks.map(pb => {
              const isActive = pb.id === selectedPlaybook.id
              const statusTone =
                pb.status === 'approved'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : pb.status === 'draft'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
              return (
                <button
                  key={pb.id}
                  onClick={() => setSelectedPlaybookId(pb.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    isActive ? 'border-indigo-400 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{pb.name}</div>
                      <div className="text-xs text-slate-500">v{pb.version} · {pb.domain}</div>
                    </div>
                    <div className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusTone}`}>
                      {pb.status}
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-600">{pb.summary}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span>ペルソナ: {pb.persona}</span>
                    <ArrowRight className={`h-3 w-3 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`} />
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="space-y-5">
          {selectedPlaybook.id === 'pb_reporting' ? (
            <>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="card p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-500">Context Builder</div>
                      <div className="mt-1 text-base font-semibold">顧客文脈を選択</div>
                    </div>
                    <Wand2 className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="mt-4 inline-flex rounded-full bg-slate-100 p-1 text-xs font-medium">
                    <button
                      onClick={() => setContextMode('auto')}
                      className={`rounded-full px-3 py-1 transition-colors ${
                        contextMode === 'auto'
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      データソースから自動生成
                    </button>
                    <button
                      onClick={() => setContextMode('manual')}
                      className={`rounded-full px-3 py-1 transition-colors ${
                        contextMode === 'manual'
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      コンテキストを貼り付け
                    </button>
                  </div>
                  {contextMode === 'auto' ? (
                    <div className="mt-5 space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm text-slate-700">
                      <div className="flex items-center gap-2 text-indigo-700">
                        <Sparkles className="h-4 w-4" />
                        <span>Sense snapshot st_w47 から文脈を自動抽出しました。</span>
                      </div>
                      <ul className="list-disc space-y-2 pl-5">
                        <li>プロジェクト: BF25 検索Push / mode: shadow → canary</li>
                        <li>最新MetricSnapshot: 2025-11-18 03:00 (ROAS 3.6, 新規比率 28%)</li>
                        <li>承認キュー: BrandOwner 承認済 / Finance 承認不要</li>
                      </ul>
                      <button className="flex items-center gap-1 text-xs font-semibold text-indigo-600">
                        生データを確認 <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5">
                      <label className="text-xs font-semibold text-slate-500">貼り付けたコンテキスト</label>
                      <textarea
                        value={manualContext}
                        onChange={e => setManualContext(e.target.value)}
                        className="mt-2 h-36 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                      <div className="mt-2 text-xs text-slate-500">Copy & Pasteした情報もSnapshotとして保存されます。</div>
                    </div>
                  )}
                </div>

                <div className="card p-5 bg-slate-900 text-slate-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400">Golden Data Scoring</div>
                      <div className="mt-1 text-lg font-semibold">評価スコア {Math.round(goldenScore.score * 100)}</div>
                    </div>
                    <Gauge className="h-5 w-5 text-slate-300" />
                  </div>
                  <div className="mt-6 grid gap-4 text-sm">
                    {goldenScore.rubric.map(metric => (
                      <div key={metric.label}>
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span>{metric.label}</span>
                          <span>{Math.round(metric.value * 100)}%</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-slate-700">
                          <div
                            className="h-full rounded-full bg-emerald-400"
                            style={{ width: `${metric.value * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-xl border border-slate-700/80 bg-slate-800/80 p-3 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-emerald-300" />
                      <span>Drift {goldenScore.drift > 0 ? '+' : ''}{(goldenScore.drift * 100).toFixed(1)}pt vs last run</span>
                    </div>
                    <p className="mt-2 leading-relaxed">
                      ゴールデンデータを基準に自動採点。閾値を下回る場合は Guardrails で prod 実行をブロックします。
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">Insight Run</div>
                    <div className="mt-1 text-lg font-semibold">ウェブ広告レポートインサイト</div>
                    <div className="mt-1 text-sm text-slate-600">
                      Sense → Decide → Run の履歴から生成。コメントでフィードバックすると Playbook 学習が走ります。
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      最新Run: 2025/11/18 06:00 (canary)
                    </div>
                    <button className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:border-indigo-200 hover:text-indigo-600">
                      <RefreshCcw className="h-3.5 w-3.5" /> 再生成
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500">
                      <Target className="h-3.5 w-3.5" /> シミュレーション
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div
                    ref={insightRef}
                    onMouseUp={handleMouseUp}
                    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-sm"
                  >
                    {activeSelection && insightRef.current && (
                      <div
                        className="absolute z-20 w-[240px] rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xl"
                        style={{
                          top: Math.min(activeSelection.top + 32, insightRef.current.scrollHeight - 220),
                          left: Math.min(activeSelection.left, insightRef.current.clientWidth - 250),
                        }}
                      >
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                          <MessageSquarePlus className="h-3.5 w-3.5 text-indigo-500" />
                          選択部分へコメント
                        </div>
                        <div className="mt-2 rounded-lg bg-slate-100 p-2 text-[11px] text-slate-600">
                          {activeSelection.text}
                        </div>
                        <textarea
                          value={commentDraft}
                          onChange={e => setCommentDraft(e.target.value)}
                          placeholder="気づきをメモ..."
                          className="mt-2 h-16 w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                        <div className="mt-2 flex items-center justify-end gap-2 text-[11px]">
                          <button
                            onClick={cancelComposer}
                            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
                          >
                            キャンセル
                          </button>
                          <button
                            onClick={handleAddComment}
                            disabled={!commentDraft.trim()}
                            className={`rounded-lg px-3 py-1 font-semibold ${
                              commentDraft.trim()
                                ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            コメント送信
                          </button>
                        </div>
                      </div>
                    )}

                    <section className="space-y-4">
                      <header className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm">
                        <div className="flex items-center gap-2 text-indigo-700">
                          <Lightbulb className="h-4 w-4" />
                          <span className="font-semibold">Executive Summary</span>
                        </div>
                        <p className="mt-2 text-slate-700">
                          Global Retail Inc. の Q4 週次レビュー。<span className="relative inline-flex items-center gap-1">
                            <span className="rounded bg-amber-100 px-1.5 py-0.5">ROAS は先週比 +12.3%</span>
                            <button className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-[10px] font-semibold text-amber-800">
                              {comments.filter(c => c.quote.includes('ROAS')).length}
                            </button>
                          </span> と改善し、Spend は +5% で抑制。Brand lift の上昇により、新規顧客比率が 31% へ。
                        </p>
                      </header>
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">KPI Deep Dive</h3>
                        <ul className="mt-2 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <li className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                            <span>
                              Paid Search は CPA が <span className="rounded bg-emerald-100 px-1.5 py-0.5">-18%</span>。ネガティブKW除外と広告ランディングの改善が寄与。
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                            <span>
                              Display は View-through が <span className="rounded bg-slate-200 px-1 py-0.5">横ばい</span>。在庫調整の影響で配信量を意図的に抑制。
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Target className="mt-0.5 h-4 w-4 text-indigo-500" />
                            <span>
                              次週は Search canary を 20% に拡大。Guardrails: CPA &lt;= 2,800 円 / brand safety フラグなしを必須条件。
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Drivers & Evidence</h3>
                        <div className="mt-2 space-y-3">
                          <div className="rounded-xl border border-slate-200 p-4">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>Decision Event devt_9xa</span>
                              <button className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                <Database className="h-3.5 w-3.5" /> citations
                              </button>
                            </div>
                            <p className="mt-2 text-sm">
                              候補集合から <span className="rounded bg-indigo-100 px-1.5 py-0.5">adgroup ag1 +8%</span> を採用。競合入札弱とLP速度改善が主因。Sense snapshot st_w47 に基づく根拠を添付。
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs font-semibold text-slate-500">因果評価</div>
                            <p className="mt-2">
                              Switchback 実験 exp_bf25_canary の 7d horizon で ROAS lift <span className="rounded bg-emerald-100 px-1 py-0.5">+15% (CI 0.07–0.23)</span>。信頼区間内で影響を確認済み。
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-indigo-500" />
                          <span>コメントで選択した箇所は Golden Ledger にリンクされ、再生成時に差分が追跡されます。</span>
                        </div>
                      </div>
                    </section>
                  </div>

                  <aside className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-slate-500">主要KPI</div>
                        <BarChart3 className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="mt-3 space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span>ROAS</span>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-slate-900">4.05</span>
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-600">+12%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>CPA</span>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-slate-900">2,640円</span>
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-600">-18%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>新規購入比率</span>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-slate-900">31%</span>
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-600">+7pt</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Spend</span>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-slate-900">¥9.8M</span>
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-600">+5%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">改善キュー</div>
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="mt-3 space-y-3 text-xs">
                        {improvements.map(item => (
                          <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-700">{item.title}</span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                  item.status === '完了'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : item.status === 'レビュー中'
                                      ? 'bg-indigo-50 text-indigo-600'
                                      : 'bg-amber-50 text-amber-600'
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                            <p className="mt-2 leading-relaxed text-slate-600">{item.summary}</p>
                            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                              <span>{item.impact ?? '効果検証待ち'}</span>
                              <span>{item.updatedAt}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </aside>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">Feedback Loop</div>
                    <div className="mt-1 text-lg font-semibold">コメント &amp; Golden Ledger</div>
                  </div>
                  <button className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600">
                    <Database className="h-3.5 w-3.5" /> Ledger を開く
                  </button>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {comments.map(comment => (
                    <div key={comment.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{comment.author}</span>
                        <span>{comment.createdAt}</span>
                      </div>
                      <div className="mt-2 rounded-xl bg-slate-50 p-3 text-[13px] text-slate-700">
                        <span className="block text-[11px] font-semibold text-slate-500">ハイライト</span>
                        <p className="mt-1">{comment.quote}</p>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-slate-700">{comment.body}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            comment.status === '改善済'
                              ? 'bg-emerald-50 text-emerald-600'
                              : comment.status === '改善中'
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {comment.status}
                        </span>
                        {comment.status !== '改善済' && (
                          <span className="text-[11px] text-slate-500">ゴールデンデータ反映中</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="card p-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span>Playbook Overview</span>
              </div>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">{selectedPlaybook.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{selectedPlaybook.summary}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Version: v{selectedPlaybook.version}</span>
                <span>Persona: {selectedPlaybook.persona}</span>
                <span>Status: {selectedPlaybook.status}</span>
              </div>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p>
                  このプレイブックの詳細 UI は現在設計中です。Reporting Playbook のようにコメント駆動の改善ループと安全実行メタを組み込みます。
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </Shell>
  )
}
