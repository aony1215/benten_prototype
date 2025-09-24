"use client";

import { useMemo, useState } from "react";

import { computeGoldenScore } from "@/lib/api";
import { GoldenRubric, GoldenScore, Run } from "@/lib/types";

const MOCK_DATASETS = [
  { id: "golden_dataset_main", label: "Golden Dataset · Main" },
  { id: "golden_dataset_regional", label: "Golden Dataset · Regional" },
];

type GoldenScorePanelProps = {
  rubrics: GoldenRubric[];
  currentRun?: Run;
  onScore: (event: { rubric: GoldenRubric; score: GoldenScore }) => void;
};

export default function GoldenScorePanel({ rubrics, currentRun, onScore }: GoldenScorePanelProps) {
  const [selectedRubricId, setSelectedRubricId] = useState<string>(rubrics[0]?.id ?? "");
  const [selectedDataset, setSelectedDataset] = useState<string>(MOCK_DATASETS[0]?.id ?? "");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [result, setResult] = useState<GoldenScore | null>(null);

  const selectedRubric = useMemo(
    () => rubrics.find((rubric) => rubric.id === selectedRubricId) ?? rubrics[0],
    [rubrics, selectedRubricId]
  );

  const handleScore = async () => {
    if (!currentRun || !selectedRubric) return;
    const perCriterion = selectedRubric.criteria.map((criterion) => ({
      id: criterion.id,
      score: (scores[criterion.id] ?? 0) / 100,
    }));
    const score = await computeGoldenScore(selectedRubric, perCriterion);
    setResult(score);
    onScore({ rubric: selectedRubric, score });
  };

  return (
    <aside className="w-[320px] min-w-[320px] border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Golden Score</h2>
        <p className="text-xs text-slate-500">Evaluate against curated rubric.</p>
      </div>
      <div className="space-y-4 px-4 py-4 text-xs text-slate-600">
        <div>
          <label className="block text-xs font-medium text-slate-500">Golden dataset</label>
          <select
            value={selectedDataset}
            onChange={(event) => setSelectedDataset(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1"
          >
            {MOCK_DATASETS.map((dataset) => (
              <option key={dataset.id} value={dataset.id}>
                {dataset.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Rubric</label>
          <select
            value={selectedRubric?.id}
            onChange={(event) => setSelectedRubricId(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1"
          >
            {rubrics.map((rubric) => (
              <option key={rubric.id} value={rubric.id}>
                {rubric.name}
              </option>
            ))}
          </select>
        </div>
        {selectedRubric && (
          <div className="space-y-3">
            {selectedRubric.criteria.map((criterion) => (
              <div key={criterion.id} className="space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-medium text-slate-700">{criterion.label}</span>
                  <span>{Math.round((scores[criterion.id] ?? 0))}/100</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={scores[criterion.id] ?? 0}
                  onChange={(event) =>
                    setScores((prev) => ({ ...prev, [criterion.id]: Number(event.target.value) }))
                  }
                  className="w-full"
                />
                {criterion.description && (
                  <p className="text-[11px] text-slate-500">{criterion.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={handleScore}
          disabled={!currentRun}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:bg-slate-400"
        >
          Score & Record Evaluation
        </button>
        {result && (
          <div className="rounded-lg border border-slate-200 p-3 text-xs text-slate-600">
            <p className="text-sm font-semibold text-slate-800">Overall: {result.overall.toFixed(2)}</p>
            <ul className="mt-2 space-y-1">
              {result.perCriterion.map((entry) => {
                const criterion = selectedRubric?.criteria.find((item) => item.id === entry.id);
                return (
                  <li key={entry.id} className="flex items-center justify-between">
                    <span>{criterion?.label ?? entry.id}</span>
                    <span>{Math.round(entry.score * 100)} / 100</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
