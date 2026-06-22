import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FloatingButton } from "../FloatingButton";

describe("FloatingButton", () => {
  it("renders with icon and tooltip", () => {
    render(
      <FloatingButton icon="🔍" tooltip="Open OCR" onClick={vi.fn()} />
    );

    expect(screen.getByText("🔍")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <FloatingButton icon="🔍" tooltip="Open OCR" onClick={onClick} />
    );

    await user.click(screen.getByText("🔍"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("accepts custom position", () => {
    render(
      <FloatingButton
        icon="🤖"
        tooltip="AI Chat"
        onClick={vi.fn()}
        position={{ x: 200, y: 300 }}
      />
    );

    const button = screen.getByText("🤖").closest("div")?.parentElement;
    // The outermost div is the tooltip wrapper with relative position
    // The actual floating button div is the inner one with fixed positioning
    const floatingDiv = button?.querySelector(".fixed");
    expect(floatingDiv).toBeInTheDocument();
  });

  it("renders as a circular 56x56 button", () => {
    render(
      <FloatingButton icon="🔍" tooltip="Test" onClick={vi.fn()} />
    );

    const icon = screen.getByText("🔍");
    const floatingDiv = icon.closest("[class*='fixed']") as HTMLElement;
    expect(floatingDiv).toBeInTheDocument();

    // The raw style has width: 56 and height: 56
    const computed = floatingDiv?.style || {};
    expect(computed.width).toBe("56px");
    expect(computed.height).toBe("56px");
  });
});
