import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FloatingWindow } from "../FloatingWindow";

describe("FloatingWindow", () => {
  it("renders with title and icon", () => {
    render(
      <FloatingWindow title="Test Window" icon="🧪" onClose={vi.fn()}>
        <p>Content</p>
      </FloatingWindow>
    );

    expect(screen.getByText("Test Window")).toBeInTheDocument();
    expect(screen.getByText("🧪")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders close button", () => {
    render(
      <FloatingWindow title="Test" icon="🧪" onClose={vi.fn()}>
        <p>Content</p>
      </FloatingWindow>
    );

    expect(screen.getByText("✕")).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();

    render(
      <FloatingWindow title="Test" icon="🧪" onClose={onClose}>
        <p>Content</p>
      </FloatingWindow>
    );

    fireEvent.click(screen.getByText("✕"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("accepts custom initial dimensions", () => {
    const { container } = render(
      <FloatingWindow title="Test" icon="🧪" onClose={vi.fn()} initialWidth={500} initialHeight={400}>
        <p>Content</p>
      </FloatingWindow>
    );

    const window = container.firstChild as HTMLElement;
    expect(window.style.width).toBe("500px");
    expect(window.style.height).toBe("400px");
  });

  it("renders resize handle", () => {
    const { container } = render(
      <FloatingWindow title="Test" icon="🧪" onClose={vi.fn()}>
        <p>Content</p>
      </FloatingWindow>
    );

    const handle = container.querySelector("[class*='cursor-se-resize']");
    expect(handle).toBeInTheDocument();
  });

  it("renders children in body area", () => {
    render(
      <FloatingWindow title="Test" icon="🧪" onClose={vi.fn()}>
        <div data-testid="child">Hello</div>
      </FloatingWindow>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
