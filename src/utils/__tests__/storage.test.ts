import { describe, it, expect, beforeEach } from "vitest";
import { getItem, setItem, removeItem } from "../storage";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves a value", () => {
    setItem("test-key", { hello: "world" });
    expect(getItem("test-key", null)).toEqual({ hello: "world" });
  });

  it("returns fallback when key missing", () => {
    expect(getItem("nonexistent", 42)).toBe(42);
  });

  it("removes a key", () => {
    setItem("temp", "value");
    removeItem("temp");
    expect(getItem("temp", null)).toBeNull();
  });

  it("stores primitive values", () => {
    setItem("str", "hello");
    setItem("num", 99);
    setItem("bool", true);
    expect(getItem("str", "")).toBe("hello");
    expect(getItem("num", 0)).toBe(99);
    expect(getItem("bool", false)).toBe(true);
  });

  it("stores arrays and objects", () => {
    const arr = [1, 2, 3];
    const obj = { a: 1, b: { c: 2 } };
    setItem("arr", arr);
    setItem("obj", obj);
    expect(getItem("arr", [])).toEqual([1, 2, 3]);
    expect(getItem("obj", {})).toEqual({ a: 1, b: { c: 2 } });
  });

  it("handles null and undefined fallbacks", () => {
    expect(getItem("missing", undefined)).toBeUndefined();
    expect(getItem("missing", null)).toBeNull();
  });

  it("persists across multiple operations", () => {
    setItem("a", 1);
    setItem("b", 2);
    expect(getItem("a", 0)).toBe(1);
    expect(getItem("b", 0)).toBe(2);
    removeItem("a");
    expect(getItem("a", 0)).toBe(0);
    expect(getItem("b", 0)).toBe(2);
  });

  it("overwrites existing values", () => {
    setItem("key", "old");
    setItem("key", "new");
    expect(getItem("key", "")).toBe("new");
  });
});
