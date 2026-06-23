import React, { useState, useRef } from "react";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  delay?: number;
}

/**
 * Hover tooltip - shows helpful hints on any element.
 * Beginner-friendly: every interactive element should use this.
 */
export const Tooltip: React.FC<TooltipProps> = ({ text, children, delay = 300 }) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none shadow-lg"
          style={{
            background: "var(--color-surface-alt)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
          }}
        >
          {text}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2"
            style={{
              borderLeft: "1px solid var(--color-border)",
              borderBottom: "1px solid var(--color-border)",
              background: "var(--color-surface-alt)",
              transform: "translate(-50%, -50%) rotate(-45deg)",
            }}
          />
        </div>
      )}
    </div>
  );
};
