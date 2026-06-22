import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConversation } from "../useConversation";
import type { ChatMessage } from "../../types";

beforeEach(() => {
  localStorage.clear();
});

describe("useConversation", () => {
  it("starts with empty messages", () => {
    const { result } = renderHook(() => useConversation("test"));
    expect(result.current.messages).toEqual([]);
  });

  it("adds a message and persists to localStorage", () => {
    const { result } = renderHook(() => useConversation("test"));
    const msg: ChatMessage = { role: "user", content: "hello" };

    act(() => {
      result.current.addMessage(msg);
    });

    expect(result.current.messages).toEqual([msg]);
    const stored = JSON.parse(localStorage.getItem("ut-chat-test")!);
    expect(stored).toEqual([msg]);
  });

  it("loads existing messages from localStorage on init", () => {
    const msgs: ChatMessage[] = [
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
    ];
    localStorage.setItem("ut-chat-test", JSON.stringify(msgs));

    const { result } = renderHook(() => useConversation("test"));
    expect(result.current.messages).toEqual(msgs);
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem("ut-chat-test", "not-json");
    const { result } = renderHook(() => useConversation("test"));
    expect(result.current.messages).toEqual([]);
  });

  it("clears history and removes from localStorage", () => {
    const msgs: ChatMessage[] = [{ role: "user", content: "hi" }];
    localStorage.setItem("ut-chat-test", JSON.stringify(msgs));

    const { result } = renderHook(() => useConversation("test"));
    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.messages).toEqual([]);
    expect(localStorage.getItem("ut-chat-test")).toBeNull();
  });

  it("supports multiple conversations independently", () => {
    const { result: chat1 } = renderHook(() => useConversation("chat1"));
    const { result: chat2 } = renderHook(() => useConversation("chat2"));

    act(() => {
      chat1.current.addMessage({ role: "user", content: "msg1" });
    });
    act(() => {
      chat2.current.addMessage({ role: "assistant", content: "msg2" });
    });

    expect(chat1.current.messages).toEqual([
      { role: "user", content: "msg1" },
    ]);
    expect(chat2.current.messages).toEqual([
      { role: "assistant", content: "msg2" },
    ]);
  });
});
