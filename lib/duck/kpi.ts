import fs from 'node:fs';
import path from 'node:path';
import { Dimension, KpiDef, Measure } from '@/types/report';

const KPI_PATH = path.join(process.cwd(), 'data', 'kpi.yml');

interface RawKpi {
  id: string;
  title: string;
  measure: Measure;
  dimensions: Dimension[];
}

export const loadKpis = (): KpiDef[] => {
  try {
    const raw = fs.readFileSync(KPI_PATH, 'utf8');
    const parsed = JSON.parse(raw) as RawKpi[];
    return parsed.map((item) => ({
      ...item,
      measure: { ...item.measure },
      dimensions: item.dimensions.map((dim) => ({ ...dim })),
    }));
  } catch (error) {
    console.error('Unable to load KPI definitions', error);
    return [];
  }
};
