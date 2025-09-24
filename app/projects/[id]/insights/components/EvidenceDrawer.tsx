"use client";

import { useEffect } from "react";

import { Run } from "@/lib/types";

type EvidenceDrawerProps = {
  open: boolean;
  onClose: () => void;
  run?: Run;
  ticketYaml: string;
};

export default function EvidenceDrawer({ open, onClose, run, ticketYaml }: EvidenceDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const contextSnapshot = run?.context_snapshot;
  const dataSnapshot = run?.data_snapshot;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticketYaml);
    } catch (error) {
      console.error("copy failed", error);
    }
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 rounded-t-2xl border border-slate-200 bg-white shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Evidence drawer"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Evidence & Snapshots</h2>
          <p className="text-xs text-slate-500">Ensures reproducibility and context provenance.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="rounded-md border border-slate-300 px-3 py-1 text-xs"
          >
            Copy for ticket
          </button>
          <button onClick={onClose} className="rounded-md border border-slate-300 px-3 py-1 text-xs">
            Close
          </button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto px-6 py-4 text-xs text-slate-600">
        <div className="space-y-4">
          <section>
            <h3 className="text-xs font-semibold text-slate-700">Context Snapshot</h3>
            <pre className="mt-2 overflow-auto rounded-lg bg-slate-900/90 p-3 text-[11px] text-emerald-100">
              {JSON.stringify(contextSnapshot, null, 2)}
            </pre>
          </section>
          <section>
            <h3 className="text-xs font-semibold text-slate-700">Data Snapshot</h3>
            <pre className="mt-2 overflow-auto rounded-lg bg-slate-900/90 p-3 text-[11px] text-emerald-100">
              {JSON.stringify(dataSnapshot, null, 2)}
            </pre>
          </section>
          <section>
            <h3 className="text-xs font-semibold text-slate-700">Ticket Payload</h3>
            <pre className="mt-2 overflow-auto rounded-lg bg-slate-100 p-3 text-[11px] text-slate-700">
              {ticketYaml}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
