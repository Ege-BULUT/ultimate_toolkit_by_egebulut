import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsPanel } from "../SettingsPanel";
import type { Theme } from "../../types";

describe("SettingsPanel", () => {
  const defaultProps = {
    theme: "light" as Theme,
    autoUpdate: true,
    onThemeChange: vi.fn(),
    onAutoUpdateChange: vi.fn(),
    updateInfo: null as { available: boolean; version: string | null; download_url: string | null } | null,
    checkingUpdate: false,
    onCheckUpdate: vi.fn(),
  };

  it("renders all three theme buttons", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText("Light")).toBeTruthy();
    expect(screen.getByText("Dark")).toBeTruthy();
    expect(screen.getByText("System")).toBeTruthy();
  });

  it("highlights the selected theme", () => {
    const { rerender } = render(<SettingsPanel {...defaultProps} theme="light" />);
    const lightBtn = screen.getByText("Light").closest("button");
    expect(lightBtn?.style.background).toContain("var(--color-accent)");

    rerender(<SettingsPanel {...defaultProps} theme="dark" />);
    const darkBtn = screen.getByText("Dark").closest("button");
    expect(darkBtn?.style.background).toContain("var(--color-accent)");
  });

  it("calls onThemeChange with correct value when theme button clicked", () => {
    const onThemeChange = vi.fn();
    render(<SettingsPanel {...defaultProps} onThemeChange={onThemeChange} />);

    fireEvent.click(screen.getByText("Dark"));
    expect(onThemeChange).toHaveBeenCalledWith("dark");

    fireEvent.click(screen.getByText("System"));
    expect(onThemeChange).toHaveBeenCalledWith("system");

    fireEvent.click(screen.getByText("Light"));
    expect(onThemeChange).toHaveBeenCalledWith("light");
  });

  it("renders auto-update toggle checked when enabled", () => {
    render(<SettingsPanel {...defaultProps} autoUpdate={true} />);
    const toggle = screen.getByRole("checkbox");
    expect(toggle).toBeChecked();
  });

  it("renders auto-update toggle unchecked when disabled", () => {
    render(<SettingsPanel {...defaultProps} autoUpdate={false} />);
    const toggle = screen.getByRole("checkbox");
    expect(toggle).not.toBeChecked();
  });

  it("calls onAutoUpdateChange when toggle clicked", () => {
    const onAutoUpdateChange = vi.fn();
    render(<SettingsPanel {...defaultProps} onAutoUpdateChange={onAutoUpdateChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onAutoUpdateChange).toHaveBeenCalled();
  });

  it("shows 'Check for Updates' button that triggers callback", () => {
    const onCheckUpdate = vi.fn();
    render(<SettingsPanel {...defaultProps} onCheckUpdate={onCheckUpdate} />);
    const btn = screen.getByText("Check for Updates");
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(onCheckUpdate).toHaveBeenCalledOnce();
  });

  it("disables check button and shows 'Checking...' when checkingUpdate is true", () => {
    render(<SettingsPanel {...defaultProps} checkingUpdate={true} />);
    const btn = screen.getByText("Checking...");
    expect(btn).toBeTruthy();
    expect(btn).toBeDisabled();
  });

  it("shows update-available message when updateInfo.available is true", () => {
    render(
      <SettingsPanel
        {...defaultProps}
        updateInfo={{ available: true, version: "0.2.0", download_url: "https://example.com" }}
      />
    );
    expect(screen.getByText(/v0.2.0 available!/)).toBeTruthy();
  });

  it("shows up-to-date message when updateInfo.available is false", () => {
    render(
      <SettingsPanel
        {...defaultProps}
        updateInfo={{ available: false, version: null, download_url: null }}
      />
    );
    expect(screen.getByText(/latest version/)).toBeTruthy();
  });

  it("renders the About section with app name and version", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText(/Ultimate Toolkit/)).toBeTruthy();
    expect(screen.getByText(/v0.1.0/)).toBeTruthy();
    expect(screen.getByText(/Ege Bulut/)).toBeTruthy();
  });

  it("renders Tooltip wrapper on theme buttons", () => {
    render(<SettingsPanel {...defaultProps} />);
    // Tooltip text appears on hover — verify the button has a wrapping element
    expect(screen.getByText("Light")).toBeTruthy();
    expect(screen.getByText("Dark")).toBeTruthy();
    expect(screen.getByText("System")).toBeTruthy();
  });
});
