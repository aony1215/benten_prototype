'use client'

import { clsx } from 'clsx'
import {
  CheckCircle2,
  FileText,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
} from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'

import { Shell } from '@/components/Shell'
import { WizardLayout } from '@/components/WizardLayout'

type Option = { value: string; label: string; description: string }

const OUTPUT_OPTIONS: Option[] = [
  {
    value: 'proposal',
    label: '提案書を作成する',
    description: '顧客向けの提案書やプランニング資料をAIで下書きします。',
  },
  {
    value: 'ad-logic',
    label: '広告ロジックを設計する',
    description: '配信ロジックや入札ロジックを過去の実績をもとに組み立てます。',
  },
  {
    value: 'report',
    label: '運用レポートを整える',
    description: '週次 / 月次のサマリーやグラフをテンプレートとして生成します。',
  },
]

const CONTEXT_OPTIONS: Option[] = [
  {
    value: 'kickoff',
    label: 'キックオフ議事録',
    description: 'ミーティングの目的と期待値がまとまった議事録。',
  },
  {
    value: 'decision-log',
    label: '意思決定ログ',
    description: '過去に合意した背景や論点をまとめたドキュメント。',
  },
  {
    value: 'success-case',
    label: '成功事例メモ',
    description: '似た施策でうまくいった時の議事録やナレッジ。',
  },
  {
    value: 'persona',
    label: '顧客ペルソナ資料',
    description: 'ターゲットや制約条件がまとまった資料。',
  },
]

const APPROVAL_OPTIONS: Option[] = [
  {
    value: 'owner',
    label: 'あなた（起案者）',
    description: 'ドラフト作成と一次レビューを担当します。',
  },
  {
    value: 'marketing-lead',
    label: 'デジタルマーケ責任者',
    description: '戦略観点での確認をお願いします。',
  },
  {
    value: 'sales-lead',
    label: '営業部長',
    description: '顧客折衝や現場での実装観点をチェックします。',
  },
  {
    value: 'legal',
    label: '法務チーム',
    description: 'コンプライアンス / リスクの最終チェック。',
  },
]

const PREVIEW_CHANNELS: Option[] = [
  {
    value: 'slack',
    label: 'Slack #marketing-sync',
    description: 'チームでリアルタイムに確認。プレビューリンクを送信します。',
  },
  {
    value: 'email',
    label: 'メール（ドラフト共有）',
    description: '承認者にメールでAI生成案を通知します。',
  },
  {
    value: 'workspace',
    label: '社内ワークスペース',
    description: 'Notion / Confluence などのページにプレビューを掲示します。',
  },
]

const FINAL_CHECKS: Option[] = [
  {
    value: 'story',
    label: 'ストーリーラインを確認済み',
    description: '成果物の構成と流れに抜け漏れがないことを確認しました。',
  },
  {
    value: 'risk',
    label: 'リスクと制約を整理済み',
    description: '想定問答やリスクヘッジの項目をまとめました。',
  },
  {
    value: 'distribution',
    label: '配布準備が整った',
    description: '出力形式（PDF など）と共有先を最終確認しました。',
  },
]

function toggleValue(current: string[], value: string) {
  return current.includes(value) ? current.filter(v => v !== value) : [...current, value]
}

