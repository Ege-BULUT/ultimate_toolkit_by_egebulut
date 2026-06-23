import React, { useState, useEffect } from "react";

const STORAGE_KEY = "example-plugin.floating";

interface Props {
  onClose: () => void;
}

export const ExampleFloating: React.FC<Props> = ({ onClose }) => {
  const [count, setCount] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "0"); } catch { return 0; }
  });
  const [text, setText] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(count));
  }, [count]);

  return (
    <div style={{ padding: 20, fontFamily: "-apple-system, sans-serif", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1 }}>
        <h3 style={{ marginBottom: 8, fontSize: 15, fontWeight: 700 }}>Floating Window</h3>
        <p style={{ color: "var(--color-text-secondary)", fontSize: 12, marginBottom: 16 }}>
          This window is draggable and resizable. Counter persists to localStorage.
        </p>

        {/* Counter Example */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 8 }}>{count}</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              onClick={() => setCount((c: number) => c - 1)}
              style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-text-primary)", cursor: "pointer" }}
            >
              -1
            </button>
            <button
              onClick={() => setCount((c: number) => c + 1)}
              style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: "var(--color-accent)", color: "#fff", cursor: "pointer", fontWeight: 600 }}
            >
              +1
            </button>
            <button
              onClick={() => setCount(0)}
              style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 12 }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Input/Output Example */}
        <div style={{ marginBottom: 12 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type something..."
            style={{
              width: "100%", padding: "8px 12px", borderRadius: 6,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-alt)",
              color: "var(--color-text-primary)", fontSize: 13,
            }}
          />
        </div>
        {text && (
          <div style={{ padding: 8, borderRadius: 6, background: "var(--color-surface-alt)", fontSize: 13 }}>
            You typed: <strong>{text}</strong>
          </div>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          width: "100%", padding: "8px", borderRadius: 6,
          border: "1px solid var(--color-border)",
          background: "transparent",
          color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 12,
          marginTop: 12,
        }}
      >
        Close Window
      </button>
    </div>
  );
};
