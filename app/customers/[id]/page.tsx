import { CustomerDetailClient } from '@/components/customers/CustomerDetailClient';
import { loadKpis } from '@/lib/duck/kpi';
import { loadTipRules } from '@/lib/tips/loader';
import type { KpiDef, TipRule } from '@/types/report';

type ProjectSummary = {
  id: string;
  name: string;
};

type CustomerRecord = {
  name: string;
  kpi: { cpa?: number; roas?: number; progress?: number };
  contract: { budget?: number; consumed?: number };
  issues: string[];
  projects: ProjectSummary[];
};

// Demo data
const DATA: Record<string, CustomerRecord> = {
  acc_globalretail: {
    name: 'A社（Global Retail Inc.）',
    kpi: { cpa: 1200, roas: 2.1, progress: 0.76 },
    contract: { budget: 2000000, consumed: 1260000 },
    issues: ['計測欠損の可能性（LP遷移率急落）', '在庫データの遅延', '検索キャンペーンで学習リセット頻発'],
    projects: [{ id:'prj_x', name:'プロジェクトX' }, { id:'prj_q4', name:'Q4 週次レポート自動化' }]
  },
  acc_techstarter: {
    name: 'B社（Tech Starter）',
    kpi: { cpa: 8400, roas: 1.6, progress: 0.42 },
    contract: { budget: 1500000, consumed: 380000 },
    issues: ['CV計測差分（MAとGAのズレ）'],
    projects: [
      { id: 'prj_y', name: 'ブランド新規獲得強化' },
      { id: 'prj_launch', name: '新商品ローンチ支援' },
    ],
  }
};

const emptyRecord: CustomerRecord = {
  name: '不明な顧客',
  kpi: {},
  contract: {},
  issues: [],
  projects: [],
};

const loadCustomer = (id: string): CustomerRecord => {
  return DATA[id] ?? emptyRecord;
};

const loadConfigs = (): { kpis: KpiDef[]; tipRules: TipRule[] } => ({
  kpis: loadKpis(),
  tipRules: loadTipRules(),
});

export default function CustomerDetail({ params }: { params: { id: string } }) {
  const customer = loadCustomer(params.id);
  const crumbs = [
    { href: '/customers', label: '顧客一覧' },
    { href: `/customers/${params.id}`, label: customer.name },
  ];
  const { kpis, tipRules } = loadConfigs();

  return <CustomerDetailClient crumbs={crumbs} customer={customer} kpis={kpis} tipRules={tipRules} />;
}
