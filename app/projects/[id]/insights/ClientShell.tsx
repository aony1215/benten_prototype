"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CommentThread,
  ContextSnapshot,
  DataSnapshot,
  DecisionEvent,
  GoldenRubric,
  GoldenScore,
  Run,
  Project,
} from "@/lib/types";
import {
  createEvaluation,
  createRun,
  createSnapshot,
  decide,
  explain,
  governEvaluate,
  listCommentThreads,
  listGoldenRubrics,
  observeTrace,
} from "@/lib/api";
import { makeKey, windowFromDate } from "@/lib/idempotency";
import { snapshotTicketYaml } from "@/lib/snapshot";

import ContextIntake from "./components/ContextIntake";
import InsightViewer, { InsightBlock } from "./components/InsightViewer";
import CommentLayer from "./components/CommentLayer";
import GoldenScorePanel from "./components/GoldenScorePanel";
import PlaybookPicker from "./components/PlaybookPicker";
import ActionBar from "./components/ActionBar";
import EvidenceDrawer from "./components/EvidenceDrawer";

const PLAYBOOK_ID = "pbk_report_insight_writer";

export type ClientShellProps = {
  project: Project;
  via?: string;
};

type GovernanceState = {
  decision: "allow" | "deny";
  required_approvals: string[];
};

type Toast = { id: string; message: string; tone: "success" | "error" | "info" };

function extractBlocks(run?: Run | null): InsightBlock[] {
  const artifact = run?.outcome?.artifact as { blocks?: InsightBlock[] } | undefined;
  return artifact?.blocks ?? [];
}

function deriveModeLabel(mode: Run["mode"]): string {
  switch (mode) {
    case "shadow":
      return "shadow";
    case "canary":
      return "canary";
    case "prod":
      return "prod";
  }
}

