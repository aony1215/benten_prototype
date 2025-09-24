import { describe, expect, test } from "bun:test";

import {
  computeGoldenScore,
  createRun,
  createSnapshot,
  decide,
  listGoldenRubrics,
} from "../lib/api";

const projectId = "demo-project";

async function prepareSnapshots() {
  const snapshot = await createSnapshot({ project_id: projectId, as_of: new Date().toISOString() });
  return snapshot;
}

describe("api mock flows", () => {
  test("createRun is idempotent per key", async () => {
    const { state_id, data_snapshot } = await prepareSnapshots();
    const decision = await decide({
      state_id,
      playbook_version_id: "pbk_report_insight_writer@0.1.0",
      objective_id: "o1",
      policy_set_id: "policy",
    });
    const context_snapshot = {
      knowledge_hash: "abc",
      included_chunks: ["demo"],
    };
    const key = `${projectId}#pbk_report_insight_writer@0.1.0#202452#shadow`;
    const first = await createRun({
      project_id: projectId,
      playbook_version_id: "pbk_report_insight_writer@0.1.0",
      decision_event_id: decision.decision_event_id,
      mode: "shadow",
      idempotency_key: key,
      context_snapshot,
      data_snapshot,
    });
    const second = await createRun({
      project_id: projectId,
      playbook_version_id: "pbk_report_insight_writer@0.1.0",
      decision_event_id: decision.decision_event_id,
      mode: "shadow",
      idempotency_key: key,
      context_snapshot,
      data_snapshot,
    });
    expect(first.run.id).toBe(second.run.id);
  });

  test("golden score respects rubric weights", async () => {
    const rubric = listGoldenRubrics()[0];
    const score = await computeGoldenScore(rubric, [
      { id: rubric.criteria[0].id, score: 0.8 },
      { id: rubric.criteria[1].id, score: 0.5 },
      { id: rubric.criteria[2].id, score: 0.4 },
    ]);
    const weightSum = rubric.criteria.reduce((sum, c) => sum + c.weight, 0);
    const expected = Math.round(
      (
        (rubric.criteria[0].weight * 0.8 +
          rubric.criteria[1].weight * 0.5 +
          rubric.criteria[2].weight * 0.4) /
        weightSum
      ) * 10000
    ) / 100;
    expect(score.overall).toBe(expected);
  });
});
