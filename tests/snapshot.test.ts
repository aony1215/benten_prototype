import { describe, expect, test } from "bun:test";

import { buildContextSnapshot, buildManualContextSnapshot, chunkManualText } from "../lib/snapshot";

const chunks = [
  { id: "doc#1", content: "Hello world" },
  { id: "doc#2", content: "Another chunk" },
];

describe("snapshot helpers", () => {
  test("buildContextSnapshot hashes concatenated content", async () => {
    const snapshot = await buildContextSnapshot({ chunks });
    expect(snapshot.included_chunks).toEqual(["doc#1", "doc#2"]);
    expect(snapshot.knowledge_hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test("manual context snapshot splits paragraphs", async () => {
    const text = "Para one.\n\nPara two.";
    const manual = await buildManualContextSnapshot(text, "manual");
    expect(manual.included_chunks.length).toBe(2);
    expect(chunkManualText(text).map((chunk) => chunk.content)).toEqual(["Para one.", "Para two."]);
  });
});
