import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FloatingToolbar from "../FloatingToolbar";

describe("FloatingToolbar", () => {
  it("renders OCR and AI Chat buttons", () => {
    render(<FloatingToolbar onToggle={vi.fn()} />);

    expect(screen.getByText("🔍")).toBeInTheDocument();
    expect(screen.getByText("🤖")).toBeInTheDocument();
  });

  it("renders close button", () => {
    render(<FloatingToolbar onToggle={vi.fn()} />);

    expect(screen.getByText("✕")).toBeInTheDocument();
  });

  it("calls onToggle with plugin id when button clicked", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(<FloatingToolbar onToggle={onToggle} />);

    await user.click(screen.getByText("🔍"));
    expect(onToggle).toHaveBeenCalledWith("ocr");

    await user.click(screen.getByText("🤖"));
    expect(onToggle).toHaveBeenCalledWith("ai_chat");
  });

  it("close button has correct title attribute", () => {
    render(<FloatingToolbar onToggle={vi.fn()} />);

    const closeBtn = screen.getByTitle(/Close toolbar/i);
    expect(closeBtn).toBeInTheDocument();
  });

  it("plugin buttons have correct title attributes", () => {
    render(<FloatingToolbar onToggle={vi.fn()} />);

    expect(screen.getByTitle("Open OCR")).toBeInTheDocument();
    expect(screen.getByTitle("Open AI Chat")).toBeInTheDocument();
  });
});
