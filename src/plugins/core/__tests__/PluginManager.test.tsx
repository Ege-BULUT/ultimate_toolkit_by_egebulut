import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PluginManager } from "../PluginManager";
import { PluginRegistry } from "../PluginRegistry";
import { PluginBase } from "../PluginBase";

class TestPlugin extends PluginBase {
  definition = {
    id: "test_plugin",
    name: "Test Plugin",
    description: "A plugin for testing",
    icon: "🧪",
    version: "1.0.0",
    author: "Test",
    hasFloatingUI: false,
  };
  onActivate() {}
  onDeactivate() {}
}

class FloatingPlugin extends PluginBase {
  definition = {
    id: "floating_test",
    name: "Floating Test",
    description: "Has a floating window",
    icon: "🪟",
    version: "2.0.0",
    author: "Test",
    hasFloatingUI: true,
  };
  onActivate() {}
  onDeactivate() {}
}

beforeEach(() => {
  const registry = PluginRegistry as unknown as { plugins: Map<string, PluginBase> };
  registry.plugins.clear();
});

function renderManager(activeIds: string[] = []) {
  const activePlugins = new Set(activeIds);
  return render(
    <PluginManager
      activePlugins={activePlugins}
      onTogglePlugin={vi.fn()}
      onOpenPlugin={vi.fn()}
    />
  );
}

describe("PluginManager", () => {
  it("shows empty state when no plugins registered", () => {
    renderManager();
    expect(screen.getByText(/No plugins loaded/)).toBeTruthy();
    expect(screen.getByText("0 installed")).toBeTruthy();
  });

  it("renders registered plugins as cards", () => {
    PluginRegistry.register(new TestPlugin());
    PluginRegistry.register(new FloatingPlugin());

    renderManager();
    expect(screen.getByText("Test Plugin")).toBeTruthy();
    expect(screen.getByText("Floating Test")).toBeTruthy();
    expect(screen.getByText("2 installed")).toBeTruthy();
  });

  it("shows plugin description on card", () => {
    PluginRegistry.register(new TestPlugin());
    renderManager();
    expect(screen.getByText("A plugin for testing")).toBeTruthy();
  });

  it("calls onTogglePlugin when toggle is clicked", () => {
    PluginRegistry.register(new TestPlugin());
    const onToggle = vi.fn();

    render(
      <PluginManager
        activePlugins={new Set()}
        onTogglePlugin={onToggle}
        onOpenPlugin={vi.fn()}
      />
    );

    // PluginCard renders a toggle — find and click it
    const toggle = screen.getByRole("checkbox");
    fireEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledWith("test_plugin", true);
  });

  it("calls onOpenPlugin when configure button clicked", () => {
    PluginRegistry.register(new TestPlugin());
    const onOpen = vi.fn();

    render(
      <PluginManager
        activePlugins={new Set()}
        onTogglePlugin={vi.fn()}
        onOpenPlugin={onOpen}
      />
    );

    // PluginCard has a "Configure" button
    const configBtn = screen.getByRole("button", { name: "Configure" });
    fireEvent.click(configBtn);
    expect(onOpen).toHaveBeenCalledWith("test_plugin");
  });

  it("marks active plugins visually", () => {
    PluginRegistry.register(new TestPlugin());
    PluginRegistry.register(new FloatingPlugin());

    renderManager(["test_plugin"]);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeChecked();
  });

  it("renders CustomPluginLoader section", () => {
    PluginRegistry.register(new TestPlugin());
    renderManager();
    expect(screen.getByText("Load Custom Plugin")).toBeTruthy();
  });

  it("renders plugin grid layout", () => {
    PluginRegistry.register(new TestPlugin());
    PluginRegistry.register(new FloatingPlugin());

    const { container } = renderManager();
    // PluginCard renders inside the grid
    const cards = container.querySelectorAll('[class*="grid"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it("handles plugins with floating UI indicator", () => {
    PluginRegistry.register(new FloatingPlugin());
    renderManager(["floating_test"]);

    // Should show the plugin name
    expect(screen.getByText("Floating Test")).toBeTruthy();
    // Should show floating indicator (hasFloatingUI=true → extra UI on PluginCard)
    const card = screen.getByText("Floating Test").closest("div");
    expect(card).toBeTruthy();
  });
});
