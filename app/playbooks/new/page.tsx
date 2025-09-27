'use client'

import { useMemo, useState } from 'react'
import { Shell } from '@/components/Shell'
import { WizardLayout } from '@/components/WizardLayout'
import { CTA } from '@/components/ui/CTA'
import { Check } from 'lucide-react'
import { clsx } from 'clsx'

const DATA_OPTIONS = [
  { id: 'pdf', label: 'PDF / 資料', description: '提案書や調査資料などの静的ドキュメント' },
  { id: 'minutes', label: '議事録', description: '会議ログやチャット抜粋などの意思決定履歴' },
  { id: 'manual', label: 'マニュアル', description: '既存の運用手順やSOPを一次データ化' },
  { id: 'sheet', label: 'スプレッドシート', description: 'KPIや顧客リストなどの構造化データ' },
] as const

const CONTEXT_CANDIDATES = [
  { id: 'success_run', title: '成功事例の議事録', rationale: '過去の成功パターンを参照し、意思決定の背景を可視化' },
  { id: 'decision_memo', title: '承認時の意思決定メモ', rationale: '選択理由と却下理由をGolden Ledgerに保存' },
  { id: 'risk_register', title: 'リスク登録簿', rationale: '既知の落とし穴をGuardrailとして取り込む' },
] as const

const STEP_DEFINITIONS = [
  {
    key: 'data',
    title: '一次データの固定化',
    question: 'Sense（Ingest & Snapshot）で Run.data_snapshot を準備します',
  },
  {
    key: 'context',
    title: '参考コンテキストの収集',
    question: 'Golden Ledger に「候補→選択→根拠」を登録します',
  },
  {
    key: 'action',
    title: 'Action_template と Logic（虎の巻）生成',
    question: '生成AIの案を起点に承認フローで確定させます',
  },
  {
    key: 'artifact',
    title: 'アウトプットテンプレートの定義',
    question: 'Artifacts として生成物の「型」を決めます',
  },
  {
    key: 'preview',
    title: '入力投入とプレビュー実行',
    question: 'Safe Runtime の Shadow / Canary で挙動を確認します',
  },
  {
    key: 'approval',
    title: '最終承認とログ化',
    question: 'Approvals エンティティに記録し、不変ログを残します',
  },
] as const

type StepKey = (typeof STEP_DEFINITIONS)[number]['key']

type GuardrailOption = 'bias' | 'privacy' | 'tone'

const GUARDRAIL_OPTIONS: { id: GuardrailOption; label: string; description: string }[] = [
  { id: 'bias', label: 'バイアス抑制', description: '生成内容の差別・偏見表現を自動チェック' },
  { id: 'privacy', label: '個人情報保護', description: 'PII の流出を防止するフィルタリング' },
  { id: 'tone', label: 'トーン調整', description: 'ブランドらしい言い回しに統一' },
]

const PREVIEW_MODES = [
  { id: 'shadow', label: 'Shadow', description: '本番と同じ入力で裏側検証（顧客への露出なし）' },
  { id: 'canary', label: 'Canary', description: '限定公開で少数ロールアウトし挙動確認' },
] as const

