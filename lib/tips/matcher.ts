import { DnDModel, RunContext, TipMatch, TipRule } from '@/types/report';

const hasDimensions = (model: DnDModel, dims: string[]): boolean => {
  const present = new Set(model.dims.map((dim) => dim.name.toLowerCase()));
  return dims.every((dim) => present.has(dim.toLowerCase()));
};

export const matchTips = (rules: TipRule[], ctx: RunContext): TipMatch[] => {
  return rules
    .filter((rule) => {
      if (rule.when.purpose && rule.when.purpose !== ctx.purpose) {
        return false;
      }
      if (rule.when.kpi && !ctx.kpiIds.includes(rule.when.kpi)) {
        return false;
      }
      if (rule.when.dimsContains && rule.when.dimsContains.length) {
        if (!hasDimensions(ctx.model, rule.when.dimsContains)) {
          return false;
        }
      }
      return true;
    })
    .map((rule) => ({ ...rule }));
};
