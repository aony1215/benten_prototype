import { describe, expect, test } from "bun:test";

import { createTextAnchor, normalizeText, sha256 } from "../lib/anchors";

describe("anchors", () => {
  test("normalizeText collapses whitespace", () => {
    expect(normalizeText("Hello   world\n")).toBe("Hello world");
  });

  test("createTextAnchor hashes selection", async () => {
    const anchor = await createTextAnchor("block-1", "Hello amazing world", 6, 13);
    expect(anchor.type).toBe("text");
    expect(anchor.start).toBe(6);
    expect(anchor.end).toBe(13);
    expect(anchor.textHash).toMatch(/^[a-f0-9]{64}$/);
  });

  test("sha256 stable across environments", async () => {
    const digest = await sha256("hello");
    expect(digest).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });
});
