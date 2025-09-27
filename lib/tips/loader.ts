import fs from 'node:fs';
import path from 'node:path';
import { TipRule } from '@/types/report';

const TIPS_PATH = path.join(process.cwd(), 'data', 'tips.yml');

export const loadTipRules = (): TipRule[] => {
  try {
    const raw = fs.readFileSync(TIPS_PATH, 'utf8');
    return JSON.parse(raw) as TipRule[];
  } catch (error) {
    console.error('Unable to load tips config', error);
    return [];
  }
};
