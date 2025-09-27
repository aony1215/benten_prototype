
'use client'
import { useMemo, useState } from 'react'
import { Shell } from '@/components/Shell'
import { WizardLayout } from '@/components/WizardLayout'
import { CTA } from '@/components/ui/CTA'
import { Reorder } from 'framer-motion'
import { Check } from 'lucide-react'

type Method = 'url' | 'manual'
const STEPS = [
  { key: 'method', title: '入力方法の選択', question: 'URLから自動取得 or 手動入力' },
  { key: 'info', title: '顧客の基本情報', question: '会社名・業界・サイトなど' },
  { key: 'strategy', title: '目的の優先順位', question: '重要な順に並べ替えてください' },
  { key: 'playbooks', title: 'プレイブック候補', question: '最初の一手を選びましょう' },
  { key: 'confirm', title: '確認 & 作成', question: '内容を確認して顧客を作成' },
] as const

const GOAL_OPTIONS = [
  { id: 'cv', label: 'コンバージョン増' },
  { id: 'reach', label: 'オンターゲット到達' },
  { id: 'cost', label: 'コスト最適化' },
]

type Candidate = { id: string; title: string; why: string; effect: string; tags?: string[] }

function inferIndustryFromHost(host: string): string | null {
  const retailHints = ['shop', 'store', 'ec', 'cart']
  const saasHints = ['app', 'cloud', 'saas', 'io']
  const lower = host.toLowerCase()
  if (retailHints.some(k => lower.includes(k))) return 'Retail'
  if (saasHints.some(k => lower.includes(k))) return 'SaaS'
  return null
}

