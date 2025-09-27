export type ReportPurpose = 'QBR' | 'Proposal' | 'Incident';

export type FieldType = 'dimension' | 'measure';

export type Agg = 'sum' | 'avg' | 'count' | 'min' | 'max';

export interface Dimension {
  name: string;
  expr?: string;
}

export interface Measure {
  name: string;
  agg: Agg;
  expr?: string;
  format?: 'int' | 'pct' | 'currency';
}

export interface DnDModel {
  dims: Dimension[];
  measures: Measure[];
  filters: Record<string, unknown>;
  sort?: { by: string; dir: 'asc' | 'desc' }[];
  limit?: number;
}

export interface KpiDef {
  id: string;
  title: string;
  measure: Measure;
  dimensions: Dimension[];
}

export interface TipRule {
  id: string;
  when: {
    purpose?: ReportPurpose;
    kpi?: string;
    dimsContains?: string[];
  };
  suggest: {
    action: string;
    payload?: Record<string, unknown>;
    label: string;
  };
}

export interface RunMeta {
  id: string;
  createdAt: number;
  purpose: ReportPurpose;
  model: DnDModel;
}

export interface QueryResult {
  columns: string[];
  rows: Array<Record<string, unknown>>;
}

export interface DatasetInfo {
  id: string;
  name: string;
  rows: Array<Record<string, unknown>>;
  columns: Array<{ name: string; type: FieldType }>;
}

export interface TipMatch extends TipRule {
  applied?: boolean;
}

export interface RunContext {
  dataset?: DatasetInfo;
  purpose: ReportPurpose;
  model: DnDModel;
  kpiIds: string[];
}

export type ReportStepId = 'ingest' | 'fields' | 'visualize' | 'tips' | 'output';
