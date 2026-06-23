import React, { useState, useEffect } from "react";

interface SavedData {
  greeting: string;
  count: number;
  notes: string;
}

const STORAGE_KEY = "example-plugin.config";

export const ExampleConfig: React.FC = () => {
  const [data, setData] = useState<SavedData>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as SavedData;
    } catch { /* ignore */ }
    return { greeting: "Hello", count: 0, notes: "" };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const update = (partial: Partial<SavedData>) => setData((prev) => ({ ...prev, ...partial }));

  const handleAction = async () => {
    update({ count: data.count + 1 });
    // Simulate an async operation (like calling a Tauri command)
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <div style={{ padding: "16px 0", fontFamily: "-apple-system, sans-serif" }}>
      <h3 style={{ marginBottom: 4, fontSize: 16, fontWeight: 700 }}>Example Plugin Settings</h3>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 13, marginBottom: 16 }}>
        All data in this panel persists automatically to localStorage.
        Copy this folder to create your own plugin.
      </p>

      {/* Text Input Example */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4, fontWeight: 600, fontSize: 13 }}>Text Input</label>
        <input
          value={data.greeting}
          onChange={(e) => update({ greeting: e.target.value })}
          placeholder="Enter a greeting..."
          style={{
            width: "100%", padding: "8px 12px", borderRadius: 8,
            border: "1px solid var(--color-border)",
            background: "var(--color-surface-alt)",
            color: "var(--color-text-primary)", fontSize: 14,
          }}
        />
      </div>

      {/* Text Output Example */}
      <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: "var(--color-surface-alt)" }}>
        <strong>Output:</strong> {data.greeting}, World! (button clicked {data.count} times)
      </div>

      {/* Textarea Example */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4, fontWeight: 600, fontSize: 13 }}>Notes (Textarea)</label>
        <textarea
          value={data.notes}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="Write some notes..."
          rows={3}
          style={{
            width: "100%", padding: "8px 12px", borderRadius: 8,
            border: "1px solid var(--color-border)",
            background: "var(--color-surface-alt)",
            color: "var(--color-text-primary)", fontSize: 14, resize: "vertical",
          }}
        />
      </div>

      {/* Button with Async Action */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleAction}
          style={{
            padding: "8px 20px", borderRadius: 8, border: "none",
            background: "var(--color-accent)", color: "#fff",
            cursor: "pointer", fontWeight: 600, fontSize: 13,
          }}
        >
          Simulate Action (count: {data.count})
        </button>
        <button
          onClick={() => update({ count: 0, greeting: "Hello", notes: "" })}
          style={{
            padding: "8px 20px", borderRadius: 8,
            border: "1px solid var(--color-border)",
            background: "transparent", color: "var(--color-text-secondary)",
            cursor: "pointer", fontSize: 13,
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};