export default function NewCustomer() {
  const [stepIdx, setStepIdx] = useState(0)
  const [method, setMethod] = useState<Method>('url')
  const [info, setInfo] = useState({ company: '', website: '', industry: '' })
  const [goalOrder, setGoalOrder] = useState<string[]>(GOAL_OPTIONS.map(o => o.id))
  const [chosenPB, setChosenPB] = useState<string | null>(null)

  const topGoal = goalOrder[0]

  const base: Candidate[] = [
    { id: 'pb_reporting', title: '週次レポート自動化', why: '異常検知→是正案まで自動で提示。意思決定の速度を上げる。', effect: '運用時間 -40% / 可視化の即時性 ↑', tags: ['REPORTING'] },
    { id: 'pb_scorecard', title: 'KPIスコアカード v1', why: '北極星＋3–4KPIに集約し、過度な粒度を避ける。', effect: '意思決定のフォーカス ↑ / 会議効率 ↑', tags: ['PLAN'] },
    { id: 'pb_bidding', title: '入札最適化（Search）', why: 'CV重視に最適。学習リセットを避け、安定と効率の両立。', effect: 'ROAS +10–20% 期待', tags: ['ACQUISITION'] },
    { id: 'pb_ma', title: 'MAオンボード（Nurturing）', why: 'オンボード→教育→比較→背中押しの型を適用。', effect: 'SQL転換率 ↑ / 解約率 ↓', tags: ['NURTURING'] },
  ]

  const candidates = useMemo(() => {
    let ranked = [...base]
    if (topGoal === 'cv') ranked = [base[2], base[0], base[1], base[3]]
    else if (topGoal === 'reach') ranked = [base[1], base[0], base[3], base[2]]
    const host = (() => { try { return new URL(info.website).hostname } catch { return '' } })()
    const inferred = host ? inferIndustryFromHost(host) : null
    const industry = (info.industry || inferred || '').toLowerCase()
    if (method === 'url' && host) ranked = [base[0], ...ranked.filter(c => c.id !== 'pb_reporting')]
    if (industry.includes('saas')) ranked = [base[3], base[1], base[0], base[2]]
    else if (industry.includes('retail') || industry.includes('ec')) ranked = [base[2], base[0], base[1], base[3]]
    return ranked
  }, [topGoal, method, info.website, info.industry])

  const current = STEPS[stepIdx]
  const total = STEPS.length
  const nextDisabled =
    (current.key === 'info' && (!info.company || !info.website)) ||
    (current.key === 'playbooks' && !chosenPB)

  return (
    <Shell crumbs={[{ href: '/customers', label: '顧客一覧' }, { href: '/customers/new', label: '新規登録' }]}>
      <WizardLayout stepIdx={stepIdx} total={total} title={current.title} question={current.question}
        onBack={() => setStepIdx(i => Math.max(0, i-1))}
        onNext={() => setStepIdx(i => Math.min(STEPS.length-1, i+1))}
        nextDisabled={nextDisabled}
      >
        {current.key === 'method' && (
          <div className="grid sm:grid-cols-2 gap-3">
            {(['url','manual'] as Method[]).map(m => {
              const selected = method === m
              return (
                <button key={m} onClick={() => setMethod(m)} className={`p-4 rounded-2xl border text-left hover:bg-slate-50 ${selected ? 'ring-2 ring-indigo-300 border-indigo-300' : 'border-slate-300'}`}>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{m==='url'?'URLから自動取得':'手動で入力'}</div>
                    <div className="inline-flex items-center gap-2 text-sm">
                      <span className={`grid h-5 w-5 place-items-center rounded-md border ${selected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>{selected && <Check className="w-3 h-3 text-white" />}</span>
                      <span className="text-slate-500 text-xs">{selected ? '選択中' : '選択'}</span>
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{m==='url'?'サイトURLから会社名などを下書き':'会社名・業界などを直接入力'}</div>
                </button>
              )
            })}
          </div>
        )}

        {current.key === 'info' && (
          <div className="grid gap-3">
            {method==='url' && (
              <div className="grid gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="text-xs text-slate-500">サイトURL</label>
                <div className="flex gap-2">
                  <input className="flex-1 px-3 py-2 rounded-xl border border-slate-300" placeholder="https://example.com" value={info.website} onChange={e => setInfo({ ...info, website: e.target.value })} />
                  <CTA variant="outline" onClick={() => {
                    try {
                      const u = new URL(info.website)
                      const host = u.hostname.replace(/^www\./,'')
                      const company = host.split('.')[0].replace(/[-_]/g, ' ').replace(/\b\w/g, (s:any)=>s.toUpperCase())
                      const inferred = (inferIndustryFromHost(host) || 'Retail')
                      setInfo(prev => ({ ...prev, company: company || prev.company, industry: prev.industry || inferred }))
                      alert('デモ: URLから会社名/業界を推測して下書きしました')
                    } catch { alert('URLの形式が正しくありません') }
                  }}>メタ情報を取得（デモ）</CTA>
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <label className="text-xs text-slate-500">会社名</label>
              <input className="px-3 py-2 rounded-xl border border-slate-300" value={info.company} onChange={e => setInfo({ ...info, company: e.target.value })} placeholder="例）Global Retail Inc." />
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-slate-500">業界</label>
              <input className="px-3 py-2 rounded-xl border border-slate-300" value={info.industry} onChange={e => setInfo({ ...info, industry: e.target.value })} placeholder="例）Retail / SaaS / Manufacturing" />
            </div>
          </div>
        )}

        {current.key === 'strategy' && (
          <div>
            <Reorder.Group axis="y" values={goalOrder} onReorder={(v) => setGoalOrder(v as string[])}>
              {goalOrder.map((id, i) => {
                const opt = GOAL_OPTIONS.find(o => o.id === id)!
                return (
                  <Reorder.Item value={id} id={id} key={id}>
                    <div className="flex items-center justify-between px-4 py-3 rounded-2xl border mb-2 bg-white cursor-grab active:cursor-grabbing select-none border-slate-300">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 grid place-items-center rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">{i + 1}</div>
                        <div className="font-medium text-slate-800">{opt.label}</div>
                      </div>
                    </div>
                  </Reorder.Item>
                )
              })}
            </Reorder.Group>
            <div className="mt-2 text-[11px] text-slate-400">ドラッグで並べ替え</div>
          </div>
        )}

        {current.key === 'playbooks' && (
          <div className="grid gap-3">
            {candidates.map(c => {
              const selected = chosenPB === c.id
              return (
                <div key={c.id} onClick={() => setChosenPB(c.id)} role="radio" aria-checked={selected} className={`p-4 rounded-2xl border cursor-pointer select-none ${selected ? 'ring-2 ring-indigo-300 border-indigo-300' : 'border-slate-300'}`}>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{c.title}</div>
                    <div className="inline-flex items-center gap-2 text-sm">
                      <span className={`grid h-5 w-5 place-items-center rounded-md border ${selected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>{selected && <Check className="w-3 h-3 text-white" />}</span>
                      <span className="text-slate-500 text-xs">{selected ? '選択中' : '選択'}</span>
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-slate-600">{c.why}</div>
                  <div className="mt-1 text-xs text-slate-500">期待効果: {c.effect}</div>
                  <div className="mt-2 text-[11px] text-slate-500">タグ: {(c.tags||[]).join(' / ')}</div>
                </div>
              )
            })}
          </div>
        )}

        {current.key === 'confirm' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="font-semibold">顧客を作成</div>
              <div className="text-sm text-slate-600">会社名：{info.company}／サイト：{info.website}／業界：{info.industry || '未設定'}</div>
              <div className="mt-1 text-sm text-slate-600">北極星：{goalOrder[0]} → 並び順：{goalOrder.join(' > ')}</div>
              <div className="mt-1 text-sm text-slate-600">初手：{chosenPB || '未選択'}</div>
            </div>
            <div className="flex items-center gap-2">
              <CTA variant="outline">ドラフト作成</CTA>
              <CTA onClick={() => alert('顧客を作成しました（デモ）')}>作成する</CTA>
            </div>
          </div>
        )}
      </WizardLayout>
    </Shell>
  )
}
