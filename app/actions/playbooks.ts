'use server'

import { createHash, randomUUID } from 'node:crypto'
import { AllocationPlan, ArtifactRef, PlaybookDraft, ValueInsight } from '@/lib/types/playbook'

export type SummarizeValueInsightInput = {
  answers: {
    mustHave: string
    tenYear: string
    priorities: Array<'cost' | 'quality' | 'experience'>
    notes: string
  }
  filesMeta: ArtifactRef[]
}

export async function summarizeValueInsight(input: SummarizeValueInsightInput): Promise<ValueInsight> {
  const { answers, filesMeta } = input
  const mustHaves = answers.mustHave
    .split(/[\n,、]/)
    .map(item => item.trim())
    .filter(Boolean)

  const baseCandidates = new Set<string>()
  mustHaves.forEach(item => {
    if (item.includes('写真') || item.includes('映像')) baseCandidates.add('写真・アルバム制作')
    if (item.includes('演出') || item.includes('サプライズ')) baseCandidates.add('体験演出強化')
    if (item.includes('音')) baseCandidates.add('MC/音響のプロフェッショナル')
  })

  if (answers.notes.toLowerCase().includes('premium')) {
    baseCandidates.add('VIP向け体験ラインの追加')
  }
  if (answers.notes.includes('家族') || answers.tenYear.includes('家族')) {
    baseCandidates.add('家族参加型のセレモニー演出')
  }

  const fileHints = filesMeta.map(file => file.type.toLowerCase())
  if (fileHints.some(type => type.includes('pdf'))) {
    baseCandidates.add('既存提案書のベストプラクティス適用')
  }
  if (!baseCandidates.size) {
    baseCandidates.add('写真/アルバムへの集中投資')
  }

  const efficiencyCandidates = new Set<string>()
  if (answers.notes.includes('コスト') || answers.priorities.includes('cost')) {
    efficiencyCandidates.add('標準備品の最大活用')
  }
  if (answers.priorities.includes('experience')) {
    efficiencyCandidates.add('運営・備品は既定パッケージで効率化')
  }
  if (answers.notes.includes('品質')) {
    efficiencyCandidates.add('検証済みオペレーションテンプレートを採用')
  }
  if (!efficiencyCandidates.size) {
    efficiencyCandidates.add('汎用運営フローの再利用')
  }

  const summaryLines: string[] = []
  summaryLines.push(`優先順位: ${answers.priorities.length ? answers.priorities.join(' > ') : '未指定'}`)
  if (mustHaves.length) {
    summaryLines.push(`Must Have: ${mustHaves.join(' / ')}`)
  }
  if (answers.tenYear) {
    summaryLines.push(`10年後の引用: "${answers.tenYear}"`)
  }
  if (answers.notes) {
    summaryLines.push(`メモ: ${answers.notes}`)
  }
  if (filesMeta.length) {
    summaryLines.push(`参照ファイル: ${filesMeta.map(file => file.id).join(', ')}`)
  }

  return {
    priorities: answers.priorities,
    must_haves: mustHaves,
    ten_year_quote: answers.tenYear,
    summary: summaryLines.join('\n'),
    investment_candidates: Array.from(baseCandidates),
    efficiency_candidates: Array.from(efficiencyCandidates),
  }
}

export type ComposeDraftInput = {
  theme: string
  valueInsight: ValueInsight
  allocation: AllocationPlan
  filesMeta: ArtifactRef[]
  author?: string
}

export async function composeDraft(input: ComposeDraftInput): Promise<PlaybookDraft> {
  const { theme, valueInsight, allocation, filesMeta, author } = input
  const now = new Date().toISOString()
  const name = `${theme} / 初回提案ドラフト`
  const investmentFocusText = valueInsight.investment_candidates.length
    ? valueInsight.investment_candidates.join(' / ')
    : '写真/アルバム/体験演出'
  const efficiencyFocusText = valueInsight.efficiency_candidates.length
    ? valueInsight.efficiency_candidates.join(' / ')
    : '標準備品/汎用運営'
  const mustHaveText = valueInsight.must_haves.length
    ? valueInsight.must_haves.join('、')
    : '顧客ヒアリング結果'
  const priorityText = valueInsight.priorities.length
    ? valueInsight.priorities.join(' > ')
    : '未設定'

  const logic = `価値観ファースト: ${mustHaveText} を中心に設計し、予算ではなく価値の優先度を起点に意思決定する。\n体験価値へ集中投資: ${investmentFocusText} に対して ${allocation.investmentPercentage}% の配分を確保し、記憶に残る瞬間を強化する。\nメリハリ設計: 投資項目と効率化項目を明確に分け、${allocation.efficiencyPercentage}% は ${efficiencyFocusText} で効率化する。\nデータドリブン継続学習: 参照証跡とフィードバックを蓄積し、次版の提案精度を高める。`

  const action_template = `フェーズ1：ヒアリング\n- OK質問を起点に価値観とMust Haveを引き出す。\n- 回答から「${
    valueInsight.must_haves.join(' / ') || '重視事項'
  }」を確認し、優先度 ${priorityText} を記録。\n\nフェーズ2：見積もり設計\n- 投資項目として ${investmentFocusText} を厚めに計上し、配分 ${allocation.investmentPercentage}% を維持。\n- その他はパッケージ化された運営テンプレートで効率化（${allocation.efficiencyPercentage}%）。\n\nフェーズ3：提案（提示ストーリー）\n- 「${theme}」の背景と10年後の引用 "${
    valueInsight.ten_year_quote || '未設定'
  }" を冒頭で共有。\n- 「本見積では${investmentFocusText}に重点投資。一方、標準化パッケージで${
    efficiencyFocusText
  }を最適化」という物語で説明。\n- 配分根拠: 投資=${allocation.investmentPercentage}%（${
    allocation.investmentFocus || '重点理由を記載'
  }） / 効率化=${allocation.efficiencyPercentage}%（${allocation.efficiencyFocus || '効率化根拠を記載'}）。`

  const guardrails = `承認必須: 投資配分が合計の ${allocation.investmentPercentage}% を超える場合は Approver ゲートを通過する。\n停止規則: フェーズ3要約に「不安」「懸念」が一定数検出された場合は shadow モードで提案を止める。\nロールバック: ドラフト確定前は配分スライダーを初期値に戻し、再合成してから提出する。`

  const hash = createHash('sha256')
    .update(JSON.stringify({ theme, valueInsight, allocation, filesMeta }))
    .digest('hex')

  const data_snapshot = {
    generatedAt: now,
    inputsHash: hash,
    sourceSummary: valueInsight.summary,
    investmentCandidates: valueInsight.investment_candidates,
    efficiencyCandidates: valueInsight.efficiency_candidates,
    files: filesMeta,
  }

  const draft: PlaybookDraft = {
    id: randomUUID(),
    name,
    theme,
    logic,
    action_template,
    guardrails,
    evidence: filesMeta,
    createdBy: author ?? 'benten-system',
    updatedAt: now,
    version: '0.0.1-draft',
    data_snapshot,
  }

  return draft
}
