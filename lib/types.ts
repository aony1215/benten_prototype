export type VisibleVia = string;

export type Project = {
  id: string;
  name: string;
  effective_scope: { visible_via: VisibleVia[] };
};

export type DataSnapshot = {
  datasets: Record<string, string>; // e.g., "bq://...@commit_xxx"
  as_of: string; // ISO8601
};

export type ContextSnapshot = {
  knowledge_hash: string; // sha256 of concatenated chunks
  included_chunks: string[]; // ["brand_guideline#c3", "promo_brief#c5"]
  citations?: Array<{ uri: string; sha256?: string }>;
  evidence?: Record<string, unknown>;
};

export type DecisionEvent = {
  id: string;
  project_id: string;
  candidates: Array<Record<string, unknown>>;
  chosen_action?: Record<string, unknown> | null;
  rationale?: { top_factors?: string[]; [k: string]: unknown };
};

export type Run = {
  id: string;
  project_id: string;
  playbook_version_id: string;
  decision_event_id?: string;
  mode: "shadow" | "canary" | "prod";
  idempotency_key: string;
  context_snapshot: ContextSnapshot;
  data_snapshot: DataSnapshot;
  outcome?: Record<string, unknown>;
  state:
    | "planned"
    | "validating"
    | "executing"
    | "verifying"
    | "closed"
    | "rolled_back";
};

export type CommentAnchor =
  | { type: "text"; blockId: string; start: number; end: number; textHash: string }
  | { type: "area"; targetId: string; rect: { x: number; y: number; w: number; h: number } };

export type CommentMessage = {
  id: string;
  author: { id: string; name: string };
  body: string;
  created_at: string;
};

export type CommentThread = {
  id: string;
  run_id: string;
  anchor: CommentAnchor;
  status: "open" | "resolved";
  labels?: string[];
  messages: CommentMessage[];
  created_at: string;
  updated_at: string;
};

export type GoldenRubric = {
  id: string;
  name: string;
  criteria: Array<{ id: string; label: string; weight: number; description?: string }>;
};

export type GoldenScore = {
  rubric_id: string;
  perCriterion: Array<{ id: string; score: number; notes?: string }>;
  overall: number; // weighted 0..100
};
