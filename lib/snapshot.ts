import { ContextSnapshot, DataSnapshot } from "./types";
import { normalizeText, sha256 } from "./anchors";

export type KnowledgeChunkInput = {
  id: string;
  content: string;
  citation?: { uri: string; sha256?: string };
};

export type BuildContextSnapshotInput = {
  chunks: KnowledgeChunkInput[];
  citations?: Array<{ uri: string; sha256?: string }>;
  evidence?: Record<string, unknown>;
};

export async function buildContextSnapshot({
  chunks,
  citations,
  evidence,
}: BuildContextSnapshotInput): Promise<ContextSnapshot> {
  const normalized = chunks.map((chunk) => normalizeText(chunk.content));
  const hash = await sha256(normalized.join("\n"));
  const includedChunks = chunks.map((chunk) => chunk.id);
  const dedupedCitations = citations ?? chunks.flatMap((chunk) => (chunk.citation ? [chunk.citation] : []));
  return {
    knowledge_hash: hash,
    included_chunks: includedChunks,
    citations: dedupedCitations.length > 0 ? dedupedCitations : undefined,
    evidence: evidence && Object.keys(evidence).length > 0 ? evidence : undefined,
  };
}

export function chunkManualText(text: string, baseId = "manual"): KnowledgeChunkInput[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paragraphs.map((content, index) => ({
    id: `${baseId}#p${index}`,
    content,
  }));
}

export async function buildManualContextSnapshot(text: string, baseId = "manual"): Promise<ContextSnapshot> {
  const chunks = chunkManualText(text, baseId);
  return buildContextSnapshot({ chunks });
}

export function buildDataSnapshot(asOf: string, datasets: Record<string, string>): DataSnapshot {
  return { as_of: asOf, datasets };
}

export type TicketMetadata = {
  project_id: string;
  playbook_version_id: string;
  idempotency_key: string;
  run_id?: string;
  context_snapshot: ContextSnapshot;
  data_snapshot: DataSnapshot;
};

export function snapshotTicketYaml(meta: TicketMetadata): string {
  const lines: string[] = [];
  lines.push(`project: ${meta.project_id}`);
  lines.push(`playbook_version: ${meta.playbook_version_id}`);
  lines.push(`idempotency_key: ${meta.idempotency_key}`);
  if (meta.run_id) {
    lines.push(`run_id: ${meta.run_id}`);
  }
  lines.push("context_snapshot:");
  lines.push(`  knowledge_hash: ${meta.context_snapshot.knowledge_hash}`);
  lines.push(`  included_chunks:`);
  meta.context_snapshot.included_chunks.forEach((chunk) => {
    lines.push(`    - ${chunk}`);
  });
  if (meta.context_snapshot.citations && meta.context_snapshot.citations.length > 0) {
    lines.push(`  citations:`);
    meta.context_snapshot.citations.forEach((citation) => {
      lines.push(`    - uri: ${citation.uri}`);
      if (citation.sha256) {
        lines.push(`      sha256: ${citation.sha256}`);
      }
    });
  }
  lines.push("data_snapshot:");
  lines.push(`  as_of: ${meta.data_snapshot.as_of}`);
  lines.push(`  datasets:`);
  Object.entries(meta.data_snapshot.datasets).forEach(([name, uri]) => {
    lines.push(`    ${name}: ${uri}`);
  });
  return lines.join("\n");
}
