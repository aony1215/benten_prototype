"use client";

import { useEffect, useMemo, useState } from "react";

import { observeTrace } from "@/lib/api";
import { Project, ContextSnapshot, DataSnapshot } from "@/lib/types";
import {
  KnowledgeChunkInput,
  buildContextSnapshot,
  buildManualContextSnapshot,
  chunkManualText,
} from "@/lib/snapshot";

const MOCK_KNOWLEDGE_CHUNKS: KnowledgeChunkInput[] = [
  {
    id: "brand_guideline#c3",
    content: "Always highlight CTR improvements and ensure compliance with ad copy policies.",
  },
  {
    id: "promo_brief#c5",
    content: "Focus on spring campaign promoting conversion uplift and cross-channel synergy.",
  },
  {
    id: "kpi_targets#c1",
    content: "Primary KPI is ROAS > 3.0 with CPA under 120 USD per acquisition.",
  },
];

type ContextIntakeProps = {
  project: Project;
  asOf: string;
  stateId: string | null;
  dataSnapshot: DataSnapshot | null;
  contextSnapshot: ContextSnapshot | null;
  onCreateSnapshot: (asOf: string) => void | Promise<void>;
  onContextSnapshotChange: (snapshot: ContextSnapshot) => void;
  disabled?: boolean;
};

type TabKey = "sense" | "manual";

export default function ContextIntake({
  project,
  asOf,
  stateId,
  dataSnapshot,
  contextSnapshot,
  onCreateSnapshot,
  onContextSnapshotChange,
  disabled,
}: ContextIntakeProps) {
  const [tab, setTab] = useState<TabKey>("sense");
  const [selectedChunkIds, setSelectedChunkIds] = useState<string[]>([]);
  const [manualText, setManualText] = useState<string>("");
  const [contextBusy, setContextBusy] = useState(false);
  const [asOfLocal, setAsOfLocal] = useState<string>(asOf);

  useEffect(() => {
    setAsOfLocal(asOf);
  }, [asOf]);

  const handleCreateSnapshot = async () => {
    await onCreateSnapshot(asOfLocal);
  };

  useEffect(() => {
    if (tab !== "sense") return;
    const build = async () => {
      setContextBusy(true);
      const selectedChunks = MOCK_KNOWLEDGE_CHUNKS.filter((chunk) => selectedChunkIds.includes(chunk.id));
      const snapshot = await buildContextSnapshot({ chunks: selectedChunks });
      onContextSnapshotChange(snapshot);
      setContextBusy(false);
    };
    build();
  }, [onContextSnapshotChange, selectedChunkIds, tab]);

  useEffect(() => {
    if (tab !== "manual") return;
    let cancelled = false;
    const run = async () => {
      setContextBusy(true);
      const snapshot = await buildManualContextSnapshot(manualText || "");
      if (!cancelled) {
        onContextSnapshotChange(snapshot);
        setContextBusy(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [manualText, onContextSnapshotChange, tab]);

  const manualChunks = useMemo(() => chunkManualText(manualText || ""), [manualText]);

  const handleGuardrailValidate = async () => {
    await observeTrace({
      span: "ui.generate",
      level: "info",
      message: "guardrail_validate",
      payload: {
        project_id: project.id,
        chunk_count: tab === "sense" ? selectedChunkIds.length : manualChunks.length,
      },
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Context Intake</h2>
        <p className="text-xs text-slate-500">Select data sources and knowledge chunks.</p>
      </div>
      <div role="tablist" aria-label="Context intake tabs" className="flex gap-1 px-4 pt-3">
        <button
          role="tab"
          aria-selected={tab === "sense"}
          className={`rounded-full px-3 py-1 text-xs ${
            tab === "sense" ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700"
          }`}
          onClick={() => setTab("sense")}
        >
          自動取込（DataSourceから）
        </button>
        <button
          role="tab"
          aria-selected={tab === "manual"}
          className={`rounded-full px-3 py-1 text-xs ${
            tab === "manual" ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700"
          }`}
          onClick={() => setTab("manual")}
        >
          貼り付け（手動コンテキスト）
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 text-sm text-slate-700">
        {tab === "sense" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500">As of</label>
              <input
                type="datetime-local"
                value={asOfLocal}
                onChange={(event) => setAsOfLocal(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                disabled={disabled}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Knowledge chunks</p>
              <ul className="mt-2 space-y-2">
                {MOCK_KNOWLEDGE_CHUNKS.map((chunk) => {
                  const checked = selectedChunkIds.includes(chunk.id);
                  return (
                    <li key={chunk.id} className="rounded-md border border-slate-200 p-2">
                      <label className="flex items-start gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedChunkIds((prev) =>
                              checked ? prev.filter((id) => id !== chunk.id) : [...prev, chunk.id]
                            );
                          }}
                        />
                        <span>
                          <span className="font-medium text-slate-700">{chunk.id}</span>
                          <span className="mt-1 block text-slate-500">{chunk.content}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-500" htmlFor="manual-context">
              Paste plain text / markdown
            </label>
            <textarea
              id="manual-context"
              className="h-48 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Paste supporting context…"
              value={manualText}
              onChange={(event) => setManualText(event.target.value)}
            />
            <div>
              <p className="text-xs font-semibold text-slate-500">Detected chunks</p>
              <ul className="mt-2 space-y-2">
                {manualChunks.map((chunk) => (
                  <li key={chunk.id} className="rounded-md border border-slate-200 p-2 text-xs text-slate-600">
                    <span className="font-medium text-slate-700">{chunk.id}</span>
                    <span className="mt-1 block text-slate-500">{chunk.content}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-slate-200 px-4 py-4 text-xs text-slate-600">
        <p className="flex items-center justify-between">
          <span>State ID</span>
          <span className="font-mono text-slate-500">{stateId ?? "—"}</span>
        </p>
        <p className="mt-2 flex items-center justify-between">
          <span>Data Snapshot</span>
          <span className="font-mono text-slate-500">{dataSnapshot?.as_of ?? "—"}</span>
        </p>
        <p className="mt-2 flex items-center justify-between">
          <span>Knowledge Hash</span>
          <span className="font-mono text-slate-500">{contextSnapshot?.knowledge_hash ?? "—"}</span>
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleCreateSnapshot}
            disabled={disabled}
            className="flex-1 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:bg-slate-400"
          >
            Create Snapshot
          </button>
          <button
            onClick={handleGuardrailValidate}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs"
          >
            Validate Guardrails
          </button>
        </div>
        {contextBusy && <p className="mt-2 text-xs text-slate-500">Building context snapshot…</p>}
      </div>
    </div>
  );
}
