import {
  CommentThread,
  ContextSnapshot,
  DataSnapshot,
  DecisionEvent,
  GoldenRubric,
  GoldenScore,
  Project,
  Run,
} from "./types";

export type SnapshotRequest = { project_id: string; as_of: string };
export type SnapshotResponse = { state_id: string; data_snapshot: DataSnapshot };

export type DecideRequest = {
  state_id: string;
  playbook_version_id: string;
  objective_id: string;
  policy_set_id: string;
  candidates?: Array<Record<string, unknown>>;
};

export type DecideResponse = {
  decision_event_id: string;
  proposed_action_set: Record<string, unknown>;
  confidence: number;
  guardrail_results?: { status: "pass" | "fail"; required_approvals?: string[] };
};

export type RunRequest = {
  project_id: string;
  playbook_version_id: string;
  decision_event_id?: string;
  mode: Run["mode"];
  idempotency_key: string;
  rollback_action?: Record<string, unknown>;
  context_snapshot: ContextSnapshot;
  data_snapshot: DataSnapshot;
};

export type RunResponse = { run_id: string; state: Run["state"] };

export type TrackRunRequest = { raw_metrics: Record<string, unknown> };
export type TrackRunResponse = { accepted: boolean };

export type LearnRequest = {
  playbook_id: string;
  sources: { decision_event_ids: string[]; evaluation_ids: string[] };
};
export type LearnResponse = {
  param_update?: Record<string, unknown>;
  playbook_version_draft?: Record<string, unknown>;
};

export type ExplainResponse = {
  rationale: string;
  counterfactuals: string[];
};

export type EvaluationRequest = {
  run_id?: string;
  experiment_id?: string;
  method: string;
  metric: string;
  effect: number;
  ci_low?: number;
  ci_high?: number;
  horizon: string;
  inputs: Record<string, unknown>;
};
export type EvaluationResponse = { evaluation_id: string };

export type GovernEvaluateRequest = {
  action_set: Record<string, unknown>;
  policy_set_id: string;
};
export type GovernEvaluateResponse = {
  decision: "allow" | "deny";
  required_approvals: string[];
};

export type ObserveTraceRequest = {
  span: string;
  level: "info" | "warn" | "error";
  message: string;
  payload: Record<string, unknown>;
};
export type ObserveTraceResponse = { accepted: boolean };

export type MockCommentArchive = {
  run_id: string;
  threads: CommentThread[];
};

