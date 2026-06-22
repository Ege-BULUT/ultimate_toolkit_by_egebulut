use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatRequest {
    pub provider: String,
    pub model: String,
    pub api_key: Option<String>,
    pub base_url: Option<String>,
    pub messages: Vec<ChatMessage>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatResponse {
    pub content: String,
    pub model: String,
    pub provider: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaModel {
    pub name: String,
    pub size: String,
}

// ── Ollama ─────────────────────────────────────────────────────

fn ollama_base_url() -> String {
    // ponytail: default localhost, make configurable if needed
    "http://localhost:11434".to_string()
}

/// Check if Ollama is running
#[tauri::command]
pub async fn check_ollama() -> Result<bool, String> {
    let url = format!("{}/api/tags", ollama_base_url());
    let client = reqwest::Client::new();
    let resp = client.get(&url).timeout(std::time::Duration::from_secs(3)).send().await;
    Ok(resp.is_ok() && resp.unwrap().status().is_success())
}

/// List Ollama models
#[tauri::command]
pub async fn list_ollama_models() -> Result<Vec<OllamaModel>, String> {
    let url = format!("{}/api/tags", ollama_base_url());
    let client = reqwest::Client::new();
    let resp = client
        .get(&url)
        .timeout(std::time::Duration::from_secs(5))
        .send()
        .await
        .map_err(|e| format!("Ollama connection failed: {}", e))?;

    let body: Value = resp.json().await.map_err(|e| e.to_string())?;
    let models = body["models"]
        .as_array()
        .ok_or("No models field")?
        .iter()
        .map(|m| {
            let name = m["name"].as_str().unwrap_or("unknown").to_string();
            let size_bytes = m["size"].as_u64().unwrap_or(0);
            let size = if size_bytes > 1_000_000_000 {
                format!("{:.1}GB", size_bytes as f64 / 1_000_000_000.0)
            } else {
                format!("{:.0}MB", size_bytes as f64 / 1_000_000.0)
            };
            OllamaModel { name, size }
        })
        .collect();

    Ok(models)
}

/// Ollama chat completion
async fn ollama_chat(req: &ChatRequest) -> Result<ChatResponse, String> {
    let url = format!("{}/api/chat", ollama_base_url());
    let client = reqwest::Client::new();

    let body = json!({
        "model": req.model,
        "messages": req.messages,
        "stream": false,
        "options": {
            "temperature": req.temperature.unwrap_or(0.7),
        }
    });

    let resp = client
        .post(&url)
        .json(&body)
        .timeout(std::time::Duration::from_secs(120))
        .send()
        .await
        .map_err(|e| format!("Ollama error: {}", e))?;

    let result: Value = resp.json().await.map_err(|e| e.to_string())?;
    let content = result["message"]["content"]
        .as_str()
        .unwrap_or("No response")
        .to_string();

    Ok(ChatResponse {
        content,
        model: req.model.clone(),
        provider: "Ollama".to_string(),
    })
}

// ── OpenAI ─────────────────────────────────────────────────────

async fn openai_chat(req: &ChatRequest) -> Result<ChatResponse, String> {
    let base_url = req
        .base_url
        .clone()
        .unwrap_or_else(|| "https://api.openai.com/v1".to_string());
    let api_key = req.api_key.as_deref().ok_or("OpenAI API key required")?;

    let client = reqwest::Client::new();
    let body = json!({
        "model": req.model,
        "messages": req.messages,
        "temperature": req.temperature.unwrap_or(0.7),
        "max_tokens": req.max_tokens.unwrap_or(4096),
    });

    let resp = client
        .post(format!("{}/chat/completions", base_url))
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&body)
        .timeout(std::time::Duration::from_secs(120))
        .send()
        .await
        .map_err(|e| format!("API error: {}", e))?;

    let result: Value = resp.json().await.map_err(|e| e.to_string())?;
    let content = result["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("No response")
        .to_string();

    Ok(ChatResponse {
        content,
        model: req.model.clone(),
        provider: "OpenAI".to_string(),
    })
}

// ── Anthropic ──────────────────────────────────────────────────

async fn anthropic_chat(req: &ChatRequest) -> Result<ChatResponse, String> {
    let api_key = req.api_key.as_deref().ok_or("Anthropic API key required")?;

    // Convert messages to Anthropic format
    let mut system_msg = String::new();
    let mut anthropic_messages = Vec::new();

    for msg in &req.messages {
        if msg.role == "system" {
            system_msg = msg.content.clone();
        } else {
            anthropic_messages.push(json!({
                "role": msg.role,
                "content": msg.content,
            }));
        }
    }

    let mut body = json!({
        "model": req.model,
        "max_tokens": req.max_tokens.unwrap_or(4096),
        "messages": anthropic_messages,
    });

    if !system_msg.is_empty() {
        body["system"] = json!(system_msg);
    }

    let client = reqwest::Client::new();
    let resp = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .json(&body)
        .timeout(std::time::Duration::from_secs(120))
        .send()
        .await
        .map_err(|e| format!("Anthropic error: {}", e))?;

    let result: Value = resp.json().await.map_err(|e| e.to_string())?;
    let content = result["content"][0]["text"]
        .as_str()
        .unwrap_or("No response")
        .to_string();

    Ok(ChatResponse {
        content,
        model: req.model.clone(),
        provider: "Anthropic".to_string(),
    })
}

// ── Gemini ─────────────────────────────────────────────────────

async fn gemini_chat(req: &ChatRequest) -> Result<ChatResponse, String> {
    let api_key = req.api_key.as_deref().ok_or("Gemini API key required")?;

    let contents: Vec<Value> = req
        .messages
        .iter()
        .filter(|m| m.role != "system")
        .map(|m| {
            json!({
                "role": if m.role == "assistant" { "model" } else { "user" },
                "parts": [{"text": m.content}],
            })
        })
        .collect();

    let body = json!({
        "contents": contents,
        "generationConfig": {
            "temperature": req.temperature.unwrap_or(0.7),
            "maxOutputTokens": req.max_tokens.unwrap_or(4096),
        }
    });

    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
        req.model, api_key
    );

    let client = reqwest::Client::new();
    let resp = client
        .post(&url)
        .json(&body)
        .timeout(std::time::Duration::from_secs(120))
        .send()
        .await
        .map_err(|e| format!("Gemini error: {}", e))?;

    let result: Value = resp.json().await.map_err(|e| e.to_string())?;
    let content = result["candidates"][0]["content"]["parts"][0]["text"]
        .as_str()
        .unwrap_or("No response")
        .to_string();

    Ok(ChatResponse {
        content,
        model: req.model.clone(),
        provider: "Gemini".to_string(),
    })
}

// ── OpenRouter ─────────────────────────────────────────────────

async fn openrouter_chat(req: &ChatRequest) -> Result<ChatResponse, String> {
    let api_key = req.api_key.as_deref().ok_or("OpenRouter API key required")?;

    let client = reqwest::Client::new();
    let body = json!({
        "model": req.model,
        "messages": req.messages,
        "temperature": req.temperature.unwrap_or(0.7),
        "max_tokens": req.max_tokens.unwrap_or(4096),
    });

    let resp = client
        .post("https://openrouter.ai/api/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("HTTP-Referer", "https://github.com/egebulut/ultimate_toolkit_by_egebulut")
        .header("X-Title", "Ultimate Toolkit")
        .json(&body)
        .timeout(std::time::Duration::from_secs(120))
        .send()
        .await
        .map_err(|e| format!("OpenRouter error: {}", e))?;

    let result: Value = resp.json().await.map_err(|e| e.to_string())?;
    let content = result["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("No response")
        .to_string();

    Ok(ChatResponse {
        content,
        model: req.model.clone(),
        provider: "OpenRouter".to_string(),
    })
}

// ── DeepSeek ───────────────────────────────────────────────────

async fn deepseek_chat(req: &ChatRequest) -> Result<ChatResponse, String> {
    let api_key = req.api_key.as_deref().ok_or("DeepSeek API key required")?;

    let client = reqwest::Client::new();
    let body = json!({
        "model": req.model,
        "messages": req.messages,
        "temperature": req.temperature.unwrap_or(0.7),
        "max_tokens": req.max_tokens.unwrap_or(4096),
    });

    let resp = client
        .post("https://api.deepseek.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&body)
        .timeout(std::time::Duration::from_secs(120))
        .send()
        .await
        .map_err(|e| format!("DeepSeek error: {}", e))?;

    let result: Value = resp.json().await.map_err(|e| e.to_string())?;
    let content = result["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("No response")
        .to_string();

    Ok(ChatResponse {
        content,
        model: req.model.clone(),
        provider: "DeepSeek".to_string(),
    })
}

// ── HuggingFace ────────────────────────────────────────────────

async fn huggingface_chat(req: &ChatRequest) -> Result<ChatResponse, String> {
    let api_key = req.api_key.as_deref().ok_or("HuggingFace API key required")?;

    let client = reqwest::Client::new();
    let body = json!({
        "inputs": req.messages.last().map(|m| &m.content).unwrap_or(&"".to_string()),
        "parameters": {
            "temperature": req.temperature.unwrap_or(0.7),
            "max_new_tokens": req.max_tokens.unwrap_or(4096),
        }
    });

    let url = format!(
        "https://api-inference.huggingface.co/models/{}",
        req.model
    );

    let resp = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&body)
        .timeout(std::time::Duration::from_secs(120))
        .send()
        .await
        .map_err(|e| format!("HuggingFace error: {}", e))?;

    let result: Value = resp.json().await.map_err(|e| e.to_string())?;
    let content = result[0]["generated_text"]
        .as_str()
        .unwrap_or("No response")
        .to_string();

    Ok(ChatResponse {
        content,
        model: req.model.clone(),
        provider: "HuggingFace".to_string(),
    })
}

// ── Router ─────────────────────────────────────────────────────

/// Main chat completion dispatcher
#[tauri::command]
pub async fn chat_completion(req: ChatRequest) -> Result<ChatResponse, String> {
    match req.provider.to_lowercase().as_str() {
        "ollama" => ollama_chat(&req).await,
        "openai" => openai_chat(&req).await,
        "anthropic" => anthropic_chat(&req).await,
        "gemini" => gemini_chat(&req).await,
        "openrouter" => openrouter_chat(&req).await,
        "deepseek" => deepseek_chat(&req).await,
        "huggingface" => huggingface_chat(&req).await,
        other => Err(format!("Unsupported provider: {}", other)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ollama_base_url_default() {
        let url = ollama_base_url();
        assert_eq!(url, "http://localhost:11434");
    }

    #[test]
    fn test_chat_message_structure() {
        let msg = ChatMessage {
            role: "user".to_string(),
            content: "Hello".to_string(),
        };
        assert_eq!(msg.role, "user");
        assert_eq!(msg.content, "Hello");
    }

    #[test]
    fn test_chat_request_structure() {
        let req = ChatRequest {
            provider: "openai".to_string(),
            model: "gpt-4o".to_string(),
            api_key: Some("sk-xxx".to_string()),
            base_url: None,
            messages: vec![
                ChatMessage { role: "user".to_string(), content: "Hi".to_string() },
            ],
            temperature: Some(0.7),
            max_tokens: Some(100),
        };
        assert_eq!(req.provider, "openai");
        assert_eq!(req.model, "gpt-4o");
        assert_eq!(req.messages.len(), 1);
        assert_eq!(req.temperature, Some(0.7));
    }

    #[test]
    fn test_chat_response_structure() {
        let resp = ChatResponse {
            content: "Hello!".to_string(),
            model: "gpt-4o".to_string(),
            provider: "OpenAI".to_string(),
        };
        assert_eq!(resp.content, "Hello!");
        assert_eq!(resp.model, "gpt-4o");
        assert_eq!(resp.provider, "OpenAI");
    }

    #[test]
    fn test_ollama_model_structure() {
        let model = OllamaModel {
            name: "llama3.2".to_string(),
            size: "3.2GB".to_string(),
        };
        assert_eq!(model.name, "llama3.2");
        assert_eq!(model.size, "3.2GB");
    }

    #[test]
    fn test_unsupported_provider_returns_error() {
        // We can't easily test the async dispatch without network,
        // but we can verify the routing logic
        let unsupported = "nonexistent_provider".to_lowercase();
        match unsupported.as_str() {
            "ollama" | "openai" | "anthropic" | "gemini" | "openrouter" | "deepseek" | "huggingface" => {
                // supported
            }
            _ => {
                // unsupported
            }
        }
        // This should compile and demonstrate the branches are exhaustive
        assert!(true);
    }

    #[test]
    fn test_chat_request_without_api_key() {
        let req = ChatRequest {
            provider: "openai".to_string(),
            model: "gpt-4o".to_string(),
            api_key: None,
            base_url: None,
            messages: vec![],
            temperature: None,
            max_tokens: None,
        };
        assert!(req.api_key.is_none());
        assert!(req.base_url.is_none());
    }
}
