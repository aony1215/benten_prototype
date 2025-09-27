'use client';

import { buildQuery } from '@/lib/sqlgen/buildQuery';
import { matchTips } from '@/lib/tips/matcher';
import {
  DatasetInfo,
  DnDModel,
  QueryResult,
  ReportPurpose,
  RunMeta,
  RunContext,
  TipMatch,
  KpiDef,
  TipRule,
} from '@/types/report';

const SNAPSHOT_KEY = 'benten.report.snapshot';

const compiledExpressionCache = new Map<string, (row: Record<string, unknown>) => number>();

const compileExpression = (expr: string, columns: string[]): ((row: Record<string, unknown>) => number) => {
  if (compiledExpressionCache.has(expr)) {
    return compiledExpressionCache.get(expr)!;
  }
  const fn = new Function(
    'row',
    `try { with (row) { return Number(${expr}); } } catch (err) { return 0; }`
  ) as (row: Record<string, unknown>) => number;
  compiledExpressionCache.set(expr, fn);
  return fn;
};

const parseCsv = (raw: string): DatasetInfo => {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('#'));
  const header = lines.shift();
  if (!header) {
    throw new Error('Dataset missing header row');
  }
  const columns = header.split(',');
  const rows = lines.map((line) => {
    const parts = line.split(',');
    const row: Record<string, unknown> = {};
    columns.forEach((col, index) => {
      const trimmed = parts[index]?.trim() ?? '';
      const numeric = Number(trimmed);
      row[col.trim()] = Number.isNaN(numeric) || trimmed === '' ? trimmed : numeric;
    });
    return row;
  });

  return {
    id: 'local-dataset',
    name: 'Local Import',
    rows,
    columns: columns.map((col) => ({
      name: col.trim(),
      type: rows.every((row) => typeof row[col.trim()] === 'number') ? 'measure' : 'dimension',
    })),
  };
};

const passesFilter = (row: Record<string, unknown>, filters: Record<string, unknown>): boolean => {
  return Object.entries(filters || {}).every(([field, value]) => {
    const current = row[field];
    if (value === undefined || value === null) return true;
    if (Array.isArray(value)) {
      if (value.length === 0) return true;
      return value.includes(current as never);
    }
    if (typeof value === 'object') {
      const min = (value as Record<string, unknown>).min as number | undefined;
      const max = (value as Record<string, unknown>).max as number | undefined;
      if (typeof current !== 'number') return false;
      if (min !== undefined && current < min) return false;
      if (max !== undefined && current > max) return false;
      return true;
    }
    return current === value;
  });
};

interface MeasureState {
  sum: number;
  count: number;
  min: number;
  max: number;
}

const initMeasureState = (): MeasureState => ({ sum: 0, count: 0, min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY });

const aggregate = (dataset: DatasetInfo, model: DnDModel): QueryResult => {
  const projection = buildQuery(model, dataset.name ?? 'dataset');
  const rows = dataset.rows ?? [];
  const columns = dataset.columns.map((col) => col.name);
  const groups = new Map<string, { dims: Record<string, unknown>; measures: Record<string, MeasureState> }>();

  const ensureMeasure = (bucket: Record<string, MeasureState>, key: string) => {
    if (!bucket[key]) {
      bucket[key] = initMeasureState();
    }
    return bucket[key];
  };

  rows.forEach((row) => {
    if (!passesFilter(row, model.filters || {})) return;
    const dims: Record<string, unknown> = {};
    const dimValues = projection.projection
      .filter((p) => p.type === 'dimension')
      .map((dim) => {
        const source = dim.source;
        const value = row[source] ?? row[dim.alias] ?? null;
        dims[dim.alias] = value;
        return value ?? '';
      });
    const key = dimValues.join('|');
    if (!groups.has(key)) {
      groups.set(key, { dims, measures: {} });
    }
    const entry = groups.get(key)!;

    projection.projection
      .filter((p) => p.type === 'measure')
      .forEach((measure) => {
        let value: number = 0;
        if (measure.source.startsWith('COUNT(')) {
          value = 1;
        } else if (measure.source.includes('(') || measure.source.includes('/') || measure.source.includes('*')) {
          const expr = model.measures.find((m) => m.name === measure.alias)?.expr ?? measure.alias;
          const fn = compileExpression(expr, columns);
          value = fn(row);
        } else {
          const colName = measure.source.replace(/SUM\(|AVG\(|MIN\(|MAX\(|COUNT\(|\)/g, '').trim();
          const raw = row[colName];
          value = typeof raw === 'number' ? raw : Number(raw ?? 0);
        }
        const state = ensureMeasure(entry.measures, measure.alias);
        state.sum += value;
        state.count += 1;
        state.min = Math.min(state.min, value);
        state.max = Math.max(state.max, value);
      });
  });

  const resultRows = Array.from(groups.values()).map((group) => {
    const out: Record<string, unknown> = { ...group.dims };
    projection.projection
      .filter((p) => p.type === 'measure')
      .forEach((measure) => {
        const state = group.measures[measure.alias] ?? initMeasureState();
        let value = 0;
        switch (measure.agg) {
          case 'avg':
            value = state.count === 0 ? 0 : state.sum / state.count;
            break;
          case 'min':
            value = state.min === Number.POSITIVE_INFINITY ? 0 : state.min;
            break;
          case 'max':
            value = state.max === Number.NEGATIVE_INFINITY ? 0 : state.max;
            break;
          case 'count':
            value = state.count;
            break;
          case 'sum':
          default:
            value = state.sum;
            break;
        }
        out[measure.alias] = Number.isFinite(value) ? Number(value.toFixed(4)) : 0;
      });
    return out;
  });

  const sorted = (() => {
    if (!model.sort || model.sort.length === 0) return resultRows;
    const copy = [...resultRows];
    copy.sort((a, b) => {
      for (const order of model.sort!) {
        const av = a[order.by];
        const bv = b[order.by];
        if (av === bv) continue;
        if (typeof av === 'number' && typeof bv === 'number') {
          return order.dir === 'asc' ? av - bv : bv - av;
        }
        const cmp = String(av).localeCompare(String(bv));
        if (cmp !== 0) {
          return order.dir === 'asc' ? cmp : -cmp;
        }
      }
      return 0;
    });
    return copy;
  })();

  const limited = model.limit ? sorted.slice(0, model.limit) : sorted;
  const columnsOut = projection.projection.map((p) => p.alias);

  return { columns: columnsOut, rows: limited };
};

const storeSnapshot = (snapshot: unknown) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.warn('Unable to persist snapshot', err);
  }
};

const readSnapshot = (): unknown | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Unable to read snapshot', err);
    return null;
  }
};

