import { CommentAnchor } from "./types";

declare global {
  interface Crypto {
    subtle: SubtleCrypto;
  }
}

const TEXT_ENCODER = typeof TextEncoder !== "undefined" ? new TextEncoder() : undefined;

async function browserHash(input: string): Promise<string> {
  if (!TEXT_ENCODER) {
    throw new Error("TextEncoder unavailable");
  }
  const data = TEXT_ENCODER.encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha256(text: string): Promise<string> {
  if (typeof window === "undefined") {
    const { createHash } = await import("crypto");
    return createHash("sha256").update(text).digest("hex");
  }
  return browserHash(text);
}

export function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export async function createTextAnchor(
  blockId: string,
  fullText: string,
  start: number,
  end: number
): Promise<CommentAnchor> {
  if (start > end) {
    [start, end] = [end, start];
  }
  const slice = fullText.slice(start, end);
  const textHash = await sha256(normalizeText(slice));
  return { type: "text", blockId, start, end, textHash };
}

export function createAreaAnchor(
  targetId: string,
  rect: { x: number; y: number; w: number; h: number }
): CommentAnchor {
  return { type: "area", targetId, rect };
}

export function anchorKey(anchor: CommentAnchor): string {
  if (anchor.type === "text") {
    return `${anchor.blockId}:${anchor.start}-${anchor.end}:${anchor.textHash}`;
  }
  const { x, y, w, h } = anchor.rect;
  return `${anchor.targetId}:${x}:${y}:${w}:${h}`;
}

export function anchorsEqual(a: CommentAnchor, b: CommentAnchor): boolean {
  return anchorKey(a) === anchorKey(b);
}

export function serializeAnchor(anchor: CommentAnchor): string {
  return JSON.stringify(anchor);
}

export function deserializeAnchor(serialized: string): CommentAnchor {
  return JSON.parse(serialized) as CommentAnchor;
}
