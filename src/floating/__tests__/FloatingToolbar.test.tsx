import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FloatingToolbar from "../FloatingToolbar";

describe("FloatingToolbar", () => {
  it("renders OCR and AI Chat buttons", () => {
    render(<FloatingToolbar />);
    expect(screen.getByText("🔍")).toBeInTheDocument();
    expect(screen.getByText("🤖")).toBeInTheDocument();
  });

  it("renders close button", () => {
    render(<FloatingToolbar />);
    expect(screen.getByText("✕")).toBeInTheDocument();
  });

  it("close button has correct title attribute", () => {
    render(<FloatingToolbar />);
    const closeBtn = screen.getByTitle(/Close toolbar/i);
    expect(closeBtn).toBeInTheDocument();
  });

  it("plugin buttons have correct title attributes", () => {
    render(<FloatingToolbar />);
    expect(screen.getByTitle("Open OCR")).toBeInTheDocument();
    expect(screen.getByTitle("Open AI Chat")).toBeInTheDocument();
  });
});
