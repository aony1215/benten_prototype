'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { Shell, createHrefWithView } from '@/components/Shell'
import { useCurrentView } from '@/components/ViewSwitch'
import { WizardLayout } from '@/components/WizardLayout'
import { CTA } from '@/components/ui/CTA'
import { composeDraft, summarizeValueInsight } from '@/app/actions/playbooks'
import {
  AllocationPlan,
  ArtifactRef,
  PlaybookDraft,
  ValueInsight,
} from '@/lib/types/playbook'
import { PlaybookDraftPreview } from '@/components/PlaybookDraftPreview'

const STORAGE_KEY = 'benten.playbook.newCustomerDraft'
const THEME_OPTION = '新規顧客への初回提案'

const STEPS = [
  { key: 'theme', title: 'テーマ選択', question: '提案するテーマを選びましょう' },
  { key: 'evidence', title: '正解データの投入', question: '参考となる資料をドラッグ＆ドロップ' },
  { key: 'valueInsight', title: '価値観ヒアリング（LLM支援）', question: 'OK質問とメモを入力し要約を生成' },
  { key: 'allocation', title: '見積り配分設計', question: '投資と効率化の配分を調整' },
  { key: 'preview', title: '下書き生成', question: '合成されたドラフトを確認して保存' },
] as const

const PRIORITY_LABELS: Record<'cost' | 'quality' | 'experience', string> = {
  cost: 'コスト',
  quality: '品質',
  experience: '体験',
}

type StoredState = {
  theme: string
  files: ArtifactRef[]
  answers: {
    mustHave: string
    tenYear: string
    priorities: Array<'cost' | 'quality' | 'experience'>
    notes: string
  }
  valueInsight: ValueInsight | null
  allocation: AllocationPlan
  draft: PlaybookDraft | null
  stepIdx: number
}

function createArtifactRef(file: File): ArtifactRef {
  const id = `${file.name}`
  return {
    id,
    type: file.type || `application/${file.name.split('.').pop() || 'octet-stream'}`,
    uri: `artifact://local/${crypto.randomUUID()}`,
    size: file.size,
  }
}

