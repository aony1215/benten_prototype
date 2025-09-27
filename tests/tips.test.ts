import test from 'node:test';
import assert from 'node:assert/strict';
import { matchTips } from '../lib/tips/matcher';
import { RunContext, TipRule } from '../types/report';

test('matchTips filters by purpose and dimensions', () => {
  const rules: TipRule[] = [
    {
      id: '1',
      when: { purpose: 'QBR', dimsContains: ['channel'] },
      suggest: { action: 'sort', label: 'Sort by spend' },
    },
    {
      id: '2',
      when: { purpose: 'Proposal' },
      suggest: { action: 'setLimit', payload: { limit: 5 }, label: 'Limit results' },
    },
  ];

  const ctx: RunContext = {
    purpose: 'QBR',
    dataset: undefined,
    model: { dims: [{ name: 'channel' }], measures: [], filters: {} },
    kpiIds: [],
  };

  const matches = matchTips(rules, ctx);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].id, '1');
});

test('matchTips considers KPI selection', () => {
  const rules: TipRule[] = [
    {
      id: 'ctr-tip',
      when: { kpi: 'ctr' },
      suggest: { action: 'addDimension', payload: { name: 'Date' }, label: 'Add date' },
    },
  ];

  const ctx: RunContext = {
    purpose: 'Proposal',
    dataset: undefined,
    model: { dims: [], measures: [], filters: {} },
    kpiIds: ['ctr'],
  };

  const matches = matchTips(rules, ctx);
  assert.equal(matches.length, 1);
});
