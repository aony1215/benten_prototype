import { describe, expect, test } from "bun:test";

import { makeKey, windowFromDate } from "../lib/idempotency";

describe("idempotency", () => {
  test("windowFromDate uses ISO week numbering", () => {
    const date = new Date("2024-12-31T12:00:00Z");
    const window = windowFromDate(date);
    expect(window).toBe("202501");
  });

  test("makeKey composes canonical id", () => {
    const key = makeKey("proj-1", "pbk@0.1.0", "202452", "shadow");
    expect(key).toBe("proj-1#pbk@0.1.0#202452#shadow");
  });
});