export default function NewPlaybookWizard() {
  const [stepIdx, setStepIdx] = useState(0)
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>(['pdf'])
  const [snapshotName, setSnapshotName] = useState('run_data_snapshot_v1')
  const [contextSelections, setContextSelections] = useState<string[]>(['success_run'])
  const [contextNotes, setContextNotes] = useState('成功事例の議事録からKPI改善プロセスを引用。')
  const [actionApproach, setActionApproach] = useState<'ai-first' | 'reuse'>('ai-first')
  const [logicOwner, setLogicOwner] = useState('Operations Team')
  const [guardrails, setGuardrails] = useState<GuardrailOption[]>(['bias', 'privacy'])
  const [artifactName, setArtifactName] = useState('週次レポート・アウトライン')
  const [artifactSections, setArtifactSections] = useState('1. Executive Summary\n2. KPI Snapshot\n3. Root Cause / 次の一手')
  const [previewMode, setPreviewMode] = useState<'shadow' | 'canary'>('shadow')
  const [previewExecuted, setPreviewExecuted] = useState(false)
  const [finalApproval, setFinalApproval] = useState(false)

  const totalSteps = STEP_DEFINITIONS.length
  const current = STEP_DEFINITIONS[stepIdx]

  const toggleDataSource = (id: string) => {
    setSelectedDataSources(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
  }

  const toggleContext = (id: string) => {
    setContextSelections(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
  }

  const toggleGuardrail = (id: GuardrailOption) => {
    setGuardrails(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
  }

  const nextDisabled = useMemo(() => {
    switch (current.key as StepKey) {
      case 'data':
        return selectedDataSources.length === 0 || snapshotName.trim() === ''
      case 'context':
        return contextSelections.length === 0 || contextNotes.trim() === ''
      case 'action':
        return !actionApproach || logicOwner.trim() === ''
      case 'artifact':
        return artifactName.trim() === '' || artifactSections.trim() === ''
      case 'preview':
        return !previewExecuted
      case 'approval':
        return !finalApproval
      default:
        return false
    }
  }, [
    current.key,
    selectedDataSources,
    snapshotName,
    contextSelections,
    contextNotes,
    actionApproach,
    logicOwner,
    artifactName,
    artifactSections,
    previewExecuted,
    finalApproval,
  ])

  const handleNext = () => {
    if (stepIdx === totalSteps - 1) {
      alert('Approvals に承認を記録しました（デモ）')
      return
    }
    setStepIdx(idx => Math.min(totalSteps - 1, idx + 1))
  }

  const handleBack = () => {
    setStepIdx(idx => Math.max(0, idx - 1))
  }

  const summary = useMemo(
    () => ({
      selectedDataSources,
      snapshotName,
      contextSelections,
      contextNotes,
      actionApproach,
      logicOwner,
      guardrails,
      artifactName,
      artifactSections,
      previewMode,
    }),
    [
      selectedDataSources,
      snapshotName,
      contextSelections,
      contextNotes,
      actionApproach,
      logicOwner,
      guardrails,
      artifactName,
      artifactSections,
      previewMode,
    ],
  )

  return (
    <Shell
      crumbs={[
        { href: '/playbooks', label: 'プレイブック一覧' },
        { href: '/playbooks/new', label: '新規作成フロー' },
      ]}
    >
      <WizardLayout
        stepIdx={stepIdx}
        total={totalSteps}
        title={current.title}
        question={current.question}
        onBack={handleBack}
        onNext={handleNext}
        nextDisabled={nextDisabled}
      >
        {current.key === 'data' && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {DATA_OPTIONS.map(option => {
                const selected = selectedDataSources.includes(option.id)
                return (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => toggleDataSource(option.id)}
                    className={clsx(
                      'rounded-2xl border p-4 text-left transition hover:bg-slate-50',
                      selected ? 'border-indigo-300 ring-2 ring-indigo-200' : 'border-slate-300',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-800">{option.label}</div>
                      <span
                        className={clsx(
                          'grid h-6 w-6 place-items-center rounded-lg border text-xs font-semibold',
                          selected ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-slate-500',
                        )}
                      >
                        {selected ? <Check className="h-4 w-4" /> : '+'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{option.description}</p>
                  </button>
                )
              })}
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-500">Snapshot 名称</label>
              <input
                className="rounded-xl border border-slate-300 px-3 py-2"
                value={snapshotName}
                onChange={event => setSnapshotName(event.target.value)}
                placeholder="run_data_snapshot_v1"
              />
              <p className="text-xs text-slate-400">Sense → Run.data_snapshot に固定化するファイルセットを識別します。</p>
            </div>
          </div>
        )}

        {current.key === 'context' && (
          <div className="space-y-4">
            <div className="grid gap-3">
              {CONTEXT_CANDIDATES.map(candidate => {
                const selected = contextSelections.includes(candidate.id)
                return (
                  <button
                    type="button"
                    key={candidate.id}
                    onClick={() => toggleContext(candidate.id)}
                    className={clsx(
                      'rounded-2xl border p-4 text-left transition hover:bg-slate-50',
                      selected ? 'border-indigo-300 ring-2 ring-indigo-200' : 'border-slate-300',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-800">{candidate.title}</div>
                        <p className="mt-1 text-sm text-slate-500">{candidate.rationale}</p>
                      </div>
                      <span
                        className={clsx(
                          'grid h-6 w-6 place-items-center rounded-lg border text-xs font-semibold',
                          selected ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-slate-500',
                        )}
                      >
                        {selected ? <Check className="h-4 w-4" /> : '+'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-500">選定メモ</label>
              <textarea
                className="min-h-[120px] rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                value={contextNotes}
                onChange={event => setContextNotes(event.target.value)}
                placeholder="Golden Ledger に残す「候補→選択→根拠」を記載"
              />
              <p className="text-xs text-slate-400">意思決定理由を残すと、後続の承認がスムーズになります。</p>
            </div>
          </div>
        )}

        {current.key === 'action' && (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { id: 'ai-first', label: 'AIドラフト→承認', description: '生成AIが初稿を作り、担当者がGuardrailsで確認' },
                { id: 'reuse', label: '既存テンプレート流用', description: 'Golden Ledger の既存Playbookを再利用して調整' },
              ].map(option => {
                const selected = actionApproach === option.id
                return (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => setActionApproach(option.id as 'ai-first' | 'reuse')}
                    className={clsx(
                      'rounded-2xl border p-4 text-left transition hover:bg-slate-50',
                      selected ? 'border-indigo-300 ring-2 ring-indigo-200' : 'border-slate-300',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-800">{option.label}</div>
                        <p className="mt-1 text-sm text-slate-500">{option.description}</p>
                      </div>
                      <span
                        className={clsx(
                          'grid h-6 w-6 place-items-center rounded-lg border text-xs font-semibold',
                          selected ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-slate-500',
                        )}
                      >
                        {selected ? <Check className="h-4 w-4" /> : '+'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-500">Logic オーナー</label>
              <input
                className="rounded-xl border border-slate-300 px-3 py-2"
                value={logicOwner}
                onChange={event => setLogicOwner(event.target.value)}
                placeholder="例）Operations Team"
              />
              <p className="text-xs text-slate-400">虎の巻（PlaybookVersion）を承認する責任者を定義します。</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">Guardrails</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {GUARDRAIL_OPTIONS.map(option => {
                  const selected = guardrails.includes(option.id)
                  return (
                    <button
                      type="button"
                      key={option.id}
                      onClick={() => toggleGuardrail(option.id)}
                      className={clsx(
                        'rounded-xl border p-3 text-left text-sm transition hover:bg-slate-50',
                        selected ? 'border-indigo-300 ring-2 ring-indigo-200' : 'border-slate-300',
                      )}
                    >
                      <div className="font-semibold text-slate-700">{option.label}</div>
                      <p className="mt-1 text-xs text-slate-500">{option.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {current.key === 'artifact' && (
          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-500">Artifact 名称</label>
              <input
                className="rounded-xl border border-slate-300 px-3 py-2"
                value={artifactName}
                onChange={event => setArtifactName(event.target.value)}
                placeholder="例）週次レポート・アウトライン"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-500">セクション構成</label>
              <textarea
                className="min-h-[160px] rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                value={artifactSections}
                onChange={event => setArtifactSections(event.target.value)}
                placeholder={['1. Executive Summary', '2. KPI Snapshot', '3. Root Cause / 次の一手'].join('\n')}
              />
              <p className="text-xs text-slate-400">アウトプットの「型」を定義しておくと、差分比較と回帰テストが容易になります。</p>
            </div>
          </div>
        )}

        {current.key === 'preview' && (
          <div className="space-y-4">
            <div className="text-sm text-slate-600">Safe Runtime で生成結果を検証します。Shadow → Canary の順に進めると安全です。</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {PREVIEW_MODES.map(mode => {
                const selected = previewMode === mode.id
                return (
                  <button
                    type="button"
                    key={mode.id}
                    onClick={() => {
                      setPreviewMode(mode.id)
                      setPreviewExecuted(false)
                    }}
                    className={clsx(
                      'rounded-2xl border p-4 text-left transition hover:bg-slate-50',
                      selected ? 'border-indigo-300 ring-2 ring-indigo-200' : 'border-slate-300',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-800">{mode.label}</div>
                      <span
                        className={clsx(
                          'grid h-6 w-6 place-items-center rounded-lg border text-xs font-semibold',
                          selected ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-slate-500',
                        )}
                      >
                        {selected ? <Check className="h-4 w-4" /> : '+'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{mode.description}</p>
                  </button>
                )
              })}
            </div>
            <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
              <div className="font-semibold text-slate-700">プレビュー入力（例）</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-500">
                <li>最新の Run.data_snapshot ({snapshotName})</li>
                <li>Golden Ledger コンテキスト {contextSelections.length} 件</li>
                <li>Guardrails: {guardrails.length ? guardrails.join(', ') : '未設定'}</li>
              </ul>
            </div>
            <CTA
              onClick={() => {
                setPreviewExecuted(true)
                alert(`${previewMode === 'shadow' ? 'Shadow' : 'Canary'} 実行を完了しました（デモ）`)
              }}
            >
              {previewMode === 'shadow' ? 'Shadow 実行を記録する' : 'Canary 実行を記録する'}
            </CTA>
            {!previewExecuted && <div className="text-xs text-amber-500">プレビューを実行し記録すると次のステップに進めます。</div>}
          </div>
        )}

        {current.key === 'approval' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-semibold text-slate-700">承認サマリ</div>
              <dl className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <dt className="text-slate-500">Snapshot</dt>
                  <dd>
                    {summary.snapshotName}（{summary.selectedDataSources.length} 件の一次データ）
                  </dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <dt className="text-slate-500">Context</dt>
                  <dd>
                    {summary.contextSelections.length} 件／メモ: {summary.contextNotes}
                  </dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <dt className="text-slate-500">Action / Logic</dt>
                  <dd>
                    {summary.actionApproach === 'ai-first' ? 'AIドラフト起点' : '既存テンプレ流用'}（Owner: {summary.logicOwner}）
                  </dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <dt className="text-slate-500">Artifact</dt>
                  <dd>{summary.artifactName}</dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <dt className="text-slate-500">プレビュー</dt>
                  <dd>{previewMode === 'shadow' ? 'Shadow' : 'Canary'} 実行済み</dd>
                </div>
              </dl>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
              <div>
                <div className="font-semibold text-slate-700">最終承認を記録</div>
                <p className="text-sm text-slate-500">Approvals エンティティに署名し、不変ログを残します。</p>
              </div>
              <button
                type="button"
                onClick={() => setFinalApproval(prev => !prev)}
                className={clsx(
                  'grid h-10 w-10 place-items-center rounded-full border text-sm font-semibold transition',
                  finalApproval ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-slate-500',
                )}
              >
                {finalApproval ? <Check className="h-5 w-5" /> : '+'}
              </button>
            </div>
            {!finalApproval && <div className="text-xs text-amber-500">承認チェックをオンにすると完了できます。</div>}
          </div>
        )}
      </WizardLayout>
    </Shell>
  )
}
