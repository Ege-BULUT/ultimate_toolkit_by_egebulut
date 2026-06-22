import React, { useState } from "react";

export const ExampleConfig: React.FC = () => {
  const [greeting, setGreeting] = useState("Hello");

  return (
    <div style={{ padding: "16px 0" }}>
      <h3>Example Plugin Settings</h3>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginTop: 8 }}>
        Configure your plugin here. This data persists automatically.
      </p>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
          Greeting message
        </label>
        <input
          value={greeting}
          onChange={(e) => setGreeting(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            background: "var(--color-surface-alt)",
            color: "var(--color-text-primary)",
            fontSize: 14,
          }}
        />
      </div>

      <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "var(--color-surface-alt)" }}>
        <strong>Preview:</strong> {greeting}, World!
      </div>
    </div>
  );
};
