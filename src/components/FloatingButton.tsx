import React, { useState, useCallback } from "react";
import { Tooltip } from "./Tooltip";

interface FloatingButtonProps {
  icon: string;
  tooltip: string;
  onClick: () => void;
  position?: { x: number; y: number };
}

/**
 * A circular floating action button that appears on screen.
 * Used by plugins like OCR and AI Chat.
 * Draggable — user can reposition it.
 */
export const FloatingButton: React.FC<FloatingButtonProps> = ({
  icon,
  tooltip,
  onClick,
  position: initialPosition,
}) => {
  const [pos, setPos] = useState(
    initialPosition ?? { x: window.innerWidth - 80, y: window.innerHeight / 2 }
  );
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setDragging(true);
      setDragOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    },
    [pos]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 56, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - 56, e.clientY - dragOffset.y)),
      });
    },
    [dragging, dragOffset]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <Tooltip text={tooltip}>
      <div
        className="fixed z-[9998] flex items-center justify-center rounded-full cursor-pointer select-none shadow-floating transition-shadow hover:shadow-lg active:scale-95"
        style={{
          left: pos.x,
          top: pos.y,
          width: 56,
          height: 56,
          background: "var(--color-accent)",
          color: "#fff",
          fontSize: 24,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => {
          if (!dragging) onClick();
        }}
      >
        {icon}
      </div>
    </Tooltip>
  );
};
