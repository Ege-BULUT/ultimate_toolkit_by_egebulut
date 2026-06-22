import { useState, useCallback } from "react";
import type { ChatMessage } from "../types";

const STORAGE_PREFIX = "ut-chat-";

export function useConversation(conversationId: string) {
  const storageKey = `${STORAGE_PREFIX}${conversationId}`;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as ChatMessage[];
    } catch {}
    return [];
  });

  const addMessage = useCallback(
    (msg: ChatMessage) => {
      setMessages((prev) => {
        const next = [...prev, msg];
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [storageKey]
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }, [storageKey]);

  return { messages, setMessages, addMessage, clearHistory };
}
