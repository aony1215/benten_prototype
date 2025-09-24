"use client";

import { Run } from "@/lib/types";

type ActionBarProps = {
  mode: Run["mode"];
  idempotencyKey: string;
  canGenerate: boolean;
  busy: boolean;
  guardrailsBlocked: boolean;
  approvals: string[];
  onGenerate: () => void;
  onImprove: () => void;
  onPromote: (mode: Run["mode"]) => void;
};

export default function ActionBar({
  mode,
  idempotencyKey,
  canGenerate,
  busy,
  guardrailsBlocked,
  approvals,
  onGenerate,
  onImprove,
  onPromote,
}: ActionBarProps) {
  const promoteDisabled = busy || guardrailsBlocked;
  const approvalsRequired = approvals.length > 0;

  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-3 text-sm text-slate-600">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span>
            Mode: <span className="font-medium text-slate-900">{mode}</span>
          </span>
          <span className="font-mono text-slate-500">{idempotencyKey || "idempotency pending"}</span>
          {approvalsRequired && (
            <span className="text-amber-600">
              Approvals required: {approvals.join(", ")}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onGenerate}
            disabled={!canGenerate || busy}
            className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:bg-slate-400"
          >
            Generate Insight（shadow）
          </button>
          <button
            onClick={onImprove}
            disabled={busy}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs"
          >
            Improve with Comments
          </button>
          <button
            onClick={() => onPromote("canary")}
            disabled={promoteDisabled}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs"
          >
            Promote to Canary
          </button>
          <button
            onClick={() => onPromote("prod")}
            disabled={promoteDisabled || mode !== "canary"}
            className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:bg-emerald-300"
          >
            Publish to Prod
          </button>
        </div>
      </div>
    </footer>
  );
}
