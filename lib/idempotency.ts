import { Run } from "./types";

type Mode = Run["mode"];

function isoWeek(date: Date): { year: number; week: number } {
  const tmp = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: tmp.getUTCFullYear(), week };
}

export function windowFromDate(date: Date = new Date()): string {
  const { year, week } = isoWeek(date);
  return `${year}${String(week).padStart(2, "0")}`;
}

export function makeKey(
  projectId: string,
  playbookVersionId: string,
  window: string,
  mode: Mode
): string {
  return `${projectId}#${playbookVersionId}#${window}#${mode}`;
}

export function nextMode(current: Mode): Mode {
  switch (current) {
    case "shadow":
      return "canary";
    case "canary":
      return "prod";
    default:
      return "prod";
  }
}
