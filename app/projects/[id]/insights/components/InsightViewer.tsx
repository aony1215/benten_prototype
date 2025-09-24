"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Run } from "@/lib/types";

type BaseBlock = { id: string; type: string };
export type InsightTextBlock = BaseBlock & { type: "paragraph" | "bullet"; text: string };
export type InsightKpiBlock = BaseBlock & { type: "kpi"; label: string; value: string; delta?: string };
export type InsightChartBlock = BaseBlock & { type: "chart"; chartId: string; description?: string };
export type InsightBlock = InsightTextBlock | InsightKpiBlock | InsightChartBlock | BaseBlock;

type InsightViewerProps = {
  run?: Run;
  blocks: InsightBlock[];
};

type BlockDiffState = {
  changed: Set<string>;
  previousContent: Map<string, string>;
};

function blockContent(block: InsightBlock): string {
  switch (block.type) {
    case "paragraph":
    case "bullet":
      return block.text;
    case "kpi":
      return `${block.label}:${block.value}:${block.delta ?? ""}`;
    case "chart":
      return block.description ?? "chart";
    default:
      return JSON.stringify(block);
  }
}

export default function InsightViewer({ run, blocks }: InsightViewerProps) {
  const [diffState, setDiffState] = useState<BlockDiffState>({ changed: new Set(), previousContent: new Map() });
  const previousBlocks = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!run) return;
    const nextContent = new Map<string, string>();
    const changed = new Set<string>();
    blocks.forEach((block) => {
      const content = blockContent(block);
      nextContent.set(block.id, content);
      const previous = previousBlocks.current.get(block.id);
      if (previous && previous !== content) {
        changed.add(block.id);
      }
      if (!previous) {
        changed.add(block.id);
      }
    });
    setDiffState({ changed, previousContent: new Map(previousBlocks.current) });
    previousBlocks.current = nextContent;
  }, [blocks, run]);

  const hasBlocks = blocks.length > 0;

  const content = useMemo(() => {
    if (!hasBlocks) {
      return (
        <div className="p-8 text-sm text-slate-500">Generate an insight to see report content.</div>
      );
    }
    return (
      <div className="space-y-4 p-6 text-sm text-slate-800">
        {blocks.map((block) => {
          const changed = diffState.changed.has(block.id);
          switch (block.type) {
            case "paragraph":
              return (
                <p
                  key={block.id}
                  data-block-id={block.id}
                  className={`rounded-lg px-3 py-2 leading-relaxed ${
                    changed ? "bg-amber-50 ring-1 ring-amber-200" : "bg-white"
                  }`}
                >
                  {block.text}
                </p>
              );
            case "bullet":
              return (
                <div
                  key={block.id}
                  data-block-id={block.id}
                  className={`rounded-lg px-3 py-2 ${changed ? "bg-amber-50 ring-1 ring-amber-200" : "bg-white"}`}
                >
                  <ul className="list-disc pl-5 text-sm text-slate-700">
                    <li>{block.text}</li>
                  </ul>
                </div>
              );
            case "kpi":
              return (
                <div
                  key={block.id}
                  data-block-id={block.id}
                  className={`grid grid-cols-2 gap-2 rounded-lg border border-slate-200 px-3 py-2 ${
                    changed ? "bg-amber-50" : "bg-white"
                  }`}
                >
                  <span className="text-xs uppercase tracking-wide text-slate-500">{block.label}</span>
                  <span className="text-right text-lg font-semibold text-slate-900">{block.value}</span>
                  {block.delta && (
                    <span className="col-span-2 text-xs text-emerald-600">Δ {block.delta}</span>
                  )}
                </div>
              );
            case "chart":
              return (
                <div
                  key={block.id}
                  data-block-id={block.id}
                  data-target-id={block.chartId}
                  className={`rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-500 ${
                    changed ? "bg-amber-50" : "bg-slate-50"
                  }`}
                >
                  Chart placeholder: {block.description ?? block.chartId}
                </div>
              );
            default:
              return (
                <pre
                  key={block.id}
                  data-block-id={block.id}
                  className="rounded-lg bg-slate-900/90 px-3 py-2 text-xs text-white"
                >
                  {JSON.stringify(block, null, 2)}
                </pre>
              );
          }
        })}
      </div>
    );
  }, [blocks, diffState.changed, hasBlocks]);

  return (
    <section aria-live="polite" aria-label="Insight viewer" className="min-h-full">
      {content}
    </section>
  );
}

export { InsightBlock };
