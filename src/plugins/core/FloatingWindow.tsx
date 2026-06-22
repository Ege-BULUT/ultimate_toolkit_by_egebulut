import React, { useState, useCallback, useRef, useEffect } from "react";

interface FloatingWindowProps {
  title: string;
  icon: string;
  initialWidth?: number;
  initialHeight?: number;
  children: React.ReactNode;
  onClose: () => void;
}

/**
 * Draggable, resizable floating window frame.
 * Used by plugins that need overlay UI (OCR, AI Chat, etc.)
 */
export const FloatingWindow: React.FC<FloatingWindowProps> = ({
  title,
  icon,
  initialWidth = 420,
  initialHeight = 560,
  children,
  onClose,
}) => {
  const [pos, setPos] = useState({ x: 100, y: 80 });
  const [size, setSize] = useState({ w: initialWidth, h: initialHeight });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, startPos: { x: 0, y: 0 } });
  const resizeRef = useRef({ startX: 0, startY: 0, startSize: { w: 0, h: 0 } });

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, startPos: { ...pos } };
  }, [pos]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(true);
    resizeRef.current = { startX: e.clientX, startY: e.clientY, startSize: { ...size } };
  }, [size]);

  useEffect(() => {
    if (!dragging && !resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        setPos({
          x: Math.max(0, dragRef.current.startPos.x + (e.clientX - dragRef.current.startX)),
          y: Math.max(0, dragRef.current.startPos.y + (e.clientY - dragRef.current.startY)),
        });
      }
      if (resizing) {
        setSize({
          w: Math.max(320, resizeRef.current.startSize.w + (e.clientX - resizeRef.current.startX)),
          h: Math.max(240, resizeRef.current.startSize.h + (e.clientY - resizeRef.current.startY)),
        });
      }
    };

    const handleMouseUp = () => {
      setDragging(false);
      setResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, resizing]);

  return (
    <div
      className="floating-window"
      style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }}
    >
      <div className="floating-window-header" onMouseDown={handleDragStart}>
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/10 dark:hover:bg-white/10 text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          ✕
        </button>
      </div>
      <div className="floating-window-body">{children}</div>
      {/* Resize handle */}
      <div
        onMouseDown={handleResizeStart}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        style={{
          background: `linear-gradient(135deg, transparent 50%, var(--color-text-muted) 50%)`,
        }}
      />
    </div>
  );
};
