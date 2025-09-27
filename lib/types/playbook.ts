export type ArtifactRef = {
  id: string
  type: string
  uri: string
  hash?: string
  size?: number
}

export type ValueInsight = {
  priorities: Array<'cost' | 'quality' | 'experience'>
  must_haves: string[]
  ten_year_quote: string
  summary: string
  investment_candidates: string[]
  efficiency_candidates: string[]
}

export type AllocationPlan = {
  investmentPercentage: number
  efficiencyPercentage: number
  investmentFocus: string
  efficiencyFocus: string
}

export type DataSnapshot = {
  generatedAt: string
  inputsHash: string
  sourceSummary: string
  investmentCandidates: string[]
  efficiencyCandidates: string[]
  files: ArtifactRef[]
}

export type PlaybookDraft = {
  id: string
  name: string
  theme: string
  logic: string
  action_template: string
  guardrails: string
  evidence: ArtifactRef[]
  createdBy: string
  updatedAt: string
  version: '0.0.1-draft'
  data_snapshot: DataSnapshot
}
