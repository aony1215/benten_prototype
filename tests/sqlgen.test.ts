import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQuery } from '../lib/sqlgen/buildQuery';
import { DnDModel } from '../types/report';

test('buildQuery generates select and group by clauses', () => {
  const model: DnDModel = {
    dims: [{ name: 'channel' }],
    measures: [{ name: 'spend', agg: 'sum' }],
    filters: { channel: 'Search' },
    sort: [{ by: 'spend', dir: 'desc' }],
    limit: 5,
  };

  const query = buildQuery(model, 'ads');
  assert.ok(query.sql.includes('SELECT'));
  assert.ok(query.sql.includes('FROM "ads"'));
  assert.ok(query.sql.includes('GROUP BY "channel"'));
  assert.ok(query.sql.includes('LIMIT 5'));
  assert.equal(query.projection.length, 2);
});

test('buildQuery handles empty model', () => {
  const model: DnDModel = {
    dims: [],
    measures: [],
    filters: {},
  };

  const query = buildQuery(model, 'dataset');
  assert.ok(query.sql.includes('COUNT(*) AS "count"'));
});