export default function NewPlaybook() {
  const sp = useSearchParams()
  const currentView = useCurrentView()
  const crumbs = useMemo(
    () => [
      { href: createHrefWithView('/playbooks', sp, 'playbook', {}, { preserve: ['section', 'focus'] }), label: 'プレイブック一覧' },
      {
        href: createHrefWithView('/playbooks/new', sp, currentView, {}, { preserve: ['section', 'focus'] }),
        label: '新規ドラフト',
      },
    ],
    [sp, currentView],
  )

  const [stepIdx, setStepIdx] = useState(0)
  const [theme, setTheme] = useState(THEME_OPTION)
  const [files, setFiles] = useState<ArtifactRef[]>([])
  const [answers, setAnswers] = useState<StoredState['answers']>({
    mustHave: '',
    tenYear: '',
    priorities: ['experience'],
    notes: '',
  })
  const [valueInsight, setValueInsight] = useState<ValueInsight | null>(null)
  const [allocation, setAllocation] = useState<AllocationPlan>({
    investmentPercentage: 60,
    efficiencyPercentage: 40,
    investmentFocus: '',
    efficiencyFocus: '',
  })
  const [draft, setDraft] = useState<PlaybookDraft | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [isSummarizing, startSummarize] = useTransition()
  const [isComposing, startCompose] = useTransition()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as StoredState
      if (parsed.theme) setTheme(parsed.theme)
      if (parsed.files) setFiles(parsed.files)
      if (parsed.answers) setAnswers(parsed.answers)
      if (parsed.valueInsight) setValueInsight(parsed.valueInsight)
      if (parsed.allocation) setAllocation(parsed.allocation)
      if (parsed.draft) setDraft(parsed.draft)
      if (typeof parsed.stepIdx === 'number') {
        setStepIdx(Math.min(STEPS.length - 1, Math.max(0, parsed.stepIdx)))
      }
    } catch (error) {
      console.warn('Failed to parse stored playbook draft', error)
    }
  }, [])

  const current = STEPS[stepIdx]
  const total = STEPS.length

  const handleFiles = (list: FileList | null) => {
    if (!list) return
    const additions: ArtifactRef[] = []
    Array.from(list).forEach(file => {
      const ref = createArtifactRef(file)
      additions.push(ref)
    })
    if (additions.length) {
      setFiles(prev => {
        const ids = new Set(prev.map(item => item.id))
        const merged = [...prev]
        additions.forEach(item => {
          if (!ids.has(item.id)) {
            merged.push(item)
          }
        })
        return merged
      })
      setSaveMessage(null)
    }
  }

  const handleSummarize = () => {
    startSummarize(() => {
      summarizeValueInsight({ answers, filesMeta: files })
        .then(result => {
          setValueInsight(result)
          setSaveMessage(null)
        })
        .catch(() => alert('要約の生成に失敗しました'))
    })
  }

  const handleCompose = () => {
    if (!valueInsight) {
      alert('先に価値観ヒアリングの要約を生成してください')
      return
    }
    startCompose(() => {
      composeDraft({ theme, valueInsight, allocation, filesMeta: files, author: 'you' })
        .then(result => {
          setDraft(result)
          setStepIdx(idx => Math.min(STEPS.length - 1, idx + 1))
          setSaveMessage(null)
        })
        .catch(() => alert('ドラフトの合成に失敗しました'))
    })
  }

  const handleNext = () => {
    if (current.key === 'allocation') {
      handleCompose()
    } else if (current.key === 'preview') {
      return
    } else {
      setStepIdx(idx => Math.min(STEPS.length - 1, idx + 1))
    }
  }

  const handleBack = () => {
    setStepIdx(idx => Math.max(0, idx - 1))
  }

  const handleSaveDraft = () => {
    if (!draft) {
      alert('下書きがまだ生成されていません')
      return
    }
    const updated: PlaybookDraft = { ...draft, updatedAt: new Date().toISOString() }
    setDraft(updated)
    if (typeof window !== 'undefined') {
      const payload: StoredState = {
        theme,
        files,
        answers,
        valueInsight,
        allocation,
        draft: updated,
        stepIdx,
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      setSaveMessage('下書きを保存しました（ローカル）')
    }
  }

  const nextDisabled =
    current.key === 'theme'
      ? !theme
      : current.key === 'valueInsight'
      ? !valueInsight || isSummarizing
      : current.key === 'allocation'
      ? isComposing || !valueInsight
      : current.key === 'preview'
      ? true
      : false

  return (
    <Shell crumbs={crumbs}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <WizardLayout
          stepIdx={stepIdx}
          total={total}
          title={current.title}
          question={current.question}
          onBack={handleBack}
          onNext={handleNext}
          nextDisabled={nextDisabled}
        >
          {current.key === 'theme' && (
            <div className="grid gap-4">
              <div className="text-sm text-slate-600">
                Logic（虎の巻）の初版テーマとして「新規顧客への初回提案」を適用します。
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  className={`rounded-2xl border p-4 text-left shadow-sm transition ${
                    theme === THEME_OPTION
                      ? 'border-indigo-300 ring-2 ring-indigo-200'
                      : 'border-slate-300 hover:border-indigo-200 hover:ring-1 hover:ring-indigo-100'
                  }`}
                  onClick={() => setTheme(THEME_OPTION)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-800">{THEME_OPTION}</div>
                    <span className="text-xs text-indigo-600">固定</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    新規顧客が最初に体験するプレイブック提案。価値観の把握と体験設計を重視します。
                  </p>
                </button>
              </div>
            </div>
          )}

          {current.key === 'evidence' && (
            <div className="space-y-4">
              <div
                className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500"
                onDragOver={event => {
                  event.preventDefault()
                  event.dataTransfer.dropEffect = 'copy'
                }}
                onDrop={event => {
                  event.preventDefault()
                  handleFiles(event.dataTransfer.files)
                }}
              >
                <p className="font-medium text-slate-700">提案書PDF / 議事録 / 運用マニュアルを追加</p>
                <p className="mt-2 text-xs text-slate-500">ドラッグ＆ドロップまたは下のボタンから選択できます</p>
                <CTA
                  variant="outline"
                  className="mt-4"
                  onClick={() => document.getElementById('playbook-file-input')?.click()}
                >
                  ファイルを選択
                </CTA>
                <input
                  id="playbook-file-input"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={event => handleFiles(event.target.files)}
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-700">追加済みの証跡</h3>
                {files.length ? (
                  <ul className="space-y-2">
                    {files.map(file => (
                      <li
                        key={file.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-800">{file.id}</div>
                          <div className="text-xs text-slate-500">{file.type}</div>
                        </div>
                        <button
                          className="text-xs text-rose-500 hover:underline"
                          onClick={() => setFiles(prev => prev.filter(item => item.id !== file.id))}
                        >
                          削除
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">まだファイルは追加されていません。</p>
                )}
              </div>
            </div>
          )}

          {current.key === 'valueInsight' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">
                    「この一日で“絶対にこだわりたい”ものは何ですか？」
                  </label>
                  <textarea
                    className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                    rows={3}
                    value={answers.mustHave}
                    onChange={event => setAnswers(prev => ({ ...prev, mustHave: event.target.value }))}
                    placeholder="例：家族との写真、サプライズ演出、音響品質"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">
                    「10年後に“やって良かった”と感じることは？」
                  </label>
                  <textarea
                    className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                    rows={3}
                    value={answers.tenYear}
                    onChange={event => setAnswers(prev => ({ ...prev, tenYear: event.target.value }))}
                    placeholder="例：当日の映像を家族で見返して笑い合っている"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500">「コスト・品質・体験の優先順位を教えてください。」</div>
                  <div className="flex flex-wrap gap-3">
                    {(Object.keys(PRIORITY_LABELS) as Array<'cost' | 'quality' | 'experience'>).map(key => {
                      const selected = answers.priorities.includes(key)
                      return (
                        <button
                          type="button"
                          key={key}
                          onClick={() => {
                            setAnswers(prev => {
                              const already = prev.priorities.includes(key)
                              return {
                                ...prev,
                                priorities: already
                                  ? prev.priorities.filter(item => item !== key)
                                  : [...prev.priorities, key],
                              }
                            })
                          }}
                          className={`rounded-2xl border px-4 py-2 text-sm transition ${
                            selected
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                              : 'border-slate-300 text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
                          }`}
                        >
                          {PRIORITY_LABELS[key]}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[11px] text-slate-400">複数選択可。体験重視の場合は「体験」を選択してください。</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">補足メモ / 自由記述</label>
                  <textarea
                    className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                    rows={3}
                    value={answers.notes}
                    onChange={event => setAnswers(prev => ({ ...prev, notes: event.target.value }))}
                    placeholder="例：Premiumプランを提案予定。家族参加型にしたいとの要望あり。"
                  />
                </div>
                <CTA onClick={handleSummarize} disabled={isSummarizing}>
                  {isSummarizing ? '要約を生成中…' : '要約を生成'}
                </CTA>
              </div>

              {valueInsight && (
                <div className="space-y-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4">
                  <div className="text-sm font-semibold text-indigo-700">要約結果</div>
                  <pre className="whitespace-pre-wrap text-xs text-indigo-800">{valueInsight.summary}</pre>
                  <div className="text-xs text-indigo-700">
                    投資候補: {valueInsight.investment_candidates.join(' / ') || '未検出'}
                  </div>
                  <div className="text-xs text-indigo-700">
                    効率化候補: {valueInsight.efficiency_candidates.join(' / ') || '未検出'}
                  </div>
                </div>
              )}
            </div>
          )}

          {current.key === 'allocation' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">投資項目の配分（%）</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={allocation.investmentPercentage}
                  onChange={event => {
                    const investment = Number(event.target.value)
                    setAllocation(prev => ({
                      ...prev,
                      investmentPercentage: investment,
                      efficiencyPercentage: 100 - investment,
                    }))
                  }}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>投資項目：写真/アルバム/体験演出/MC/音響 等</span>
                  <span>{allocation.investmentPercentage}%</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>効率化項目：標準備品/汎用運営/定型設営/既定パッケージ</span>
                  <span>{allocation.efficiencyPercentage}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">投資配分の根拠</label>
                <textarea
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                  rows={3}
                  value={allocation.investmentFocus}
                  onChange={event =>
                    setAllocation(prev => ({ ...prev, investmentFocus: event.target.value }))
                  }
                  placeholder="例：Must Haveとして写真と演出のこだわりが明確なため"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">効率化配分の根拠</label>
                <textarea
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                  rows={3}
                  value={allocation.efficiencyFocus}
                  onChange={event =>
                    setAllocation(prev => ({ ...prev, efficiencyFocus: event.target.value }))
                  }
                  placeholder="例：運営は既定パッケージで十分、品質要件も満たせる"
                />
              </div>
              <CTA onClick={handleCompose} disabled={isComposing || !valueInsight}>
                {isComposing ? 'ドラフト合成中…' : 'ドラフトを合成'}
              </CTA>
            </div>
          )}

          {current.key === 'preview' && (
            <div className="space-y-4">
              {draft ? (
                <PlaybookDraftPreview draft={draft} />
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                  まだドラフトが生成されていません。前のステップで「ドラフトを合成」を実行してください。
                </div>
              )}
              <div className="flex items-center gap-3">
                <CTA onClick={handleSaveDraft} disabled={!draft}>
                  下書きを保存
                </CTA>
                <CTA
                  variant="ghost"
                  onClick={() => {
                    setStepIdx(0)
                  }}
                >
                  最初から見直す
                </CTA>
              </div>
              {saveMessage && <div className="text-xs text-emerald-600">{saveMessage}</div>}
            </div>
          )}
        </WizardLayout>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Context</div>
            <div className="mt-2 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>ビュー</span>
                <span className="font-semibold text-slate-800">{currentView}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>テーマ</span>
                <span className="font-semibold text-slate-800">{theme}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ステップ</span>
                <span className="font-semibold text-slate-800">{stepIdx + 1} / {total}</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Snapshot</div>
            <div className="mt-2 space-y-2 text-xs text-slate-600">
              <div>投資候補: {valueInsight?.investment_candidates.join(' / ') || '未生成'}</div>
              <div>効率化候補: {valueInsight?.efficiency_candidates.join(' / ') || '未生成'}</div>
              <div>証跡: {files.length} 件</div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">操作</div>
            <div className="mt-2 space-y-2 text-sm text-slate-600">
              <button
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-left text-xs hover:border-indigo-200"
                onClick={() => {
                  setStepIdx(0)
                }}
              >
                セクション最初に戻る
              </button>
              <button
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-left text-xs hover:border-indigo-200"
                onClick={() => {
                  setFiles([])
                  setValueInsight(null)
                  setDraft(null)
                  setAllocation({
                    investmentPercentage: 60,
                    efficiencyPercentage: 40,
                    investmentFocus: '',
                    efficiencyFocus: '',
                  })
                }}
              >
                入力を初期化
              </button>
            </div>
          </div>
        </aside>
      </div>
    </Shell>
  )
}
