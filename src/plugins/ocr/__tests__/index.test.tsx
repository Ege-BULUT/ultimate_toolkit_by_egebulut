import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OCRPlugin, OCRConfig, OCRFloating } from "../index";

describe("OCRPlugin", () => {
  it("has correct plugin definition", () => {
    const plugin = new OCRPlugin();
    expect(plugin.definition.id).toBe("ocr");
    expect(plugin.definition.name).toBe("OCR");
    expect(plugin.definition.hasFloatingUI).toBe(true);
    expect(plugin.definition.version).toBe("0.1.0");
  });

  it("onActivate does not throw", () => {
    const plugin = new OCRPlugin();
    expect(() => plugin.onActivate()).not.toThrow();
  });

  it("onDeactivate does not throw", () => {
    const plugin = new OCRPlugin();
    expect(() => plugin.onDeactivate()).not.toThrow();
  });
});

describe("OCRConfig", () => {
  it("renders the language selection section", () => {
    render(<OCRConfig />);
    expect(screen.getByText("OCR Language")).toBeTruthy();
    expect(screen.getByText(/Select the language/)).toBeTruthy();
  });

  it("renders language dropdown with fallback options", () => {
    render(<OCRConfig />);
    const select = screen.getByRole("combobox");
    expect(select).toBeTruthy();
    const options = screen.getAllByRole("option");
    expect(options.length).toBeGreaterThanOrEqual(4);
    expect(options[0]?.textContent).toContain("English");
  });

  it("renders 'Install Language' button", () => {
    render(<OCRConfig />);
    expect(screen.getByText("Install Language")).toBeTruthy();
  });

  it("renders the Screen Capture button", () => {
    render(<OCRConfig />);
    expect(screen.getByText(/Screen Capture/)).toBeTruthy();
  });

  it("renders a Paste & OCR button", () => {
    render(<OCRConfig />);
    const pasteBtn = screen.getAllByText(/Paste & OCR/)
      .find((el) => el.tagName === "BUTTON");
    expect(pasteBtn).toBeTruthy();
  });

  it("shows browser-mode message when Paste & OCR clicked outside Tauri", () => {
    render(<OCRConfig />);
    const pasteBtn = screen.getAllByText(/Paste & OCR/)
      .find((el) => el.tagName === "BUTTON")!;
    fireEvent.click(pasteBtn);
    expect(screen.getByText(/only available in the desktop app/)).toBeTruthy();
  });

  it("shows browser-mode message when Screen Capture clicked outside Tauri", () => {
    render(<OCRConfig />);
    fireEvent.click(screen.getByText(/Screen Capture/));
    expect(screen.getByText(/only available in the desktop app/)).toBeTruthy();
  });

  it("shows tips section", () => {
    render(<OCRConfig />);
    expect(screen.getByText(/Win\+Shift\+S/)).toBeTruthy();
  });
});

describe("OCRFloating", () => {
  it("renders a floating window with paste button", () => {
    render(<OCRFloating onClose={() => {}} />);
    expect(screen.getByText(/Paste from Clipboard/)).toBeTruthy();
  });

  it("shows browser-mode message in non-Tauri env", () => {
    render(<OCRFloating onClose={() => {}} />);
    fireEvent.click(screen.getByText(/Paste from Clipboard/));
    expect(screen.getByText(/only available in the desktop app/)).toBeTruthy();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<OCRFloating onClose={onClose} />);
    fireEvent.click(screen.getByText("✕"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
