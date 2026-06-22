// ── Theme ──────────────────────────────────────────────────────

export type Theme = "light" | "dark" | "system";

// ── Settings ───────────────────────────────────────────────────

export interface AppSettings {
  theme: Theme;
  auto_update: boolean;
  plugin_states: PluginToggle[];
}

export interface PluginToggle {
  id: string;
  active: boolean;
}

// ── Updates ────────────────────────────────────────────────────

export interface UpdateCheckResult {
  available: boolean;
  version: string | null;
  download_url: string | null;
}

// ── OCR ────────────────────────────────────────────────────────

export interface OcrResult {
  text: string;
  confidence: number;
}

export interface LanguageInfo {
  code: string;
  name: string;
  installed: boolean;
}

// ── AI Chat ────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  provider: string;
  model: string;
  api_key?: string;
  base_url?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface ChatResponse {
  content: string;
  model: string;
  provider: string;
}

export interface OllamaModel {
  name: string;
  size: string;
}

export const AI_PROVIDERS = [
  { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"], needsKey: true, keyUrl: "https://platform.openai.com/api-keys" },
  { id: "anthropic", name: "Anthropic", models: ["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"], needsKey: true, keyUrl: "https://console.anthropic.com/keys" },
  { id: "gemini", name: "Google Gemini", models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"], needsKey: true, keyUrl: "https://aistudio.google.com/apikey" },
  { id: "openrouter", name: "OpenRouter", models: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-2.0-flash", "mistral/mixtral-8x7b"], needsKey: true, keyUrl: "https://openrouter.ai/keys" },
  { id: "deepseek", name: "DeepSeek", models: ["deepseek-chat", "deepseek-coder"], needsKey: true, keyUrl: "https://platform.deepseek.com/api_keys" },
  { id: "huggingface", name: "HuggingFace", models: ["meta-llama/Llama-3.3-70B-Instruct", "mistralai/Mixtral-8x7B-Instruct"], needsKey: true, keyUrl: "https://huggingface.co/settings/tokens" },
  { id: "ollama", name: "Ollama (Local)", models: [], needsKey: false, keyUrl: "" },
] as const;

// ── Plugin ─────────────────────────────────────────────────────

export interface PluginDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  version: string;
  author: string;
  hasFloatingUI: boolean;
  configComponent?: React.ComponentType<any>;
  floatingComponent?: React.ComponentType<any>;
}
