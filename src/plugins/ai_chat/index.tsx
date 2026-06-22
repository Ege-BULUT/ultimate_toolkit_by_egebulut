import React, { useState, useEffect, useRef } from "react";
import { PluginBase } from "../core/PluginBase";
import type { PluginDefinition, ChatMessage, ChatResponse, OllamaModel } from "../../types";
import { AI_PROVIDERS } from "../../types";
import { isTauri, tryInvoke } from "../../utils/tauri";
import { FloatingWindow } from "../core/FloatingWindow";
import { Tooltip } from "../../components/Tooltip";
import { MarkdownRenderer } from "../../components/MarkdownRenderer";

// ── Plugin Definition ──────────────────────────────────────────

export const aiChatPlugin: PluginDefinition = {
  id: "ai_chat",
  name: "AI Chat",
  description:
    "Chat with AI models from OpenAI, Anthropic, Google Gemini, OpenRouter, DeepSeek, HuggingFace, or local Ollama. Switch providers seamlessly.",
  icon: "🤖",
  version: "0.1.0",
  author: "Ege Bulut",
  hasFloatingUI: true,
};

// ── AI Chat Plugin Class ───────────────────────────────────────

export class AIChatPlugin extends PluginBase {
  definition = aiChatPlugin;

  onActivate() {
    console.log("AI Chat plugin activated");
  }

  onDeactivate() {
    console.log("AI Chat plugin deactivated");
  }
}

// ── Provider config helpers ────────────────────────────────────

interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  selectedModel: string;
}

