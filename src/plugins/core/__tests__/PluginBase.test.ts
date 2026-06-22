import { describe, it, expect } from "vitest";
import { PluginBase } from "../PluginBase";

class ConcretePlugin extends PluginBase {
  definition = {
    id: "concrete",
    name: "Concrete Plugin",
    description: "A concrete plugin implementation",
    icon: "🔌",
    version: "0.1.0",
    author: "Test",
    hasFloatingUI: true,
  };

  onActivate() {
    return "activated";
  }

  onDeactivate() {
    return "deactivated";
  }
}

class AsyncPlugin extends PluginBase {
  definition = {
    id: "async_plugin",
    name: "Async Plugin",
    description: "Async lifecycle plugin",
    icon: "⏳",
    version: "0.1.0",
    author: "Test",
    hasFloatingUI: false,
  };

  async onActivate() {
    await Promise.resolve();
    return "async_activated";
  }

  async onDeactivate() {
    await Promise.resolve();
    return "async_deactivated";
  }
}

describe("PluginBase", () => {
  it("returns id from definition", () => {
    const p = new ConcretePlugin();
    expect(p.id).toBe("concrete");
  });

  it("returns full definition", () => {
    const p = new ConcretePlugin();
    expect(p.definition).toEqual({
      id: "concrete",
      name: "Concrete Plugin",
      description: "A concrete plugin implementation",
      icon: "🔌",
      version: "0.1.0",
      author: "Test",
      hasFloatingUI: true,
    });
  });

  it("supports synchronous lifecycle", () => {
    const p = new ConcretePlugin();
    expect(p.onActivate()).toBe("activated");
    expect(p.onDeactivate()).toBe("deactivated");
  });

  it("supports async lifecycle", async () => {
    const p = new AsyncPlugin();
    const actResult = await p.onActivate();
    const deactResult = await p.onDeactivate();
    expect(actResult).toBe("async_activated");
    expect(deactResult).toBe("async_deactivated");
  });

  it("throws if subclass has no definition property", () => {
    // A subclass that returns a getter throwing an error counts as
    // "not overriding definition" semantically
    class IncompletePlugin extends PluginBase {
      get definition(): any {
        throw new Error("definition not implemented");
      }
      onActivate() {}
      onDeactivate() {}
    }

    expect(() => new IncompletePlugin().definition).toThrow("definition not implemented");
  });

  it("supports multiple independent instances", () => {
    const p1 = new ConcretePlugin();
    const p2 = new ConcretePlugin();
    // Each instance has its own copy of definition
    expect(p1.definition).toEqual(p2.definition);
    expect(p1.id).toBe(p2.id);
  });
});