const USE_MOCK = process.env.NEXT_PUBLIC_API_MODE !== "live";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class MockBackend {
  private projects = new Map<string, Project>();
  private decisions = new Map<string, DecisionEvent>();
  private runs = new Map<string, Run>();
  private runsByKey = new Map<string, Run>();
  private snapshots = new Map<string, { state_id: string; data_snapshot: DataSnapshot }>();
  private commentArchives = new Map<string, MockCommentArchive>();
  private evaluations: EvaluationRequest[] = [];
  private rubrics: GoldenRubric[] = [
    {
      id: "golden_rubric_default",
      name: "Default Golden Rubric",
      criteria: [
        { id: "accuracy", label: "Accuracy", weight: 0.4 },
        { id: "clarity", label: "Clarity", weight: 0.3 },
        { id: "actionability", label: "Actionability", weight: 0.3 },
      ],
    },
  ];

  constructor() {
    const project: Project = {
      id: "demo-project",
      name: "Demo Project",
      effective_scope: { visible_via: ["pg_reporting", "ads_team"] },
    };
    this.projects.set(project.id, project);
  }

  async getProject(projectId: string): Promise<Project> {
    const project = this.projects.get(projectId) ?? {
      id: projectId,
      name: `Project ${projectId}`,
      effective_scope: { visible_via: ["pg_reporting"] },
    };
    this.projects.set(projectId, project);
    return project;
  }

  async createSnapshot(request: SnapshotRequest): Promise<SnapshotResponse> {
    const stateId = `${request.project_id}:state:${Date.now()}`;
    const dataSnapshot: DataSnapshot = {
      datasets: {
        feat_web_ads_timeseries: "bq://demo.ads.timeseries@commit_mock",
        feat_channel_mix: "bq://demo.ads.channel_mix@commit_mock",
        feat_kpi_baseline: "bq://demo.ads.kpi_baseline@commit_mock",
      },
      as_of: request.as_of,
    };
    const response = { state_id: stateId, data_snapshot: dataSnapshot };
    this.snapshots.set(stateId, response);
    return response;
  }

  async decide(request: DecideRequest): Promise<DecideResponse> {
    const decisionId = `dec-${Math.random().toString(36).slice(2, 10)}`;
    const decision: DecisionEvent = {
      id: decisionId,
      project_id: request.state_id.split(":")[0],
      candidates: request.candidates ?? [
        {
          action: "write_insight",
          parameters: { tone: "concise-business", include_charts: true },
        },
      ],
      chosen_action: {
        action: "write_insight",
        parameters: { revision_notes: request.candidates?.[0]?.revision_notes },
      },
      rationale: {
        top_factors: ["historical_ctr", "channel_mix_shift"],
        guardrail_status: "pass",
      },
    };
    this.decisions.set(decisionId, decision);
    return {
      decision_event_id: decisionId,
      proposed_action_set: {
        actions: decision.candidates,
      },
      confidence: 0.82,
      guardrail_results: { status: "pass" },
    };
  }

  private buildInsight(runId: string, notes?: string): Record<string, unknown> {
    return {
      artifact: {
        type: "insight",
        blocks: [
          {
            id: `${runId}-b1`,
            type: "paragraph",
            text: "Web ad performance improved 12% WoW driven by higher CTR on branded queries.",
          },
          {
            id: `${runId}-b2`,
            type: "bullet",
            text: "Paid social ROAS rose to 3.1x with stable spend levels.",
          },
          {
            id: `${runId}-b3`,
            type: "kpi",
            label: "Spend",
            value: "$120k",
            delta: "+4%",
          },
          {
            id: `${runId}-b4`,
            type: "paragraph",
            text: notes
              ? `Incorporated reviewer notes: ${notes}`
              : "Search conversions held steady despite reduced impression share.",
          },
        ],
      },
    };
  }

  async createRun(request: RunRequest): Promise<{ run: Run; response: RunResponse }> {
    const existing = this.runsByKey.get(request.idempotency_key);
    if (existing) {
      return { run: existing, response: { run_id: existing.id, state: existing.state } };
    }
    const runId = `run-${Math.random().toString(36).slice(2, 8)}`;
    const decision = request.decision_event_id ? this.decisions.get(request.decision_event_id) : undefined;
    const run: Run = {
      id: runId,
      project_id: request.project_id,
      playbook_version_id: request.playbook_version_id,
      decision_event_id: request.decision_event_id,
      mode: request.mode,
      idempotency_key: request.idempotency_key,
      context_snapshot: request.context_snapshot,
      data_snapshot: request.data_snapshot,
      outcome: this.buildInsight(runId, decision?.chosen_action?.parameters?.revision_notes as string | undefined),
      state: "executing",
    };
    this.runs.set(runId, run);
    this.runsByKey.set(request.idempotency_key, run);
    return { run, response: { run_id: runId, state: run.state } };
  }

  async trackRun(runId: string, request: TrackRunRequest): Promise<TrackRunResponse> {
    const run = this.runs.get(runId);
    if (run) {
      run.outcome = {
        ...(run.outcome ?? {}),
        metrics: request.raw_metrics,
      };
      this.runs.set(runId, run);
    }
    return { accepted: true };
  }

  async getRun(runId: string): Promise<Run> {
    const run = this.runs.get(runId);
    if (!run) {
      throw new Error(`Run ${runId} not found`);
    }
    return run;
  }

  async learn(_request: LearnRequest): Promise<LearnResponse> {
    return {
      param_update: { tone: "concise-business" },
    };
  }

  async explain(decisionEventId: string): Promise<ExplainResponse> {
    const decision = this.decisions.get(decisionEventId);
    return {
      rationale: decision?.rationale?.top_factors?.join(", ") ?? "No rationale",
      counterfactuals: ["Increase budget on branded search by 10%"],
    };
  }

  async createEvaluation(request: EvaluationRequest): Promise<EvaluationResponse> {
    this.evaluations.push(request);
    return { evaluation_id: `eval-${this.evaluations.length}` };
  }

  async governEvaluate(_request: GovernEvaluateRequest): Promise<GovernEvaluateResponse> {
    return { decision: "allow", required_approvals: [] };
  }

  async observeTrace(request: ObserveTraceRequest): Promise<ObserveTraceResponse> {
    const { payload } = request;
    if (payload?.type === "comment_threads" && payload.run_id) {
      const archive: MockCommentArchive = {
        run_id: payload.run_id as string,
        threads: (payload.threads as CommentThread[]) ?? [],
      };
      this.commentArchives.set(payload.run_id as string, archive);
    }
    return { accepted: true };
  }

  listCommentThreads(runId: string): CommentThread[] {
    return this.commentArchives.get(runId)?.threads ?? [];
  }

  listRubrics(): GoldenRubric[] {
    return this.rubrics;
  }
}