export default function NewPlaybookWizard() {
  const totalSteps = 6
  const [step, setStep] = useState(0)
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null)
  const [dataFiles, setDataFiles] = useState<string[]>([])
  const [dataNotes, setDataNotes] = useState('')
  const [contextNotes, setContextNotes] = useState('')
  const [selectedContexts, setSelectedContexts] = useState<string[]>([])
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>(['owner'])
  const [approvalMemo, setApprovalMemo] = useState('')
  const [previewChannel, setPreviewChannel] = useState<string>('slack')
  const [previewMemo, setPreviewMemo] = useState('')
  const [finalChecks, setFinalChecks] = useState<string[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (step !== totalSteps - 1 && isSubmitted) {
      setIsSubmitted(false)
    }
  }, [step, totalSteps, isSubmitted])

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    setDataFiles(prev => {
      const existing = new Set(prev)
      Array.from(files).forEach(file => existing.add(file.name))
      return Array.from(existing)
    })
  }

  const removeFile = (name: string) => {
    setDataFiles(prev => prev.filter(file => file !== name))
  }

  const selectedOutputLabel = useMemo(() => {
    return OUTPUT_OPTIONS.find(option => option.value === selectedOutput)?.label ?? 'アウトプット'
  }, [selectedOutput])

  const canProceed = useMemo(() => {
    switch (step) {
      case 0:
        return Boolean(selectedOutput && (dataFiles.length > 0 || dataNotes.trim().length > 0))
      case 1:
        return contextNotes.trim().length > 0 || selectedContexts.length > 0
      case 2:
        return true
      case 3:
        return selectedApprovers.length > 0
      case 4:
        return Boolean(previewChannel)
      case 5:
        return finalChecks.length === FINAL_CHECKS.length
      default:
        return true
    }
  }, [
    step,
    selectedOutput,
    dataFiles.length,
    dataNotes,
    contextNotes,
    selectedContexts.length,
    selectedApprovers.length,
    previewChannel,
    finalChecks.length,
  ])

  const previewSummary = useMemo(() => {
    switch (selectedOutput) {
      case 'proposal':
        return '顧客課題に合わせた提案骨子と、差別化ポイントを含む実行プランを生成しました。'
      case 'ad-logic':
        return '過去の成果データから、入札調整やターゲティング条件を含む広告ロジック案をまとめました。'
      case 'report':
        return '主要KPIとインサイトを盛り込んだ運用レポートの雛形を自動構築しました。'
      default:
        return '選択したアウトプットに合わせて、AIがすぐに使えるドラフトを提案します。'
    }
  }, [selectedOutput])

  const selectedContextLabels = useMemo(() => {
    return CONTEXT_OPTIONS.filter(option => selectedContexts.includes(option.value)).map(option => option.label)
  }, [selectedContexts])

  const selectedApproverLabels = useMemo(() => {
    return APPROVAL_OPTIONS.filter(option => selectedApprovers.includes(option.value)).map(option => option.label)
  }, [selectedApprovers])

  const handleNext = () => {
    if (step === totalSteps - 1) {
      if (canProceed) {
        setIsSubmitted(true)
      }
      return
    }
    setStep(prev => Math.min(prev + 1, totalSteps - 1))
  }

  const handleBack = () => {
    if (step === 0) {
      return
    }
    setStep(prev => Math.max(prev - 1, 0))
  }

  const nextLabel = step === totalSteps - 1 ? '完了にする' : '次へ'

  return (
    <Shell crumbs={[{ href: '/playbooks', label: 'プレイブック一覧' }, { href: '/playbooks/new', label: '新規ワークフロー' }]}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">ウィザードでワークフローを設計</h1>
          <p className="text-sm text-slate-500">
            データと文脈を順番に整理しながら、AIが提案書や広告ロジックのドラフトをつくります。チームに優しい表現で案内しています。
          </p>
        </div>

        {isSubmitted && step === totalSteps - 1 ? (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5" />
            <div>
              <div className="font-semibold">最終承認が完了しました</div>
              <div className="mt-1 text-emerald-600">
                プレビュー実行結果を承認ログに保存し、チームへ完了通知を送信します。必要があればいつでも前のステップに戻って調整できます。
              </div>
            </div>
          </div>
        ) : null}

        <WizardLayout
          stepIdx={step}
          total={totalSteps}
          title={
            [
              'データをそろえましょう',
              '背景とコンテキストを共有',
              'AIが下書きをプレビュー',
              '承認フローを設定',
              'プレビューを実行',
              '最終承認',
            ][step]
          }
          question={
            [
              'どんな成果物を作成し、どのデータをアップロードしますか？',
              'この施策の背景や参考資料は何ですか？',
              'AIが生成した案を確認し、調整ポイントをメモしましょう。',
              '誰にレビュー・承認を依頼しますか？',
              'どこでプレビューを共有し、どんなコメントを添えますか？',
              '公開前にクリアすべきチェック項目は満たせていますか？',
            ][step]
          }
          onBack={handleBack}
          onNext={handleNext}
          backDisabled={step === 0}
          nextDisabled={step === totalSteps - 1 ? !canProceed || isSubmitted : !canProceed}
          nextLabel={nextLabel}
        >
          {step === 0 && (
            <div className="space-y-6">
              <section className="space-y-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">作りたいアウトプットを選択</div>
                  <p className="text-sm text-slate-500">
                    提案書、広告ロジック、運用レポートなど用途に合わせてスタートしましょう。
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {OUTPUT_OPTIONS.map(option => {
                    const isActive = option.value === selectedOutput
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedOutput(option.value)}
                        className={clsx(
                          'flex h-full flex-col gap-2 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200',
                          isActive
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                            : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium">{option.label}</span>
                          {isActive ? <CheckCircle2 className="h-5 w-5 text-indigo-500" /> : null}
                        </div>
                        <p className="text-sm text-slate-500">{option.description}</p>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <UploadCloud className="h-5 w-5 text-indigo-500" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">参考データをアップロード</div>
                    <p className="text-xs text-slate-500">
                      PDF・議事録・マニュアルなどの非構造化データもそのまま取り込めます。
                    </p>
                  </div>
                </div>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center hover:border-indigo-200 hover:bg-indigo-50">
                  <span className="text-sm font-medium text-slate-600">ここにドラッグ＆ドロップ、またはクリックして選択</span>
                  <input
                    type="file"
                    multiple
                    onChange={event => handleFileUpload(event.target.files)}
                    className="hidden"
                  />
                </label>
                {dataFiles.length > 0 ? (
                  <ul className="grid gap-2">
                    {dataFiles.map(file => (
                      <li
                        key={file}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          {file}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-slate-400 hover:text-rose-500"
                          onClick={() => removeFile(file)}
                        >
                          削除
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>

              <section className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">メモがあれば追記</div>
                <textarea
                  value={dataNotes}
                  onChange={event => setDataNotes(event.target.value)}
                  className="h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="例：2024年上期の実績PDFと最新のサポートFAQを利用予定。重要指標はCVRとROAS。"
                />
              </section>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <section className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">参考コンテキストを選択</div>
                <p className="text-sm text-slate-500">
                  成功した時の議事録や意思決定の背景など、AIに教えたい資料をチェックしましょう。
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {CONTEXT_OPTIONS.map(option => {
                    const isActive = selectedContexts.includes(option.value)
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedContexts(prev => toggleValue(prev, option.value))}
                        className={clsx(
                          'flex h-full flex-col gap-2 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200',
                          isActive
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                            : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium">{option.label}</span>
                          {isActive ? <CheckCircle2 className="h-5 w-5 text-indigo-500" /> : null}
                        </div>
                        <p className="text-sm text-slate-500">{option.description}</p>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">背景メモ</div>
                <textarea
                  value={contextNotes}
                  onChange={event => setContextNotes(event.target.value)}
                  className="h-36 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="例：前回の提案で評価されたポイントはスピード感。今回も意思決定の裏付けとして在庫データとの連携をアピールする。"
                />
                <p className="text-xs text-slate-500">
                  参考資料のURLや補足メモもここに貼り付けてください。AIが背景を理解した状態で生成します。
                </p>
              </section>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
                  <Sparkles className="h-4 w-4" /> 生成AIプレビュー
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{previewSummary}</p>
                {selectedContextLabels.length > 0 ? (
                  <p className="mt-3 text-xs text-indigo-600">
                    参照コンテキスト: {selectedContextLabels.join(' / ')}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Sparkles className="h-4 w-4 text-indigo-500" /> Action Template
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    ・イントロダクション（課題とゴール）
                    <br />・主要施策（{selectedOutputLabel}向けの推奨アクション）
                    <br />・KPI と次の一手
                  </p>
                </div>
                <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <ShieldCheck className="h-4 w-4 text-indigo-500" /> Logic（虎の巻）
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    ・意思決定の背景と判断基準
                    <br />・成功事例からの学び
                    <br />・リスクと回避策（ファクトと引用元を添付）
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-600 shadow-sm transition hover:bg-indigo-50"
                >
                  <Sparkles className="h-4 w-4" /> 別案を再生成
                </button>
                <span className="text-xs text-slate-500">
                  コメントや修正ポイントは次のステップで承認者に共有できます。
                </span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-500" />
                  <div className="text-sm font-semibold text-slate-900">承認に参加するメンバー</div>
                </div>
                <p className="text-sm text-slate-500">
                  どの段階で誰が確認するかを明確にし、迷いのない承認フローをつくりましょう。
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {APPROVAL_OPTIONS.map(option => {
                    const isActive = selectedApprovers.includes(option.value)
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedApprovers(prev => toggleValue(prev, option.value))}
                        className={clsx(
                          'flex h-full flex-col gap-2 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200',
                          isActive
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                            : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium">{option.label}</span>
                          {isActive ? <CheckCircle2 className="h-5 w-5 text-indigo-500" /> : null}
                        </div>
                        <p className="text-sm text-slate-500">{option.description}</p>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">承認メモ</div>
                <textarea
                  value={approvalMemo}
                  onChange={event => setApprovalMemo(event.target.value)}
                  className="h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="例：一次レビューは責任者にスピーディーに確認してもらい、法務は最終チェックのみ。"
                />
              </section>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-indigo-500" />
                  <div className="text-sm font-semibold text-slate-900">プレビューの共有先</div>
                </div>
                <p className="text-sm text-slate-500">
                  まずは安全なプレビューで確認。送信先と伝えたいメッセージを準備しましょう。
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  {PREVIEW_CHANNELS.map(option => {
                    const isActive = option.value === previewChannel
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPreviewChannel(option.value)}
                        className={clsx(
                          'flex h-full flex-col gap-2 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200',
                          isActive
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                            : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium">{option.label}</span>
                          {isActive ? <CheckCircle2 className="h-5 w-5 text-indigo-500" /> : null}
                        </div>
                        <p className="text-sm text-slate-500">{option.description}</p>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">プレビューに添えるメッセージ</div>
                <textarea
                  value={previewMemo}
                  onChange={event => setPreviewMemo(event.target.value)}
                  className="h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="例：Slack でサマリーを共有し、コメントが揃い次第ステップ6で最終承認します。"
                />
                <p className="text-xs text-slate-500">
                  プレビュー実行後に自動でログへ記録されます。コメントもまとめて確認できます。
                </p>
              </section>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-500" />
                  <div className="text-sm font-semibold text-slate-900">最終チェックリスト</div>
                </div>
                <p className="text-sm text-slate-500">
                  公開前に抜け漏れがないか、チェック項目をすべてクリアしましょう。
                </p>
                <div className="grid gap-3">
                  {FINAL_CHECKS.map(option => {
                    const isActive = finalChecks.includes(option.value)
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFinalChecks(prev => toggleValue(prev, option.value))}
                        className={clsx(
                          'flex flex-col gap-1 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200',
                          isActive
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm'
                            : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
                        )}
                      >
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <CheckCircle2 className={clsx('h-5 w-5', isActive ? 'text-emerald-500' : 'text-slate-300')} />
                          {option.label}
                        </div>
                        <p className="text-sm text-slate-500">{option.description}</p>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">ここまでのまとめ</div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>
                    <span className="font-medium text-slate-700">アウトプット：</span>
                    {selectedOutputLabel}
                  </li>
                  <li>
                    <span className="font-medium text-slate-700">アップロード済み：</span>
                    {dataFiles.length > 0 ? dataFiles.join(', ') : 'テキストメモのみ'}
                  </li>
                  <li>
                    <span className="font-medium text-slate-700">共有コンテキスト：</span>
                    {selectedContextLabels.length > 0 ? selectedContextLabels.join(', ') : 'なし'}
                  </li>
                  <li>
                    <span className="font-medium text-slate-700">承認メンバー：</span>
                    {selectedApproverLabels.join(', ')}
                  </li>
                  <li>
                    <span className="font-medium text-slate-700">プレビュー共有先：</span>
                    {PREVIEW_CHANNELS.find(option => option.value === previewChannel)?.label ?? '未設定'}
                  </li>
                </ul>
                <p className="text-xs text-slate-500">
                  「完了にする」を押すと承認記録を保存し、通知を送信します。
                </p>
              </section>
            </div>
          )}
        </WizardLayout>
      </div>
    </Shell>
  )
}