function loadProviderConfig(providerId: string): ProviderConfig {
  try {
    const raw = localStorage.getItem(`ut-ai-${providerId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { apiKey: "", baseUrl: "", selectedModel: "" };
}

function saveProviderConfig(providerId: string, config: ProviderConfig) {
  localStorage.setItem(`ut-ai-${providerId}`, JSON.stringify(config));
}

// ── API Key Hints ──────────────────────────────────────────────

const KEY_HINTS: Record<string, { hint: string; url: string }> = {
  openai: {
    hint: "Go to platform.openai.com → API keys → Create new secret key. Paste it here.",
    url: "https://platform.openai.com/api-keys",
  },
  anthropic: {
    hint: "Go to console.anthropic.com → API Keys → Create key. Starts with 'sk-ant-'.",
    url: "https://console.anthropic.com/keys",
  },
  gemini: {
    hint: "Go to aistudio.google.com → Get API key. Free tier available.",
    url: "https://aistudio.google.com/apikey",
  },
  openrouter: {
    hint: "Go to openrouter.ai/keys → Create key. Gives access to many models with one key.",
    url: "https://openrouter.ai/keys",
  },
  deepseek: {
    hint: "Go to platform.deepseek.com → API keys → Create key. Very affordable.",
    url: "https://platform.deepseek.com/api_keys",
  },
  huggingface: {
    hint: "Go to huggingface.co/settings/tokens → Create token with 'read' role.",
    url: "https://huggingface.co/settings/tokens",
  },
  ollama: {
    hint: "Install Ollama from ollama.com, then run 'ollama pull <model>' in terminal. The app auto-detects it.",
    url: "https://ollama.com",
  },
};

// ── AI Chat Config ─────────────────────────────────────────────

export const AIChatConfig: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const provider = AI_PROVIDERS.find((p) => p.id === selectedProvider);
  const config = loadProviderConfig(selectedProvider);
  const keyHint = KEY_HINTS[selectedProvider];

  // Check Ollama on mount
  useEffect(() => {
    if (selectedProvider !== "ollama") return;
    if (!isTauri()) return;

    const check = async () => {
      const available = await tryInvoke<boolean>("check_ollama");
      setOllamaAvailable(available ?? false);
      if (available) {
        const models = await tryInvoke<OllamaModel[]>("list_ollama_models");
        if (models) setOllamaModels(models);
      }
    };
    check();
  }, [selectedProvider]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: input };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      let response: ChatResponse;

      if (isTauri()) {
        const result = await tryInvoke<ChatResponse>("chat_completion", {
          req: {
            provider: selectedProvider,
            model: config.selectedModel || (provider?.models[0] ?? ""),
            api_key: config.apiKey || undefined,
            base_url: config.baseUrl || undefined,
            messages: newMessages,
            temperature: 0.7,
            max_tokens: 4096,
          },
        });
        if (result) {
          response = result;
        } else {
          throw new Error("Failed to get response from backend");
        }
      } else {
        // Browser dev mode — simulate
        response = {
          content: `[${provider?.name ?? selectedProvider}] This is a simulated response. The app uses the Rust backend via Tauri for real AI calls.\n\nYour message: "${input}"\n\nIn the desktop app, this would be processed by ${config.selectedModel || provider?.models[0] || "the selected model"}.`,
          model: config.selectedModel || "dev-mode",
          provider: provider?.name ?? selectedProvider,
        };
      }

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.content },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Error: ${err}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Provider Selection */}
      <section>
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
          AI Provider
        </h3>
        <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
          Choose your AI provider and configure the API key.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {AI_PROVIDERS.map((p) => (
            <Tooltip key={p.id} text={`Switch to ${p.name}`}>
              <button
                onClick={() => setSelectedProvider(p.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background:
                    selectedProvider === p.id
                      ? "var(--color-accent)"
                      : "var(--color-surface-hover)",
                  color:
                    selectedProvider === p.id ? "#fff" : "var(--color-text-primary)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {p.name}
              </button>
            </Tooltip>
          ))}
        </div>

        {/* Provider-specific settings */}
        {provider && !provider.needsKey && selectedProvider === "ollama" && (
          <div
            className="p-3 rounded-lg text-xs mb-3"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            {ollamaAvailable ? (
              <>
                ✅ Ollama is running!
                {ollamaModels.length > 0 ? (
                  <div className="mt-2">
                    <p className="font-medium mb-1">Available models:</p>
                    {ollamaModels.map((m) => (
                      <div key={m.name} className="flex justify-between text-xs py-0.5">
                        <span>{m.name}</span>
                        <span style={{ color: "var(--color-text-muted)" }}>{m.size}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2">
                    No models found. Run{" "}
                    <code className="px-1 py-0.5 rounded" style={{ background: "var(--color-surface-hover)" }}>
                      ollama pull llama3.2
                    </code>{" "}
                    in terminal.
                  </p>
                )}
              </>
            ) : (
              <>
                ❌ Ollama is not detected.
                <br />
                Install from{" "}
                <a
                  href="https://ollama.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--color-accent)" }}
                >
                  ollama.com
                </a>{" "}
                and start the app.
              </>
            )}
          </div>
        )}

        {provider?.needsKey && (
          <div className="space-y-3">
            {/* API Key */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>
                API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => {
                    saveProviderConfig(selectedProvider, { ...config, apiKey: e.target.value });
                  }}
                  placeholder={`Enter your ${provider.name} API key`}
                  className="flex-1 px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    border: "1px solid var(--color-border)",
                  }}
                />
                <Tooltip text={keyHint?.hint ?? "Get your API key"}>
                  <a
                    href={keyHint?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap"
                    style={{
                      background: "var(--color-surface-hover)",
                      color: "var(--color-accent)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    Get Key ↗
                  </a>
                </Tooltip>
              </div>
              {keyHint && (
                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                  💡 {keyHint.hint}
                </p>
              )}
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>
                Model
              </label>
              <select
                value={config.selectedModel}
                onChange={(e) => {
                  saveProviderConfig(selectedProvider, { ...config, selectedModel: e.target.value });
                }}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {provider.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Base URL (for OpenRouter-like services) */}
            {selectedProvider === "openrouter" && (
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>
                  Base URL (optional)
                </label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={(e) => {
                    saveProviderConfig(selectedProvider, { ...config, baseUrl: e.target.value });
                  }}
                  placeholder="https://openrouter.ai/api/v1"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    border: "1px solid var(--color-border)",
                  }}
                />
              </div>
            )}

            {/* Ollama Base URL */}
            {selectedProvider === "ollama" && (
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>
                  Ollama Base URL
                </label>
                <input
                  type="text"
                  value={config.baseUrl || "http://localhost:11434"}
                  onChange={(e) => {
                    saveProviderConfig(selectedProvider, { ...config, baseUrl: e.target.value });
                  }}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    border: "1px solid var(--color-border)",
                  }}
                />
                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                  💡 Default: http://localhost:11434. Change if Ollama runs on a different host/port.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Chat Interface */}
      <section className="flex-1 flex flex-col min-h-0">
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Chat
        </h3>

        <div
          className="flex-1 overflow-y-auto mb-3 p-3 rounded-xl space-y-3"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            minHeight: 200,
            maxHeight: 400,
          }}
        >
          {chatMessages.length === 0 && (
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Start a conversation with {provider?.name}. Messages appear here.
            </p>
          )}
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                  background:
                    msg.role === "user"
                      ? "var(--color-accent)"
                      : "var(--color-surface-alt)",
                  color:
                    msg.role === "user" ? "#fff" : "var(--color-text-primary)",
                  border:
                    msg.role !== "user" ? "1px solid var(--color-border)" : "none",
                }}
              >
                {msg.role === "assistant" || msg.role === "system" ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div
                className="px-3 py-2 rounded-xl text-sm"
                style={{
                  background: "var(--color-surface-alt)",
                  color: "var(--color-text-muted)",
                  border: "1px solid var(--color-border)",
                }}
              >
                Thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${provider?.name}...`}
            rows={2}
            className="flex-1 px-3 py-2 rounded-lg text-sm resize-none"
            style={{
              background: "var(--color-surface)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
            }}
          />
          <Tooltip text="Send message (Enter)">
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium self-end transition-all"
              style={{
                background: "var(--color-accent)",
                color: "#fff",
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              Send
            </button>
          </Tooltip>
        </div>
      </section>
    </div>
  );
};

// ── AI Chat Floating UI ────────────────────────────────────────

export const AIChatFloating: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState("openai");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const config = loadProviderConfig(provider);
      const prov = AI_PROVIDERS.find((p) => p.id === provider);

      if (isTauri()) {
        const result = await tryInvoke<ChatResponse>("chat_completion", {
          req: {
            provider,
            model: (config.selectedModel || prov?.models[0]) ?? "",
            api_key: config.apiKey || undefined,
            messages: newMessages,
            temperature: 0.7,
            max_tokens: 4096,
          },
        });
        if (result) {
          setMessages((prev) => [...prev, { role: "assistant", content: result.content }]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `[${prov?.name}] Dev mode response. Your message: "${input}"`,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: `❌ ${err}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FloatingWindow title="AI Chat" icon="🤖" onClose={onClose} initialWidth={400} initialHeight={500}>
      <div className="flex flex-col gap-3 h-full">
        {/* Mini provider switcher */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {AI_PROVIDERS.slice(0, 4).map((p) => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                background: provider === p.id ? "var(--color-accent)" : "var(--color-surface-hover)",
                color: provider === p.id ? "#fff" : "var(--color-text-primary)",
              }}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto space-y-2 p-2 rounded-lg"
          style={{
            background: "var(--color-surface-alt)",
            border: "1px solid var(--color-border)",
          }}
        >
          {messages.length === 0 && (
            <p className="text-xs text-center" style={{ color: "var(--color-text-muted)" }}>
              Ask anything...
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap"
                style={{
                  background: m.role === "user" ? "var(--color-accent)" : "var(--color-surface)",
                  color: m.role === "user" ? "#fff" : "var(--color-text-primary)",
                  border: m.role !== "user" ? "1px solid var(--color-border)" : "none",
                }}
              >
              {m.role === "assistant" || m.role === "system" ? (
                <MarkdownRenderer content={m.content} />
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>Thinking...</div>}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-lg text-xs"
            style={{
              background: "var(--color-surface)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="px-3 py-2 rounded-lg text-xs font-medium"
            style={{ background: "var(--color-accent)", color: "#fff", opacity: loading ? 0.5 : 1 }}
          >
            Send
          </button>
        </div>
      </div>
    </FloatingWindow>
  );
};
