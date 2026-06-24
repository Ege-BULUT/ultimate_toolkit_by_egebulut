import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";

vi.stubGlobal("__TAURI_INTERNALS__", undefined);

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the app shell", () => {
    render(<App />);
    expect(screen.getByText("Ultimate Toolkit")).toBeInTheDocument();
    expect(screen.getAllByText("v1.1.2").length).toBeGreaterThanOrEqual(1);
  });

  it("renders Plugins in sidebar and heading", () => {
    render(<App />);
    const pluginsElements = screen.getAllByText("Plugins");
    expect(pluginsElements.length).toBeGreaterThanOrEqual(2);
  });

  it("renders Settings link", () => {
    render(<App />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("shows OCR and AI Chat in sidebar and plugin cards", () => {
    render(<App />);
    const ocrElements = screen.getAllByText("OCR");
    expect(ocrElements.length).toBe(2);
    const aiChatElements = screen.getAllByText("AI Chat");
    expect(aiChatElements.length).toBe(2);
  });

  it("renders plugin manager with plugin count", () => {
    render(<App />);
    expect(screen.getByText("3 installed")).toBeInTheDocument();
  });
});
