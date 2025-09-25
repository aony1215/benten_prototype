export type CustomerRecord = {
  name: string
  kpi: { cpa?: number; roas?: number; progress?: number }
  contract: { budget?: number; consumed?: number }
  issues: string[]
  projects: { id: string; name: string }[]
}

export const CUSTOMER_DATA: Record<string, CustomerRecord> = {
  acc_globalretail: {
    name: 'A社（Global Retail Inc.）',
    kpi: { cpa: 1200, roas: 2.1, progress: 0.76 },
    contract: { budget: 2_000_000, consumed: 1_260_000 },
    issues: ['計測欠損の可能性（LP遷移率急落）', '在庫データの遅延', '検索キャンペーンで学習リセット頻発'],
    projects: [
      { id: 'prj_x', name: 'プロジェクトX' },
      { id: 'prj_q4', name: 'Q4 週次レポート自動化' },
    ],
  },
  acc_techstarter: {
    name: 'B社（Tech Starter）',
    kpi: { cpa: 8400, roas: 1.6, progress: 0.42 },
    contract: { budget: 1_500_000, consumed: 380_000 },
    issues: ['CV計測差分（MAとGAのズレ）'],
    projects: [
      { id: 'prj_y', name: 'ブランド新規獲得強化' },
      { id: 'prj_launch', name: '新商品ローンチ支援' },
    ],
  },
}

export function formatJPY(n: number) {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(n)
}
