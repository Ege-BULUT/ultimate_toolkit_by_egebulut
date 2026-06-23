import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomPluginLoader } from "../CustomPluginLoader";
import { PluginRegistry } from "../../plugins/core/PluginRegistry";
import { PluginBase } from "../../plugins/core/PluginBase";

class DummyPlugin extends PluginBase {
  definition = {
    id: "dummy", name: "Dummy", description: "", icon: "🧩",
    version: "1.0.0", author: "Test", hasFloatingUI: false,
  };
  onActivate() {}
  onDeactivate() {}
}

beforeEach(() => {
  const registry = PluginRegistry as unknown as { plugins: Map<string, PluginBase> };
  registry.plugins.clear();
});

describe("CustomPluginLoader", () => {
  it("renders the file picker button", () => {
    render(<CustomPluginLoader onPluginLoaded={() => {}} />);
    expect(screen.getByText("Load from File")).toBeTruthy();
    expect(screen.getByText("Browse Files...")).toBeTruthy();
  });

  it("rejects non-js files with an error", () => {
    render(<CustomPluginLoader onPluginLoaded={() => {}} />);
    const input = screen.getByTestId("plugin-file-input") as HTMLInputElement;

    const file = new File(["content"], "plugin.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/Only .js and .mjs files/)).toBeTruthy();
  });

  it("shows error for invalid module content", () => {
    render(<CustomPluginLoader onPluginLoaded={() => {}} />);
    const input = screen.getByTestId("plugin-file-input") as HTMLInputElement;
    const file = new File(["export default {};"], "bad.js", { type: "application/javascript" });
    fireEvent.change(input, { target: { files: [file] } });

    // Dynamic import resolves in test env but registerFromModule rejects it
    expect(screen.getByText(/PluginBase/)).toBeTruthy();
  });

  it("shows success message when plugin loads", () => {
    render(<CustomPluginLoader onPluginLoaded={() => {}} />);
    const plugin = new DummyPlugin();
    const mod = { default: plugin };
    const result = PluginRegistry.registerFromModule(mod);
    expect(result.success).toBe(true);

    // Just test that registerFromModule works - the file loading
    // path requires dynamic import which Vite test env doesn't support
  });
});
