"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CommentAnchor, CommentThread } from "@/lib/types";
import { createAreaAnchor, createTextAnchor, serializeAnchor } from "@/lib/anchors";

import "@/styles/comment-layer.css";

type CommentLayerProps = {
  runId: string | null;
  blocks: Array<{ id: string; type: string }>;
  threads: CommentThread[];
  selectedThreadId: string | null;
  onThreadsChange: (threads: CommentThread[]) => void;
  onSelectThread: (threadId: string | null) => void;
};

type BubbleState = {
  anchor: CommentAnchor;
  position: { x: number; y: number };
  selectionText: string;
  existingThreadId?: string;
};

type ThreadFilter = "open" | "resolved" | "mine";

const CURRENT_USER = { id: "user-analyst", name: "Analyst" };

export default function CommentLayer({
  runId,
  blocks,
  threads,
  selectedThreadId,
  onThreadsChange,
  onSelectThread,
}: CommentLayerProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [bubble, setBubble] = useState<BubbleState | null>(null);
  const [replyDraft, setReplyDraft] = useState<string>("");
  const [newThreadDraft, setNewThreadDraft] = useState<string>("");
  const [filter, setFilter] = useState<ThreadFilter>("open");
  const [pinPositions, setPinPositions] = useState<Map<string, { top: number; left: number }>>(new Map());

  const filteredThreads = useMemo(() => {
    switch (filter) {
      case "open":
        return threads.filter((thread) => thread.status === "open");
      case "resolved":
        return threads.filter((thread) => thread.status === "resolved");
      case "mine":
        return threads.filter((thread) => thread.messages.some((msg) => msg.author.id === CURRENT_USER.id));
      default:
        return threads;
    }
  }, [filter, threads]);

  const recalcPins = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const baseRect = container.getBoundingClientRect();
    const next = new Map<string, { top: number; left: number }>();
    threads.forEach((thread) => {
      if (thread.anchor.type === "text") {
        const blockElement = container.querySelector<HTMLElement>(
          `[data-block-id="${thread.anchor.blockId}"]`
        );
        if (!blockElement) return;
        const rect = blockElement.getBoundingClientRect();
        next.set(thread.id, {
          top: rect.top - baseRect.top + container.scrollTop + 4,
          left: rect.right - baseRect.left + container.scrollLeft - 12,
        });
      } else {
        const targetElement = container.querySelector<HTMLElement>(
          `[data-target-id="${thread.anchor.targetId}"]`
        );
        if (!targetElement) return;
        const rect = targetElement.getBoundingClientRect();
        next.set(thread.id, {
          top: rect.top - baseRect.top + container.scrollTop + rect.height / 2,
          left: rect.left - baseRect.left + container.scrollLeft + rect.width - 12,
        });
      }
    });
    setPinPositions(next);
  }, [threads]);

  useEffect(() => {
    containerRef.current = document.getElementById("insight-viewer-container") as HTMLElement | null;
    recalcPins();
    const handleResize = () => recalcPins();
    window.addEventListener("resize", handleResize);
    const container = containerRef.current;
    container?.addEventListener("scroll", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      container?.removeEventListener("scroll", handleResize);
    };
  }, [recalcPins]);

  useEffect(() => {
    recalcPins();
  }, [threads, blocks, recalcPins]);

  const handleSelection = useCallback(
    (event: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (range.collapsed) {
        setBubble(null);
        return;
      }
      if (!container.contains(range.commonAncestorContainer)) {
        setBubble(null);
        return;
      }
      const blockElement = (range.startContainer as HTMLElement | null)?.closest?.("[data-block-id]") ??
        (range.commonAncestorContainer as HTMLElement | null)?.closest?.("[data-block-id]");
      if (!blockElement) {
        setBubble(null);
        return;
      }
      const blockId = blockElement.getAttribute("data-block-id");
      if (!blockId) return;
      const blockText = blockElement.textContent ?? "";
      const preRange = range.cloneRange();
      preRange.selectNodeContents(blockElement);
      preRange.setEnd(range.startContainer, range.startOffset);
      const start = preRange.toString().length;
      const selectedText = range.toString();
      const end = start + selectedText.length;
      createTextAnchor(blockId, blockText, start, end).then((anchor) => {
        const rect = range.getBoundingClientRect();
        setBubble({
          anchor,
          position: { x: rect.left + rect.width / 2 + window.scrollX, y: rect.top + window.scrollY - 12 },
          selectionText: selectedText,
        });
        setNewThreadDraft(selectedText.trim());
      });
    },
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("mouseup", handleSelection);
    return () => {
      container.removeEventListener("mouseup", handleSelection);
    };
  }, [handleSelection]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const chart = target.closest<HTMLElement>("[data-target-id]");
      if (!chart || window.getSelection()?.toString()) return;
      const targetId = chart.getAttribute("data-target-id");
      if (!targetId) return;
      const containerRect = container.getBoundingClientRect();
      const rect = chart.getBoundingClientRect();
      const anchor = createAreaAnchor(targetId, {
        x: rect.left - containerRect.left + container.scrollLeft,
        y: rect.top - containerRect.top + container.scrollTop,
        w: rect.width,
        h: rect.height,
      });
      setBubble({
        anchor,
        position: { x: rect.left + rect.width / 2 + window.scrollX, y: rect.top + window.scrollY - 12 },
        selectionText: chart.textContent ?? "",
      });
      setNewThreadDraft(chart.textContent?.trim() ?? "");
    };
    container.addEventListener("click", handleClick);
    return () => {
      container.removeEventListener("click", handleClick);
    };
  }, []);

  const handleThreadCreate = async (body: string, labels?: string[]) => {
    if (!bubble) return;
    const now = new Date().toISOString();
    const newThread: CommentThread = {
      id: `thread-${Math.random().toString(36).slice(2, 8)}`,
      run_id: runId ?? "pending",
      anchor: bubble.anchor,
      status: "open",
      labels,
      messages: [
        {
          id: `msg-${Math.random().toString(36).slice(2, 8)}`,
          author: CURRENT_USER,
          body,
          created_at: now,
        },
      ],
      created_at: now,
      updated_at: now,
    };
    onThreadsChange([...threads, newThread]);
    onSelectThread(newThread.id);
    setBubble(null);
    setNewThreadDraft("");
  };

  const handleReplySubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!replyDraft.trim() || !selectedThreadId) return;
    const now = new Date().toISOString();
    const updated = threads.map((thread) => {
      if (thread.id !== selectedThreadId) return thread;
      const next = {
        ...thread,
        messages: [
          ...thread.messages,
          {
            id: `msg-${Math.random().toString(36).slice(2, 8)}`,
            author: CURRENT_USER,
            body: replyDraft,
            created_at: now,
          },
        ],
        updated_at: now,
      };
      return next;
    });
    setReplyDraft("");
    onThreadsChange(updated);
  };

  const handleResolveToggle = (threadId: string) => {
    const updated = threads.map((thread) =>
      thread.id === threadId
        ? {
            ...thread,
            status: thread.status === "open" ? "resolved" : "open",
            updated_at: new Date().toISOString(),
          }
        : thread
    );
    onThreadsChange(updated);
  };

  const handleCopyAnchor = async (anchor: CommentAnchor) => {
    try {
      await navigator.clipboard.writeText(serializeAnchor(anchor));
    } catch (error) {
      console.error("copy failed", error);
    }
  };

  const handleSelectThread = (threadId: string) => {
    onSelectThread(threadId);
    const container = containerRef.current;
    if (!container) return;
    const thread = threads.find((item) => item.id === threadId);
    if (!thread) return;
    if (thread.anchor.type === "text") {
      const el = container.querySelector<HTMLElement>(`[data-block-id="${thread.anchor.blockId}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      const el = container.querySelector<HTMLElement>(`[data-target-id="${thread.anchor.targetId}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  useEffect(() => {
    if (!selectedThreadId) return;
    const thread = threads.find((t) => t.id === selectedThreadId);
    if (!thread) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = (() => {
      if (thread.anchor.type === "text") {
        const block = container.querySelector<HTMLElement>(`[data-block-id="${thread.anchor.blockId}"]`);
        return block?.getBoundingClientRect();
      }
      const target = container.querySelector<HTMLElement>(`[data-target-id="${thread.anchor.targetId}"]`);
      return target?.getBoundingClientRect();
    })();
    if (!rect) return;
    setBubble({
      anchor: thread.anchor,
      existingThreadId: thread.id,
      position: { x: rect.left + rect.width / 2 + window.scrollX, y: rect.top + window.scrollY - 12 },
      selectionText: "",
    });
  }, [selectedThreadId, threads]);

  return (
    <div className="pointer-events-none absolute inset-0 flex">
      <div className="comment-layer flex-1" aria-hidden="true">
        {Array.from(pinPositions.entries()).map(([threadId, position], index) => {
          const thread = threads.find((t) => t.id === threadId);
          const resolved = thread?.status === "resolved";
          return (
            <button
              key={threadId}
              type="button"
              className="comment-pin"
              style={{ top: position.top, left: position.left }}
              onClick={() => handleSelectThread(threadId)}
              aria-label={`Comment thread ${index + 1}`}
            >
              {resolved ? "✓" : index + 1}
            </button>
          );
        })}
        {bubble && (
          <div
            className="comment-bubble"
            style={{ top: bubble.position.y, left: bubble.position.x }}
            role="dialog"
            aria-label="Comment actions"
          >
            {bubble.existingThreadId ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white"
                    onClick={() => handleResolveToggle(bubble.existingThreadId!)}
                  >
                    {threads.find((t) => t.id === bubble.existingThreadId)?.status === "open"
                      ? "Mark resolved"
                      : "Reopen"}
                  </button>
                  <button
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                    onClick={() => handleCopyAnchor(bubble.anchor)}
                  >
                    Copy anchor
                  </button>
                </div>
                <form className="space-y-2" onSubmit={handleReplySubmit}>
                  <textarea
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                    rows={3}
                    placeholder="Add a reply"
                    value={replyDraft}
                    onChange={(event) => setReplyDraft(event.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <button type="submit" className="rounded-md bg-slate-900 px-3 py-1 text-xs text-white">
                      Reply
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-slate-600">
                <label className="text-xs text-slate-500" htmlFor="new-thread-message">
                  Selected
                </label>
                <p className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">
                  {bubble.selectionText.slice(0, 140) || "(no text)"}
                </p>
                <textarea
                  id="new-thread-message"
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                  rows={3}
                  placeholder="Provide feedback"
                  value={newThreadDraft}
                  onChange={(event) => setNewThreadDraft(event.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white"
                    onClick={() => newThreadDraft.trim() && handleThreadCreate(newThreadDraft.trim())}
                    disabled={!newThreadDraft.trim()}
                  >
                    Comment
                  </button>
                  <button
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                    onClick={() =>
                      newThreadDraft.trim() && handleThreadCreate(newThreadDraft.trim(), ["improve"])
                    }
                    disabled={!newThreadDraft.trim()}
                  >
                    Ask to Improve
                  </button>
                  <button
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                    onClick={() => handleCopyAnchor(bubble.anchor)}
                  >
                    Copy anchor
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <aside className="comment-thread-panel pointer-events-auto" aria-label="Comment threads">
        <div className="comment-filter">
          {["open", "resolved", "mine"].map((option) => (
            <button
              key={option}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs"
              aria-pressed={filter === option}
              onClick={() => setFilter(option as ThreadFilter)}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="comment-thread-list" role="listbox" aria-label="Comment thread list">
          {filteredThreads.map((thread) => (
            <div
              key={thread.id}
              role="option"
              className="comment-thread-item"
              aria-selected={thread.id === selectedThreadId}
            >
              <button
                className="text-left text-sm font-semibold text-slate-700"
                onClick={() => handleSelectThread(thread.id)}
              >
                Thread {thread.id.slice(-4)}
              </button>
              <p className="mt-1 text-xs text-slate-500">
                {thread.status === "open" ? "Open" : "Resolved"}
                {thread.labels?.length ? ` · ${thread.labels.join(", ")}` : ""}
              </p>
              <ul className="mt-2 space-y-2 text-xs text-slate-600">
                {thread.messages.map((message) => (
                  <li key={message.id} className="rounded-md bg-slate-100 px-2 py-1">
                    <span className="font-medium text-slate-700">{message.author.name}</span>
                    <span className="ml-1 text-slate-500">{new Date(message.created_at).toLocaleString()}</span>
                    <p className="text-slate-700">{message.body}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex gap-2">
                <button
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                  onClick={() => handleResolveToggle(thread.id)}
                >
                  {thread.status === "open" ? "Mark resolved" : "Reopen"}
                </button>
                <button
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                  onClick={() => handleCopyAnchor(thread.anchor)}
                >
                  Copy anchor
                </button>
              </div>
            </div>
          ))}
          {filteredThreads.length === 0 && (
            <p className="px-2 text-xs text-slate-500">No threads in this filter.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
