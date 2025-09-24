'use client'

import Link from 'next/link'
import { useState } from 'react'
import { clsx } from 'clsx'
import {
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileText,
  GaugeCircle,
  Lightbulb,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Target,
  Wand2,
} from 'lucide-react'

import { Shell } from '@/components/Shell'
import { CTA } from '@/components/ui/CTA'

const autoSummaries = [
  {
    label: '顧客コンテキスト',
    value: 'A社（Global Retail Inc.） / リテール',
    description: '過去12週間のEC売上 +12.4%、在庫API同期済み。主要関心は新規顧客獲得。',
  },
  {
    label: 'レポート対象期間',
    value: '2024年Q4・第3週',
    description: '広告費 2,460,000円（前週比 +8%） / 売上 12,400,000円（+13%）。',
  },
  {
    label: '優先KPI',
    value: 'ROAS 250% / CPA 1,200円以下',
    description: 'Google Ads・Meta Adsの混合評価。店舗送客は参考指標扱い。',
  },
]

const connectors = [
  { name: 'Google Ads', type: '広告', lastSync: '3分前', status: '同期済み' },
  { name: 'GA4（E-commerce）', type: '計測', lastSync: '5分前', status: '同期済み' },
  { name: '在庫DB（BigQuery）', type: '商品', lastSync: '12分前', status: '差分取り込み済み' },
  { name: '競合価格トラッカー', type: '外部', lastSync: '27分前', status: '新着データあり' },
]

const goldenScores = [
  { label: 'データ整合性', score: 92, trend: '+3', description: 'トラッキング差分±1.4%以内。' },
  { label: '説明責任', score: 87, trend: '+5', description: 'ゴールデンデータと要因説明が一致。' },
  { label: 'アクション実効性', score: 78, trend: '+4', description: '改善提案→実行の反映スピード。' },
]

const commentThreads = [
  {
    id: 'summary',
    title: 'CPA改善ハイライト',
    highlight: '「リターゲティング配信のCVR改善を強調」',
    comments: [
      {
        id: 'c1',
        author: '山本（広告主）',
        time: '今日 10:24',
        message: 'リターゲティング改善の背景にクリエイティブ差し替えがあった旨も補足したいです。',
      },
      {
        id: 'c2',
        author: 'Benten Copilot',
        time: '今日 10:25',
        message: 'クリエイティブ差し替え（9/18実施）のクリック率 +26% を追記しました。シナリオにも反映済みです。',
      },
    ],
    improvement: {
      status: '自動調整済み',
      detail: 'サマリー段落に施策背景と数値根拠を追加しました。',
    },
  },
  {
    id: 'kpi',
    title: 'ROASの説明の仕立て',
    highlight: '「検索キャンペーンのROAS寄与」',
    comments: [
      {
        id: 'c3',
        author: '田中（AE）',
        time: '今日 09:41',
        message: '検索キャンペーンの在庫影響を定量化できると説得力が増しそう。',
      },
      {
        id: 'c4',
        author: 'Benten Copilot',
        time: '今日 09:44',
        message: '在庫連携データから欠品比率2.4% → 0.7%への改善を算出し、KPIセクションに引用しました。',
      },
    ],
    improvement: {
      status: 'ゴールデンデータ照合済み',
      detail: '在庫DBとの突合をクリアし、信頼度Aで採点。',
    },
  },
  {
    id: 'creative',
    title: 'Meta動画クリエイティブ',
    highlight: '「動画A/Bテストの結果を引用」',
    comments: [
      {
        id: 'c5',
        author: '佐藤（デザイナー）',
        time: '昨日 18:03',
        message: '動画Bの再生率は？顧客レポートにも記載したいです。',
      },
      {
        id: 'c6',
        author: 'Benten Copilot',
        time: '昨日 18:04',
        message: '再生率 42%（前週比 +9pt）を追加しました。要望に合わせてダウンロード素材も更新済み。',
      },
    ],
    improvement: {
      status: 'アセット更新完了',
      detail: 'Meta広告用ライブラリに最新サムネイルを自動反映。',
    },
  },
]

