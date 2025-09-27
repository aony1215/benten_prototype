import { Agg, DnDModel, Measure } from '@/types/report';

export interface BuiltQuery {
  sql: string;
  projection: Array<{ alias: string; source: string; type: 'dimension' | 'measure'; agg?: Agg }>;
  groupBy: string[];
}

const DEFAULT_SOURCE = 'main_dataset';

const aggExpression = (measure: Measure) => {
  const expr = measure.expr ?? measure.name;
  switch (measure.agg) {
    case 'sum':
    case 'avg':
    case 'min':
    case 'max':
      return `${measure.agg.toUpperCase()}(${expr})`;
    case 'count':
      return `COUNT(${expr || '*'})`;
    default:
      return expr;
  }
};

const escapeIdentifier = (value: string) => `"${value.replace(/"/g, '""')}"`;

export const buildQuery = (model: DnDModel, source: string = DEFAULT_SOURCE): BuiltQuery => {
  const projection: BuiltQuery['projection'] = [];
  const groupBy: string[] = [];

  model.dims.forEach((dim) => {
    const alias = dim.name;
    const expr = dim.expr ?? dim.name;
    projection.push({ alias, source: expr, type: 'dimension' });
    groupBy.push(expr);
  });

  model.measures.forEach((measure) => {
    const alias = measure.name;
    const expr = aggExpression(measure);
    projection.push({ alias, source: expr, type: 'measure', agg: measure.agg });
  });

  if (projection.length === 0) {
    projection.push({ alias: 'count', source: 'COUNT(*)', type: 'measure', agg: 'count' });
  }

  const selectSql = projection
    .map((p) => `${p.source} AS ${escapeIdentifier(p.alias)}`)
    .join(', ');

  const base = [`SELECT ${selectSql}`, `FROM ${escapeIdentifier(source)}`];

  const whereClauses: string[] = [];
  Object.entries(model.filters || {}).forEach(([field, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value) && value.length === 0) return;
    if (Array.isArray(value)) {
      const list = value.map((v) => `\'${String(v).replace(/'/g, "''")}\'`).join(', ');
      whereClauses.push(`${escapeIdentifier(field)} IN (${list})`);
    } else if (typeof value === 'object') {
      const range: string[] = [];
      const min = (value as Record<string, unknown>).min;
      const max = (value as Record<string, unknown>).max;
      if (min !== undefined) {
        range.push(`${escapeIdentifier(field)} >= '${min}'`);
      }
      if (max !== undefined) {
        range.push(`${escapeIdentifier(field)} <= '${max}'`);
      }
      if (range.length) {
        whereClauses.push(range.join(' AND '));
      }
    } else {
      whereClauses.push(`${escapeIdentifier(field)} = '${String(value).replace(/'/g, "''")}'`);
    }
  });

  if (whereClauses.length) {
    base.push(`WHERE ${whereClauses.join(' AND ')}`);
  }

  if (groupBy.length) {
    base.push(`GROUP BY ${groupBy.map(escapeIdentifier).join(', ')}`);
  }

  if (model.sort && model.sort.length) {
    const order = model.sort
      .map((item) => `${escapeIdentifier(item.by)} ${item.dir.toUpperCase()}`)
      .join(', ');
    base.push(`ORDER BY ${order}`);
  }

  if (model.limit) {
    base.push(`LIMIT ${model.limit}`);
  }

  return { sql: base.join('\n'), projection, groupBy };
};
