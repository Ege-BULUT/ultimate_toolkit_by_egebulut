mod plugins;

use plugins::{ai_chat, ocr};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

// ── Shared App State ──────────────────────────────────────────

pub struct AppSettings {
    pub theme: Mutex<String>,
    pub auto_update: Mutex<bool>,
    pub plugin_states: Mutex<Vec<PluginToggle>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PluginToggle {
    pub id: String,
    pub active: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateCheckResult {
    pub available: bool,
    pub version: Option<String>,
    pub download_url: Option<String>,
}

// ── Tauri Commands ─────────────────────────────────────────────

#[tauri::command]
fn get_settings(state: State<AppSettings>) -> Result<serde_json::Value, String> {
    let theme = state.theme.lock().map_err(|e| e.to_string())?;
    let auto_update = state.auto_update.lock().map_err(|e| e.to_string())?;
    let plugin_states = state.plugin_states.lock().map_err(|e| e.to_string())?;

    Ok(serde_json::json!({
        "theme": *theme,
        "auto_update": *auto_update,
        "plugin_states": *plugin_states,
    }))
}

#[tauri::command]
fn set_theme(state: State<AppSettings>, theme: String) -> Result<(), String> {
    let mut t = state.theme.lock().map_err(|e| e.to_string())?;
    *t = theme;
    Ok(())
}

#[tauri::command]
fn set_auto_update(state: State<AppSettings>, enabled: bool) -> Result<(), String> {
    let mut au = state.auto_update.lock().map_err(|e| e.to_string())?;
    *au = enabled;
    Ok(())
}

#[tauri::command]
fn toggle_plugin(state: State<AppSettings>, plugin_id: String, active: bool) -> Result<(), String> {
    let mut ps = state.plugin_states.lock().map_err(|e| e.to_string())?;
    if let Some(p) = ps.iter_mut().find(|p| p.id == plugin_id) {
        p.active = active;
    }
    Ok(())
}

#[tauri::command]
async fn check_for_updates() -> Result<UpdateCheckResult, String> {
    // ponytail: simple GitHub releases check
    let client = reqwest::Client::new();
    let resp = client
        .get("https://api.github.com/repos/egebulut/ultimate_toolkit_by_egebulut/releases/latest")
        .header("User-Agent", "ultimate-toolkit")
        .send()
        .await
        .map_err(|e| format!("Update check failed: {}", e))?;

    if !resp.status().is_success() {
        return Ok(UpdateCheckResult {
            available: false,
            version: None,
            download_url: None,
        });
    }

    #[derive(Deserialize)]
    struct Release {
        tag_name: String,
        html_url: String,
    }

    let release: Release = resp.json().await.map_err(|e| format!("Parse error: {}", e))?;
    let current = "0.1.0";

    Ok(UpdateCheckResult {
        available: release.tag_name.trim_start_matches('v') != current,
        version: Some(release.tag_name),
        download_url: Some(release.html_url),
    })
}

// ── App Entry ──────────────────────────────────────────────────

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .manage(AppSettings {
            theme: Mutex::new("system".to_string()),
            auto_update: Mutex::new(true),
            plugin_states: Mutex::new(vec![
                PluginToggle {
                    id: "ocr".to_string(),
                    active: false,
                },
                PluginToggle {
                    id: "ai_chat".to_string(),
                    active: false,
                },
            ]),
        })
        .invoke_handler(tauri::generate_handler![
            ocr::perform_ocr,
            ocr::get_available_ocr_languages,
            ocr::download_language_data,
            ai_chat::chat_completion,
            ai_chat::check_ollama,
            ai_chat::list_ollama_models,
            get_settings,
            set_theme,
            set_auto_update,
            toggle_plugin,
            check_for_updates,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
