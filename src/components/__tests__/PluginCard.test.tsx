import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PluginCard } from "../PluginCard";

const testPlugin = {
  id: "test_plugin",
  name: "Test Plugin",
  description: "A plugin for testing purposes",
  icon: "🧪",
  version: "1.0.0",
  author: "Tester",
  hasFloatingUI: true,
};

describe("PluginCard", () => {
  it("renders plugin info", () => {
    render(
      <PluginCard
        plugin={testPlugin}
        isActive={false}
        onToggle={vi.fn()}
        onConfigure={vi.fn()}
      />
    );

    expect(screen.getByText("Test Plugin")).toBeInTheDocument();
    expect(screen.getByText(/v1.0.0/)).toBeInTheDocument();
    expect(screen.getByText(/Tester/)).toBeInTheDocument();
    expect(screen.getByText("A plugin for testing purposes")).toBeInTheDocument();
  });

  it("calls onToggle when toggled on", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <PluginCard
        plugin={testPlugin}
        isActive={false}
        onToggle={onToggle}
        onConfigure={vi.fn()}
      />
    );

    const toggle = screen.getByRole("checkbox");
    await user.click(toggle);
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it("calls onToggle when toggled off", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <PluginCard
        plugin={testPlugin}
        isActive={true}
        onToggle={onToggle}
        onConfigure={vi.fn()}
      />
    );

    const toggle = screen.getByRole("checkbox");
    await user.click(toggle);
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it("calls onConfigure when configure button clicked", async () => {
    const onConfigure = vi.fn();
    const user = userEvent.setup();

    render(
      <PluginCard
        plugin={testPlugin}
        isActive={false}
        onToggle={vi.fn()}
        onConfigure={onConfigure}
      />
    );

    await user.click(screen.getByText("Configure"));
    expect(onConfigure).toHaveBeenCalledOnce();
  });

  it("shows floating UI info when plugin has floating UI", () => {
    render(
      <PluginCard
        plugin={testPlugin}
        isActive={true}
        onToggle={vi.fn()}
        onConfigure={vi.fn()}
      />
    );

    expect(screen.getByText("Floating UI active")).toBeInTheDocument();
  });

  it("shows inactive floating UI text when plugin not active", () => {
    render(
      <PluginCard
        plugin={testPlugin}
        isActive={false}
        onToggle={vi.fn()}
        onConfigure={vi.fn()}
      />
    );

    expect(screen.getByText("Activate to use floating")).toBeInTheDocument();
  });

  it("does not show floating section when plugin has no floating UI", () => {
    const nonFloatingPlugin = { ...testPlugin, hasFloatingUI: false };

    render(
      <PluginCard
        plugin={nonFloatingPlugin}
        isActive={false}
        onToggle={vi.fn()}
        onConfigure={vi.fn()}
      />
    );

    expect(screen.queryByText("Floating UI active")).not.toBeInTheDocument();
    expect(screen.queryByText("Activate to use floating")).not.toBeInTheDocument();
  });

  it("renders with lower opacity when inactive", () => {
    const { container } = render(
      <PluginCard
        plugin={testPlugin}
        isActive={false}
        onToggle={vi.fn()}
        onConfigure={vi.fn()}
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.style.opacity).toBe("0.6");
  });

  it("renders with full opacity when active", () => {
    const { container } = render(
      <PluginCard
        plugin={testPlugin}
        isActive={true}
        onToggle={vi.fn()}
        onConfigure={vi.fn()}
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.style.opacity).toBe("1");
  });
});