export interface SnapshotPayload {
  dataset?: DatasetInfo;
  runMeta?: RunMeta;
  result?: QueryResult;
  previousResult?: QueryResult;
}

export class DuckClient {
  private dataset?: DatasetInfo;
  private runMeta?: RunMeta;
  private result?: QueryResult;
  private previousResult?: QueryResult;
  private kpis: KpiDef[] = [];
  private tips: TipRule[] = [];

  prime({ kpis, tips }: { kpis?: KpiDef[]; tips?: TipRule[] }) {
    if (kpis) {
      this.kpis = kpis;
    }
    if (tips) {
      this.tips = tips;
    }
  }

  loadSnapshot(): SnapshotPayload | null {
    const snapshot = readSnapshot() as SnapshotPayload | null;
    if (!snapshot) return null;
    this.dataset = snapshot.dataset;
    this.runMeta = snapshot.runMeta;
    this.result = snapshot.result;
    this.previousResult = snapshot.previousResult;
    return snapshot;
  }

  getDataset(): DatasetInfo | undefined {
    return this.dataset;
  }

  async loadCsvFile(file: File): Promise<DatasetInfo> {
    const text = await file.text();
    return this.loadCsvText(text, file.name);
  }

  async loadParquetFile(file: File): Promise<DatasetInfo> {
    const text = await file.text();
    return this.loadCsvText(text, file.name);
  }

  async loadCsvText(text: string, name = 'Local Import'): Promise<DatasetInfo> {
    const dataset = parseCsv(text);
    dataset.name = name;
    this.dataset = dataset;
    storeSnapshot({ dataset });
    return dataset;
  }

  async loadFromUrl(url: string, name: string): Promise<DatasetInfo> {
    const res = await fetch(url);
    const text = await res.text();
    return this.loadCsvText(text, name);
  }

  run(model: DnDModel, purpose: ReportPurpose): QueryResult {
    if (!this.dataset) {
      throw new Error('Dataset not loaded');
    }
    const result = aggregate(this.dataset, model);
    this.previousResult = this.result;
    this.result = result;
    const runMeta: RunMeta = {
      id: `${Date.now()}`,
      createdAt: Date.now(),
      purpose,
      model: JSON.parse(JSON.stringify(model)),
    };
    this.runMeta = runMeta;
    storeSnapshot({ dataset: this.dataset, runMeta, result, previousResult: this.previousResult });
    return result;
  }

  getPreviousResult(): QueryResult | undefined {
    return this.previousResult;
  }

  getRunMeta(): RunMeta | undefined {
    return this.runMeta;
  }

  getTips(context: RunContext): TipMatch[] {
    return matchTips(this.tips, context);
  }

  getKpis() {
    return this.kpis;
  }
}

let client: DuckClient | null = null;

export const getDuckClient = () => {
  if (!client) {
    client = new DuckClient();
    if (typeof window !== 'undefined') {
      client.loadSnapshot();
    }
  }
  return client;
};