export default function ClientShell({ project, via }: ClientShellProps) {
  const [asOf, setAsOf] = useState<string>(new Date().toISOString().slice(0, 16));
  const [stateId, setStateId] = useState<string | null>(null);
  const [dataSnapshot, setDataSnapshot] = useState<DataSnapshot | null>(null);
  const [contextSnapshot, setContextSnapshot] = useState<ContextSnapshot | null>(null);
  const [decisionEvent, setDecisionEvent] = useState<DecisionEvent | null>(null);
  const [currentRun, setCurrentRun] = useState<Run | null>(null);
  const [mode, setMode] = useState<Run["mode"]>("shadow");
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");
  const [revision, setRevision] = useState<number>(0);
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isEvidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [playbookVersion, setPlaybookVersion] = useState<string>("0.1.0");
  const [governance, setGovernance] = useState<GovernanceState>({ decision: "allow", required_approvals: [] });
  const [isBusy, setIsBusy] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [explainRationale, setExplainRationale] = useState<string | null>(null);
  const rubrics = useMemo(() => listGoldenRubrics(), []);

  const modeLabel = deriveModeLabel(mode);

  useEffect(() => {
    if (currentRun) {
      const restored = listCommentThreads(currentRun.id);
      if (restored.length > 0) {
        setThreads(restored);
      }
    }
  }, [currentRun]);

  const addToast = useCallback((message: string, tone: Toast["tone"] = "info") => {
    setToasts((prev) => [...prev, { id: Math.random().toString(36).slice(2), message, tone }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const handleSnapshotCreate = useCallback(
    async (inputAsOf: string) => {
      setIsBusy(true);
      try {
        const snapshot = await createSnapshot({ project_id: project.id, as_of: inputAsOf });
        setAsOf(inputAsOf);
        setStateId(snapshot.state_id);
        setDataSnapshot(snapshot.data_snapshot);
        addToast("Snapshot created", "success");
      } catch (error) {
        console.error(error);
        addToast("Failed to create snapshot", "error");
      } finally {
        setIsBusy(false);
      }
    },
    [project.id, addToast]
  );

  const handleContextSnapshot = useCallback((snapshot: ContextSnapshot) => {
    setContextSnapshot(snapshot);
  }, []);

  const guardrailsBlocked = governance.decision === "deny" || governance.required_approvals.length > 0;

  const windowKey = useMemo(() => windowFromDate(new Date()), []);

  const computeIdempotencyKey = useCallback(
    (targetMode: Run["mode"], revisionNumber = 0) => {
      const versionKey = `${PLAYBOOK_ID}@${playbookVersion}`;
      const base = makeKey(project.id, versionKey, windowKey, targetMode);
      const canonical =
        targetMode === "canary" ? base.replace(/#canary$/, "#canary10") : base;
      return revisionNumber > 0 ? `${canonical}-rev${revisionNumber}` : canonical;
    },
    [playbookVersion, project.id, windowKey]
  );

  const handleGenerate = useCallback(async () => {
    if (!stateId || !dataSnapshot || !contextSnapshot) {
      addToast("Snapshots required before generating", "error");
      return;
    }
    setIsBusy(true);
    try {
      await observeTrace({
        span: "ui.generate",
        level: "info",
        message: "generate_clicked",
        payload: { project_id: project.id, mode },
      });
      const decision = await decide({
        state_id: stateId,
        playbook_version_id: `${PLAYBOOK_ID}@${playbookVersion}`,
        objective_id: "increase_insight_quality",
        policy_set_id: "default",
      });
      const explanation = await explain(decision.decision_event_id);
      setDecisionEvent({
        id: decision.decision_event_id,
        project_id: project.id,
        candidates: (decision.proposed_action_set.actions as Array<Record<string, unknown>>) ?? [],
        chosen_action: decision.proposed_action_set.actions?.[0] ?? null,
        rationale: {
          detail: explanation.rationale,
          counterfactuals: explanation.counterfactuals,
        },
      });
      const governanceResult = await governEvaluate({
        action_set: decision.proposed_action_set,
        policy_set_id: "default",
      });
      setGovernance(governanceResult);
      const key = computeIdempotencyKey("shadow", 0);
      setIdempotencyKey(key);
      const { run } = await createRun({
        project_id: project.id,
        playbook_version_id: `${PLAYBOOK_ID}@${playbookVersion}`,
        decision_event_id: decision.decision_event_id,
        mode: "shadow",
        idempotency_key: key,
        context_snapshot,
        data_snapshot: dataSnapshot,
      });
      setCurrentRun(run);
      setThreads([]);
      setRevision(0);
      addToast("Insight generated", "success");
    } catch (error) {
      console.error(error);
      addToast("Failed to generate insight", "error");
    } finally {
      setIsBusy(false);
    }
  }, [
    addToast,
    computeIdempotencyKey,
    contextSnapshot,
    dataSnapshot,
    mode,
    playbookVersion,
    project.id,
    setGovernance,
    stateId,
  ]);

  const handleImprove = useCallback(async () => {
    if (!stateId || !dataSnapshot || !contextSnapshot || !currentRun) {
      addToast("Generate insight first", "error");
      return;
    }
    const openThreads = threads.filter((thread) => thread.status === "open");
    if (openThreads.length === 0) {
      addToast("No open comment threads to improve", "info");
      return;
    }
    setIsBusy(true);
    try {
      const summaryNotes = openThreads
        .map((thread) => {
          const latest = thread.messages[thread.messages.length - 1];
          return `- (${thread.labels?.join(", ") || "feedback"}) ${latest.body}`;
        })
        .join("\n");
      await observeTrace({
        span: "ui.improve",
        level: "info",
        message: "improve_with_comments",
        payload: { run_id: currentRun.id, thread_ids: openThreads.map((t) => t.id) },
      });
      const decision = await decide({
        state_id: stateId,
        playbook_version_id: `${PLAYBOOK_ID}@${playbookVersion}`,
        objective_id: "increase_insight_quality",
        policy_set_id: "default",
        candidates: [
          {
            action: "write_insight",
            revision_notes: summaryNotes,
          },
        ],
      });
      const nextRevision = revision + 1;
      const key = computeIdempotencyKey(mode, nextRevision);
      const { run } = await createRun({
        project_id: project.id,
        playbook_version_id: `${PLAYBOOK_ID}@${playbookVersion}`,
        decision_event_id: decision.decision_event_id,
        mode,
        idempotency_key: key,
        context_snapshot,
        data_snapshot: dataSnapshot,
      });
      setRevision(nextRevision);
      setIdempotencyKey(key);
      setCurrentRun(run);
      addToast("Improved insight generated", "success");
    } catch (error) {
      console.error(error);
      addToast("Failed to improve insight", "error");
    } finally {
      setIsBusy(false);
    }
  }, [
    addToast,
    computeIdempotencyKey,
    contextSnapshot,
    currentRun,
    dataSnapshot,
    mode,
    playbookVersion,
    project.id,
    revision,
    stateId,
    threads,
  ]);

  const handlePromote = useCallback(
    async (target: Run["mode"]) => {
      if (!currentRun || !dataSnapshot || !contextSnapshot) {
        addToast("Generate insight before promotion", "error");
        return;
      }
      setIsBusy(true);
      try {
        await observeTrace({
          span: "ui.promote",
          level: "info",
          message: `promote_${target}`,
          payload: { run_id: currentRun.id },
        });
        const governanceResult = await governEvaluate({
          action_set: currentRun.outcome ?? {},
          policy_set_id: "default",
        });
        setGovernance(governanceResult);
        if (governanceResult.decision === "deny") {
          addToast("Promotion denied by guardrails", "error");
          return;
        }
        const key = computeIdempotencyKey(target, 0);
        const { run } = await createRun({
          project_id: project.id,
          playbook_version_id: `${PLAYBOOK_ID}@${playbookVersion}`,
          decision_event_id: currentRun.decision_event_id,
          mode: target,
          idempotency_key: key,
          context_snapshot,
          data_snapshot: dataSnapshot,
        });
        setMode(target);
        setIdempotencyKey(key);
        setCurrentRun(run);
        addToast(`Promoted to ${deriveModeLabel(target)}`, "success");
      } catch (error) {
        console.error(error);
        addToast("Promotion failed", "error");
      } finally {
        setIsBusy(false);
      }
    },
    [
      addToast,
      computeIdempotencyKey,
      contextSnapshot,
      currentRun,
      dataSnapshot,
      playbookVersion,
      project.id,
    ]
  );

  const handleThreadsChange = useCallback(
    async (updated: CommentThread[]) => {
      setThreads(updated);
      if (!currentRun) return;
      await observeTrace({
        span: "ui.comment",
        level: "info",
        message: "comment_threads upsert",
        payload: { type: "comment_threads", run_id: currentRun.id, threads: updated },
      });
    },
    [currentRun]
  );

  const handleGoldenScore = useCallback(
    async (event: { rubric: GoldenRubric; score: GoldenScore }) => {
      if (!currentRun) {
        addToast("Run required before scoring", "error");
        return;
      }
      await observeTrace({
        span: "ui.score",
        level: "info",
        message: "golden_score_recorded",
        payload: {
          run_id: currentRun.id,
          rubric_id: event.rubric.id,
          overall: event.score.overall,
        },
      });
      await createEvaluation({
        run_id: currentRun.id,
        method: "AB",
        metric: "GoldenCompositeScore",
        effect: event.score.overall / 100 - 0.5,
        horizon: "instant",
        inputs: { rubric: event.rubric, perCriterion: event.score.perCriterion },
      });
      addToast("Golden score recorded", "success");
    },
    [addToast, currentRun]
  );

  const handleExplain = useCallback(async () => {
    if (!decisionEvent) return;
    const rationale = await explain(decisionEvent.id);
    setExplainRationale(rationale.rationale);
  }, [decisionEvent]);

  const blocks = useMemo(() => extractBlocks(currentRun ?? undefined), [currentRun]);

  const guardrailStatus = useMemo(() => {
    if (governance.decision === "deny") {
      return "Guardrails denied execution";
    }
    if (governance.required_approvals.length > 0) {
      return `Approvals required: ${governance.required_approvals.join(", ")}`;
    }
    return "All guardrails passed";
  }, [governance]);

  const allowPromotion = governance.decision === "allow" && governance.required_approvals.length === 0;

  const ticketYaml = useMemo(() => {
    if (!currentRun) return "";
    return snapshotTicketYaml({
      project_id: project.id,
      playbook_version_id: `${PLAYBOOK_ID}@${playbookVersion}`,
      idempotency_key: currentRun.idempotency_key,
      run_id: currentRun.id,
      context_snapshot: currentRun.context_snapshot,
      data_snapshot: currentRun.data_snapshot,
    });
  }, [currentRun, playbookVersion, project.id]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Project</p>
            <h1 className="text-xl font-semibold text-slate-900">{project.name}</h1>
            <p className="mt-1 text-xs text-slate-500">
              Canonical URL: /projects/{project.id}
              {via ? ` · via ${via}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {project.effective_scope.visible_via.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            Mode: <span className="font-medium text-slate-900">{modeLabel}</span>
            <br />
            Guardrails: {guardrailStatus}
            {decisionEvent && (
              <button
                onClick={handleExplain}
                className="ml-3 inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-xs"
              >
                Explain
              </button>
            )}
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden bg-slate-50">
        <aside className="w-[320px] min-w-[320px] border-r border-slate-200 bg-white">
          <ContextIntake
            project={project}
            asOf={asOf}
            stateId={stateId}
            dataSnapshot={dataSnapshot}
            contextSnapshot={contextSnapshot}
            onCreateSnapshot={handleSnapshotCreate}
            onContextSnapshotChange={handleContextSnapshot}
            disabled={isBusy}
          />
        </aside>
        <main className="relative flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
            <PlaybookPicker
              playbookId={PLAYBOOK_ID}
              version={playbookVersion}
              onVersionChange={setPlaybookVersion}
            />
            <button
              onClick={() => setEvidenceDrawerOpen((v) => !v)}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
              aria-expanded={isEvidenceDrawerOpen}
            >
              Evidence Drawer
            </button>
          </div>
          <div className="flex flex-1 overflow-hidden">
            <div className="relative flex-1 overflow-y-auto bg-white" id="insight-viewer-container">
              <InsightViewer run={currentRun ?? undefined} blocks={blocks} />
              <CommentLayer
                runId={currentRun?.id ?? null}
                blocks={blocks}
                threads={threads}
                selectedThreadId={selectedThreadId}
                onThreadsChange={handleThreadsChange}
                onSelectThread={setSelectedThreadId}
              />
            </div>
            <GoldenScorePanel
              rubrics={rubrics}
              onScore={handleGoldenScore}
              currentRun={currentRun ?? undefined}
            />
          </div>
        </main>
      </div>
      <ActionBar
        mode={mode}
        idempotencyKey={idempotencyKey}
        canGenerate={Boolean(stateId && dataSnapshot && contextSnapshot)}
        onGenerate={handleGenerate}
        onImprove={handleImprove}
        onPromote={handlePromote}
        busy={isBusy}
        guardrailsBlocked={guardrailsBlocked}
        approvals={governance.required_approvals}
      />
      <EvidenceDrawer
        open={isEvidenceDrawerOpen}
        onClose={() => setEvidenceDrawerOpen(false)}
        run={currentRun ?? undefined}
        ticketYaml={ticketYaml}
      />
      {explainRationale && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Decision rationale</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm text-slate-600">{explainRationale}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="rounded-md border border-slate-300 px-3 py-1 text-sm"
                onClick={() => setExplainRationale(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`rounded-md px-3 py-2 text-sm text-white shadow-lg ${
              toast.tone === "success"
                ? "bg-emerald-600"
                : toast.tone === "error"
                ? "bg-rose-600"
                : "bg-slate-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <span>{toast.message}</span>
              <button
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-xs text-white/80"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