const mockBackend = new MockBackend();

async function apiFetch<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  if (!USE_MOCK) {
    const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
    const res = await fetch(`${base}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`API ${method} ${path} failed: ${res.status}`);
    }
    return (await res.json()) as T;
  }
  // simulate network delay for UX parity
  if (process.env.NODE_ENV !== "test") {
    await delay(50);
  }
  switch (`${method} ${path}`) {
    case `GET /projects/${path.split("/").pop()}`:
      break;
  }
  throw new Error("Direct path resolution unavailable in mock mode");
}

export async function getProject(projectId: string): Promise<Project> {
  if (USE_MOCK) {
    return mockBackend.getProject(projectId);
  }
  return apiFetch<Project>("GET", `/projects/${projectId}`);
}

export async function createSnapshot(request: SnapshotRequest): Promise<SnapshotResponse> {
  if (USE_MOCK) {
    return mockBackend.createSnapshot(request);
  }
  return apiFetch<SnapshotResponse>("POST", "/sense/snapshots", request);
}

export async function decide(request: DecideRequest): Promise<DecideResponse> {
  if (USE_MOCK) {
    return mockBackend.decide(request);
  }
  return apiFetch<DecideResponse>("POST", "/decide", request);
}

export async function createRun(request: RunRequest): Promise<{ run: Run; response: RunResponse }> {
  if (USE_MOCK) {
    return mockBackend.createRun(request);
  }
  const res = await apiFetch<RunResponse>("POST", "/runs", request);
  const run = await getRun(res.run_id);
  return { run, response: res };
}

export async function trackRun(runId: string, request: TrackRunRequest): Promise<TrackRunResponse> {
  if (USE_MOCK) {
    return mockBackend.trackRun(runId, request);
  }
  return apiFetch<TrackRunResponse>("POST", `/runs/${runId}/track`, request);
}

export async function getRun(runId: string): Promise<Run> {
  if (USE_MOCK) {
    return mockBackend.getRun(runId);
  }
  return apiFetch<Run>("GET", `/runs/${runId}`);
}

export async function learn(request: LearnRequest): Promise<LearnResponse> {
  if (USE_MOCK) {
    return mockBackend.learn(request);
  }
  return apiFetch<LearnResponse>("POST", "/learn", request);
}

export async function explain(decisionEventId: string): Promise<ExplainResponse> {
  if (USE_MOCK) {
    return mockBackend.explain(decisionEventId);
  }
  return apiFetch<ExplainResponse>("GET", `/explain/${decisionEventId}`);
}

export async function createEvaluation(request: EvaluationRequest): Promise<EvaluationResponse> {
  if (USE_MOCK) {
    return mockBackend.createEvaluation(request);
  }
  return apiFetch<EvaluationResponse>("POST", "/evaluations", request);
}

export async function governEvaluate(
  request: GovernEvaluateRequest
): Promise<GovernEvaluateResponse> {
  if (USE_MOCK) {
    return mockBackend.governEvaluate(request);
  }
  return apiFetch<GovernEvaluateResponse>("POST", "/govern/evaluate", request);
}

export async function observeTrace(request: ObserveTraceRequest): Promise<ObserveTraceResponse> {
  if (USE_MOCK) {
    return mockBackend.observeTrace(request);
  }
  return apiFetch<ObserveTraceResponse>("POST", "/observe/trace", request);
}

export function listCommentThreads(runId: string): CommentThread[] {
  if (USE_MOCK) {
    return mockBackend.listCommentThreads(runId);
  }
  return [];
}

export function listGoldenRubrics(): GoldenRubric[] {
  if (USE_MOCK) {
    return mockBackend.listRubrics();
  }
  return [];
}

export async function computeGoldenScore(
  rubric: GoldenRubric,
  perCriterionScores: GoldenScore["perCriterion"]
): Promise<GoldenScore> {
  const weightById = new Map(rubric.criteria.map((c) => [c.id, c.weight] as const));
  let totalWeight = 0;
  let weighted = 0;
  const normalized = perCriterionScores.map((entry) => {
    const weight = weightById.get(entry.id) ?? 0;
    totalWeight += weight;
    weighted += weight * entry.score;
    return entry;
  });
  const raw = totalWeight > 0 ? weighted / totalWeight : 0;
  const overall = Math.round(raw * 10000) / 100; // scale to 0..100 with two decimals
  return {
    rubric_id: rubric.id,
    perCriterion: normalized,
    overall,
  };
}

export type GoldenScoreEvent = {
  run_id: string;
  rubric: GoldenRubric;
  score: GoldenScore;
};
