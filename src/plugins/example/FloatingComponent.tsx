import React, { useState } from "react";

interface Props {
  onClose: () => void;
}

export const ExampleFloating: React.FC<Props> = ({ onClose }) => {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: 24 }}>
      <h3 style={{ marginBottom: 12 }}>Floating Window</h3>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 16 }}>
        Your plugin can show any React content here.
      </p>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 8 }}>{count}</div>
        <button
          onClick={() => setCount((c) => c + 1)}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            background: "var(--color-accent)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Increment
        </button>
      </div>

      <button
        onClick={onClose}
        style={{
          display: "block",
          width: "100%",
          padding: "8px",
          borderRadius: 8,
          border: "1px solid var(--color-border)",
          background: "transparent",
          color: "var(--color-text-secondary)",
          cursor: "pointer",
          fontSize: 13,
        }}
      >
        Close
      </button>
    </div>
  );
};