export default function ReportingPlaybook() {
  const [contextMode, setContextMode] = useState<'auto' | 'manual'>('auto')
  const [activeHighlight, setActiveHighlight] = useState<string>('summary')

  const activeThread = commentThreads.find(thread => thread.id === activeHighlight) ?? commentThreads[0]

  const manualPlaceholder = `例）
・今週の重点施策はブラックフライデー向け新商品ローンチ。
・CRM連携クーポンを11/20開始。引き続き効果測定が必要。
・競合A社が同価格帯でクーポン配布を開始したとの情報あり。`

  const Highlight = ({ id, children }: { id: string; children: React.ReactNode }) => {
    const isActive = activeHighlight === id
    return (
      <button
        type="button"
        onClick={() => setActiveHighlight(id)}
        className={clsx(
          'rounded-md px-1 -mx-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300',
          isActive
            ? 'bg-amber-200/80 text-amber-900 shadow-inner'
            : 'bg-amber-100/70 text-amber-800 hover:bg-amber-200/80'
        )}
      >
        {children}
      </button>
    )
  }

  return (
    <Shell
      crumbs={[
        { href: '/playbooks', label: 'プレイブック一覧' },
        { href: '/playbooks/reporting', label: '週次レポート自動化 / レポーティング開始' },
      ]}
    >
      <div className="space-y-6">
        <div className="card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                <Sparkles className="h-3.5 w-3.5" />
                レポーティング自動生成プレイブック
              </div>
              <h1 className="text-2xl font-semibold text-slate-900">ウェブ広告レポート：レポーティング開始フロー</h1>
              <p className="text-sm leading-relaxed text-slate-600">
                顧客ごとの文脈と接続済みデータソースを読み込み、レポートドラフトとインサイトを生成します。
                コメントによるフィードバックは即時に反映され、ゴールデンデータと突合して採点されます。
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
                  <RefreshCw className="h-3.5 w-3.5" />
                  最終生成: 今日 10:26
                </div>
                <div className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  ステータス: 配信準備OK
                </div>
                <Link href="#" className="text-indigo-600 hover:underline">
                  過去バージョンを表示
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-2 text-sm text-slate-600">
              <CTA>インサイトを再生成</CTA>
              <button
                type="button"
                className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                レポートをエクスポート
              </button>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
              <div className="text-xs font-semibold text-slate-500">対象顧客</div>
              <div className="mt-1 text-sm font-medium text-slate-800">A社（Global Retail Inc.）</div>
              <div className="text-xs text-slate-500">担当: あなた / プロジェクトX</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
              <div className="text-xs font-semibold text-slate-500">適用テンプレート</div>
              <div className="mt-1 text-sm font-medium text-slate-800">週次レポート自動化 v0.3.1</div>
              <div className="text-xs text-slate-500">ブランド: ShoeStore</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
              <div className="text-xs font-semibold text-slate-500">AIレビュー</div>
              <div className="mt-1 flex items-baseline gap-1 text-sm font-medium text-emerald-600">
                <GaugeCircle className="h-4 w-4" /> 92 / 100
              </div>
              <div className="text-xs text-slate-500">ゴールデンデータ整合性A</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
              <div className="text-xs font-semibold text-slate-500">配布チャネル</div>
              <div className="mt-1 text-sm font-medium text-slate-800">メール / Notion / Slack</div>
              <div className="text-xs text-slate-500">コメント同期: すべてON</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="space-y-4">
            <section className="card space-y-4 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">文脈の取り込み</h2>
                  <p className="text-xs text-slate-500">データソースからの自動文脈生成 or 手動ペーストを切り替え</p>
                </div>
                <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setContextMode('auto')}
                    className={clsx(
                      'rounded-full px-3 py-1 font-semibold transition',
                      contextMode === 'auto'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    自動生成
                  </button>
                  <button
                    type="button"
                    onClick={() => setContextMode('manual')}
                    className={clsx(
                      'rounded-full px-3 py-1 font-semibold transition',
                      contextMode === 'manual'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    手動入力
                  </button>
                </div>
              </div>
              {contextMode === 'auto' ? (
                <div className="space-y-3">
                  {autoSummaries.map(summary => (
                    <div key={summary.label} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{summary.label}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-800">{summary.value}</div>
                      <p className="mt-1 text-xs text-slate-500">{summary.description}</p>
                    </div>
                  ))}
                  <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/60 p-3 text-xs text-indigo-700">
                    <div className="flex items-center gap-2 font-medium">
                      <Sparkles className="h-3.5 w-3.5" />
                      データから抽出した仮説をレポート構成に自動反映しました。
                    </div>
                    <p className="mt-1 leading-relaxed">必要に応じてハイライト部分を編集・コメントしてください。</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-600" htmlFor="manual-context">
                    顧客から共有されたコンテキストを貼り付け
                  </label>
                  <textarea
                    id="manual-context"
                    rows={8}
                    defaultValue={manualPlaceholder}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>テキストを保存すると即座にレポートに反映されます。</span>
                    <CTA className="px-3 py-1 text-xs">保存して再生成</CTA>
                  </div>
                </div>
              )}
            </section>

            <section className="card space-y-3 p-5">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-indigo-600" />
                <h2 className="text-base font-semibold text-slate-900">接続済みデータソース</h2>
              </div>
              <p className="text-xs text-slate-500">同期状況は自動で監視され、遅延時はレポート生成前に通知されます。</p>
              <div className="space-y-2">
                {connectors.map(connector => (
                  <div
                    key={connector.name}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{connector.name}</div>
                      <div className="text-xs text-slate-500">{connector.type} / 最終同期 {connector.lastSync}</div>
                    </div>
                    <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                      {connector.status}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                新しいデータソースを追加
              </button>
            </section>

            <section className="card space-y-4 p-5">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-indigo-600" />
                <h2 className="text-base font-semibold text-slate-900">ゴールデンデータ採点</h2>
              </div>
              <p className="text-xs text-slate-500">
                レポート内の主張は社内で定義したゴールデンデータセットと突合され、毎回スコアリングされます。
              </p>
              <div className="space-y-3">
                {goldenScores.map(score => (
                  <div key={score.label} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-800">{score.label}</div>
                      <div className="text-xs font-semibold text-emerald-600">{score.trend}</div>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="absolute inset-y-0 left-0 bg-emerald-500"
                          style={{ width: `${score.score}%` }}
                        />
                      </div>
                      <div className="text-sm font-semibold text-slate-800">{score.score}</div>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{score.description}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 text-xs text-indigo-700">
                <div className="font-semibold">採点結果に応じて自動で修正候補を提示します。</div>
                <p className="mt-1 leading-relaxed">不足データがある場合は差分抽出を提案し、AI校正で整合性を保ちます。</p>
              </div>
            </section>
          </div>

          <div className="space-y-4">
            <section className="card p-0">
              <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">生成されたレポートアウトプット</h2>
                  <p className="text-xs text-slate-500">
                    テキストをドラッグで選択するとコメントができます（デモではクリックで切り替え）。
                  </p>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  最新版が公開待ち
                </div>
              </header>
              <div className="grid gap-0 border-b border-slate-200 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="space-y-5 px-5 py-5">
                  <article className="space-y-4 text-sm leading-relaxed text-slate-700">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <FileText className="h-3.5 w-3.5" /> エグゼクティブサマリー
                    </div>
                    <p>
                      今週の広告投資は <Highlight id="summary">リターゲティング配信の最適化によりCPAが目標比-18%</Highlight>{' '}
                      まで改善し、ROASは 268% を達成しました。クリエイティブ刷新と在庫データ連携により、
                      品切れ商品の配信停止が自動化され、無駄配信が前週比で 32% 削減されています。
                    </p>
                    <p>
                      ブランド検索は在庫復活の影響でCVRが高水準を維持しており、特に{' '}
                      <Highlight id="kpi">在庫APIによる欠品検知の改善が検索キャンペーンROASに+21pt寄与</Highlight>しました。
                      Meta動画では新クリエイティブB案が指名検索の想起向上に寄与しており、次週は新規配信枠への展開を推奨します。
                    </p>
                    <div className="rounded-xl bg-slate-100 p-4 text-sm">
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <BarChart3 className="h-4 w-4 text-indigo-600" /> KPIスナップショット
                      </div>
                      <div className="mt-2 grid gap-3 sm:grid-cols-3">
                        <div>
                          <div className="text-xs text-slate-500">ROAS</div>
                          <div className="text-lg font-semibold text-slate-900">268%</div>
                          <div className="text-xs text-emerald-600">+13pt 前週比</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">CPA</div>
                          <div className="text-lg font-semibold text-slate-900">¥1,090</div>
                          <div className="text-xs text-emerald-600">-18% 目標比</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">新規顧客獲得</div>
                          <div className="text-lg font-semibold text-slate-900">+24%</div>
                          <div className="text-xs text-slate-500">オーディエンス拡張施策</div>
                        </div>
                      </div>
                    </div>
                  </article>

                  <article className="space-y-4 text-sm leading-relaxed text-slate-700">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <Lightbulb className="h-3.5 w-3.5" /> 深掘りインサイト
                    </div>
                    <p>
                      <Highlight id="creative">Meta動画クリエイティブB案が再生率42%でトップパフォーマンス</Highlight>となり、
                      リターゲティング配信でのCTR 3.2%（+0.6pt）を牽引しました。動画内CTAを「会員登録」に統一したことで、
                      新規会員獲得が過去4週間で最大値を更新しています。
                    </p>
                    <p>
                      Google検索では「在庫あり」キーワード群の品質スコアが8.6まで改善。欠品シグナルを除外する仕組みが
                      作用しており、広告配信停止までのリードタイムは平均3.4時間→42分まで短縮されました。
                    </p>
                    <div className="rounded-xl bg-slate-100 p-4 text-sm">
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <Target className="h-4 w-4 text-indigo-600" /> 次の一手
                      </div>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
                        <li>Meta動画B案の高パフォーマンスオーディエンスをYouTube Actionに展開（自動で配信設定へ送信）。</li>
                        <li>在庫シグナル連携の検知閾値を±10%に調整し、欠品リスク商品を事前に警告。</li>
                        <li>CRMクーポン施策の流入をGA4のラストクリックレポートにマッピングし、メール配信と連携。</li>
                      </ul>
                    </div>
                  </article>
                </div>

                <aside className="flex flex-col border-t border-slate-200 lg:border-l lg:border-t-0">
                  <div className="px-5 py-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">コメントと改善サイクル</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {commentThreads.map(thread => (
                        <button
                          key={thread.id}
                          type="button"
                          onClick={() => setActiveHighlight(thread.id)}
                          className={clsx(
                            'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition',
                            activeHighlight === thread.id
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          )}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          {thread.title}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 border-t border-slate-200 bg-slate-50/70 px-5 py-4">
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-500">ハイライト</div>
                        <div className="mt-1 text-sm font-semibold text-slate-800">{activeThread.title}</div>
                        <p className="text-xs text-slate-500">{activeThread.highlight}</p>
                      </div>
                      <div className="space-y-3">
                        {activeThread.comments.map(comment => (
                          <div key={comment.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-700">{comment.author}</span>
                              <span className="text-[11px] text-slate-400">{comment.time}</span>
                            </div>
                            <p className="mt-1 leading-relaxed text-slate-600">{comment.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 px-5 py-4 space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-500">改善ステータス</div>
                      <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                        <Wand2 className="h-3.5 w-3.5" />
                        {activeThread.improvement.status}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{activeThread.improvement.detail}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600" htmlFor="comment-input">
                        追記コメント
                      </label>
                      <textarea
                        id="comment-input"
                        rows={3}
                        placeholder="ハイライトした内容へのフィードバックを入力（Cmd+Enterで送信）"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>コメントするとAIがドラフトを再生成します。</span>
                        <CTA className="px-3 py-1 text-xs" variant="outline" disabled>
                          送信（デモ）
                        </CTA>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </section>

            <section className="card p-5">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-indigo-600" />
                <h2 className="text-base font-semibold text-slate-900">改善履歴と採点ログ</h2>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-3 text-xs">
                  <div className="font-semibold text-slate-700">10:26 レポート再生成</div>
                  <p className="mt-1 text-slate-500">コメント3件を反映。ゴールデンデータ検証を再実行し、信頼度Aで承認。</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 text-xs">
                  <div className="font-semibold text-slate-700">09:45 KPIセクション調整</div>
                  <p className="mt-1 text-slate-500">在庫DB差分を取り込み、ROAS説明ブロックを自動更新。</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 text-xs">
                  <div className="font-semibold text-slate-700">昨日 18:04 クリエイティブ更新</div>
                  <p className="mt-1 text-slate-500">動画Bの再生率を採点し、AIがサマリーと推奨施策に反映。</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  評価メモ
                </div>
                <p className="mt-1 leading-relaxed">
                  コメントベースの再生成は平均 34 秒で完了。ゴールデンデータとの整合性が 90 点を下回った場合は、
                  追加証拠の提示 or データ抽出依頼を自動で促します。
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Shell>
  )
}
