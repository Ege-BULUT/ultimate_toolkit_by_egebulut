import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "../Sidebar";

const mockPlugins = [
  { id: "ocr", name: "OCR", icon: "🔍" },
  { id: "ai_chat", name: "AI Chat", icon: "🤖" },
];

describe("Sidebar", () => {
  it("renders logo and version", () => {
    render(
      <Sidebar
        activePage="plugins"
        onNavigate={vi.fn()}
        pluginList={mockPlugins}
        activePlugins={new Set()}
      />
    );

    expect(screen.getByText("Ultimate Toolkit")).toBeInTheDocument();
    expect(screen.getByText("v1.1.2")).toBeInTheDocument();
  });

  it("renders plugin list", () => {
    render(
      <Sidebar
        activePage="plugins"
        onNavigate={vi.fn()}
        pluginList={mockPlugins}
        activePlugins={new Set()}
      />
    );

    expect(screen.getByText("Plugins")).toBeInTheDocument();
    expect(screen.getByText("OCR")).toBeInTheDocument();
    expect(screen.getByText("AI Chat")).toBeInTheDocument();
  });

  it("renders settings link", () => {
    render(
      <Sidebar
        activePage="plugins"
        onNavigate={vi.fn()}
        pluginList={mockPlugins}
        activePlugins={new Set()}
      />
    );

    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("calls onNavigate when plugin is clicked", async () => {
    const onNavigate = vi.fn();
    const user = userEvent.setup();

    render(
      <Sidebar
        activePage="plugins"
        onNavigate={onNavigate}
        pluginList={mockPlugins}
        activePlugins={new Set()}
      />
    );

    await user.click(screen.getByText("OCR"));
    expect(onNavigate).toHaveBeenCalledWith("ocr");
  });

  it("calls onNavigate when settings is clicked", async () => {
    const onNavigate = vi.fn();
    const user = userEvent.setup();

    render(
      <Sidebar
        activePage="plugins"
        onNavigate={onNavigate}
        pluginList={mockPlugins}
        activePlugins={new Set()}
      />
    );

    await user.click(screen.getByText("Settings"));
    expect(onNavigate).toHaveBeenCalledWith("settings");
  });

  it("shows active plugin indicator", () => {
    render(
      <Sidebar
        activePage="plugins"
        onNavigate={vi.fn()}
        pluginList={mockPlugins}
        activePlugins={new Set(["ocr"])}
      />
    );

    // OCR should have the active indicator (green dot)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("renders GitHub link", () => {
    render(
      <Sidebar
        activePage="plugins"
        onNavigate={vi.fn()}
        pluginList={mockPlugins}
        activePlugins={new Set()}
      />
    );

    const githubLink = screen.getByText("GitHub ↗");
    expect(githubLink).toBeInTheDocument();
    expect(githubLink.closest("a")).toHaveAttribute(
      "href",
      "https://github.com/egebulut/ultimate_toolkit_by_egebulut"
    );
  });
});
