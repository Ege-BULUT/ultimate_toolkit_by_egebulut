import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip } from "../Tooltip";

describe("Tooltip", () => {
  it("renders children", () => {
    render(
      <Tooltip text="help text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("shows tooltip text on hover", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip text="help text">
        <button>Hover me</button>
      </Tooltip>
    );

    // Tooltip should not be visible initially
    expect(screen.queryByText("help text")).not.toBeInTheDocument();

    // Hover over the trigger area
    await user.hover(screen.getByText("Hover me"));

    // Wait for the delay (300ms default) and check
    // The tooltip should eventually appear
    const tooltip = await screen.findByText("help text", {}, { timeout: 1000 });
    expect(tooltip).toBeInTheDocument();
  });

  it("hides tooltip on mouse leave", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip text="help text">
        <button>Hover me</button>
      </Tooltip>
    );

    await user.hover(screen.getByText("Hover me"));
    expect(await screen.findByText("help text", {}, { timeout: 1000 })).toBeInTheDocument();

    await user.unhover(screen.getByText("Hover me"));

    // Allow time for the tooltip to hide
    await vi.waitFor(() => {
      expect(screen.queryByText("help text")).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it("applies custom delay", () => {
    render(
      <Tooltip text="slow tooltip" delay={1000}>
        <button>Slow</button>
      </Tooltip>
    );
    expect(screen.getByText("Slow")).toBeInTheDocument();
  });
});
