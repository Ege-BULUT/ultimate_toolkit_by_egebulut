import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AIChatPlugin, AIChatConfig, AIChatFloating } from "../index";

beforeEach(() => { localStorage.clear(); });

describe("AIChatPlugin", () => {
  const plugin = new AIChatPlugin();
  it("id is ai_chat", () => expect(plugin.definition.id).toBe("ai_chat"));
  it("name is AI Chat", () => expect(plugin.definition.name).toBe("AI Chat"));
  it("has floating UI", () => expect(plugin.definition.hasFloatingUI).toBe(true));
  it("activate does not throw", () => expect(() => plugin.onActivate()).not.toThrow());
  it("deactivate does not throw", () => expect(() => plugin.onDeactivate()).not.toThrow());
});

describe("AIChatConfig", () => {
  it("renders all 7 provider buttons", () => {
    render(<AIChatConfig />);
    ["OpenAI","Anthropic","Google Gemini","OpenRouter","DeepSeek","HuggingFace","Ollama (Local)"]
      .forEach(name => expect(screen.getByText(name)).toBeTruthy());
  });

  it("defaults to OpenAI selected", () => {
    render(<AIChatConfig />);
    expect(screen.getByText("OpenAI").closest("button")?.style.background).toContain("var(--color-accent)");
  });

  it("switches provider on click", () => {
    render(<AIChatConfig />);
    fireEvent.click(screen.getByText("Anthropic"));
    expect(screen.getByText("Anthropic").closest("button")?.style.background).toContain("var(--color-accent)");
    expect(screen.getByText("OpenAI").closest("button")?.style.background).not.toContain("var(--color-accent)");
  });

  it("shows API key input for keyed providers", () => {
    render(<AIChatConfig />);
    expect(screen.getByPlaceholderText(/Enter your OpenAI API key/)).toBeTruthy();
  });

  it("shows model selector", () => { render(<AIChatConfig />); expect(screen.getByRole("combobox")).toBeTruthy(); });

  it("Get Key link points to provider URL", () => {
    render(<AIChatConfig />);
    expect((screen.getByText(/Get Key/) as HTMLAnchorElement).href).toContain("platform.openai.com");
  });

  it("renders Chat section", () => { render(<AIChatConfig />); expect(screen.getByText("Chat")).toBeTruthy(); });

  it("Send disabled when input empty", () => { render(<AIChatConfig />); expect(screen.getByText("Send")).toBeDisabled(); });

  it("Send enabled after typing", () => {
    render(<AIChatConfig />);
    fireEvent.change(screen.getByPlaceholderText(/Message OpenAI/) as HTMLTextAreaElement, { target: { value: "Hello" } });
    expect(screen.getByText("Send")).not.toBeDisabled();
  });

  it("renders user message and simulated response after Send", async () => {
    render(<AIChatConfig />);
    fireEvent.change(screen.getByPlaceholderText(/Message OpenAI/) as HTMLTextAreaElement, { target: { value: "Hello world" } });
    fireEvent.click(screen.getByText("Send"));

    await waitFor(() => {
      expect(screen.getAllByText(/Hello world/).length).toBeGreaterThanOrEqual(1);
    }, { timeout: 5000 });
    await waitFor(() => expect(screen.getByText(/simulated response/)).toBeTruthy(), { timeout: 5000 });
  });

  it("shows Clear after messages", async () => {
    render(<AIChatConfig />);
    fireEvent.change(screen.getByPlaceholderText(/Message OpenAI/) as HTMLTextAreaElement, { target: { value: "Hi" } });
    fireEvent.click(screen.getByText("Send"));
    await waitFor(() => expect(screen.getByText("Clear")).toBeTruthy(), { timeout: 5000 });
  });

  it("clears chat history", async () => {
    render(<AIChatConfig />);
    fireEvent.change(screen.getByPlaceholderText(/Message OpenAI/) as HTMLTextAreaElement, { target: { value: "Hi" } });
    fireEvent.click(screen.getByText("Send"));
    await waitFor(() => expect(screen.getByText("Clear")).toBeTruthy(), { timeout: 5000 });

    fireEvent.click(screen.getByText("Clear"));
    await waitFor(() => expect(screen.getByText(/Start a conversation/)).toBeTruthy());
  });

  it("persists API key to localStorage", () => {
    render(<AIChatConfig />);
    fireEvent.change(screen.getByPlaceholderText(/Enter your OpenAI API key/) as HTMLInputElement, { target: { value: "sk-test-123" } });
    expect(JSON.parse(localStorage.getItem("ut-ai-openai")!).apiKey).toBe("sk-test-123");
  });

  it("shows Ollama not detected in browser mode", () => {
    render(<AIChatConfig />);
    fireEvent.click(screen.getByText("Ollama (Local)"));
    expect(screen.getByText(/Ollama is not detected/)).toBeTruthy();
  });

  it("shows OpenRouter base URL field", () => {
    render(<AIChatConfig />);
    fireEvent.click(screen.getByText("OpenRouter"));
    expect(screen.getByPlaceholderText(/openrouter/)).toBeTruthy();
  });
});

describe("AIChatFloating", () => {
  it("renders title", () => { render(<AIChatFloating onClose={() => {}} />); expect(screen.getByText("AI Chat")).toBeTruthy(); });

  it("renders provider switcher", () => {
    render(<AIChatFloating onClose={() => {}} />);
    ["OpenAI","Anthropic","Google Gemini","OpenRouter"].forEach(name => expect(screen.getByText(name)).toBeTruthy());
  });

  it("shows empty state", () => { render(<AIChatFloating onClose={() => {}} />); expect(screen.getByText("Ask anything...")).toBeTruthy(); });

  it("sends and displays message", async () => {
    render(<AIChatFloating onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText("Type a message..."), { target: { value: "Hello" } });
    fireEvent.click(screen.getByText("Send"));
    await waitFor(() => {
      expect(screen.getAllByText(/Hello/).length).toBeGreaterThanOrEqual(1);
    }, { timeout: 5000 });
  });

  it("calls onClose on close click", () => {
    const onClose = vi.fn();
    render(<AIChatFloating onClose={onClose} />);
    fireEvent.click(screen.getByText("✕"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("switches provider", () => {
    render(<AIChatFloating onClose={() => {}} />);
    fireEvent.click(screen.getByText("Anthropic"));
    expect(screen.getByText("Anthropic").closest("button")?.style.background).toContain("var(--color-accent)");
  });
});
