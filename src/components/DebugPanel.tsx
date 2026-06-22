import React from "react";
import { useLogger } from "../hooks/useLogger";

interface DebugPanelProps {
  onClose: () => void;
}

const LOG_COLORS: Record<string, string> = {
  INFO: "var(--color-text-secondary, #a1a1a6)",
  WARN: "#ff9f0a",
  ERROR: "#ff453a",
  DEBUG: "#30d158",
};

export const DebugPanel: React.FC<DebugPanelProps> = ({ onClose }) => {
  const { logs, clear, copyLogs } = useLogger();
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Debug Logs</h3>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={copyLogs} style={styles.btn}>Copy All</button>
            <button onClick={clear} style={styles.btn}>Clear</button>
            <button onClick={onClose} style={{ ...styles.btn, background: "var(--color-accent)", color: "#fff" }}>Close</button>
          </div>
        </div>
        <div style={styles.logArea}>
          {logs.length === 0 && (
            <p style={{ color: "var(--color-text-muted)", fontSize: 12, textAlign: "center", padding: 40 }}>
              No logs yet. Interact with the app to generate log entries.
            </p>
          )}
          {logs.map((log, i) => (
            <div key={i} style={styles.line}>
              <span style={{ color: "var(--color-text-muted)", fontSize: 11, marginRight: 8, fontFamily: "monospace" }}>
                {log.timestamp}
              </span>
              <span style={{ color: LOG_COLORS[log.level] || LOG_COLORS.INFO, fontSize: 11, fontWeight: 600, marginRight: 8, width: 44, display: "inline-block" }}>
                {log.level}
              </span>
              <span style={{ color: "var(--color-text-primary)", fontSize: 12, fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {log.message}
              </span>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  modal: {
    width: "90vw", maxWidth: 900, height: "80vh",
    background: "var(--color-surface, #1c1c1e)",
    borderRadius: 12,
    border: "1px solid var(--color-border, #38383a)",
    display: "flex", flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid var(--color-border, #38383a)",
    flexShrink: 0,
  },
  btn: {
    padding: "6px 14px", borderRadius: 6, border: "1px solid var(--color-border, #38383a)",
    background: "var(--color-surface-alt, #2c2c2e)",
    color: "var(--color-text-primary, #f5f5f7)",
    cursor: "pointer", fontSize: 12, fontWeight: 500,
  },
  logArea: {
    flex: 1, overflow: "auto", padding: 8,
    fontFamily: "monospace", fontSize: 12,
  },
  line: {
    padding: "2px 8px", borderRadius: 4,
    display: "flex", alignItems: "flex-start",
  },
};
