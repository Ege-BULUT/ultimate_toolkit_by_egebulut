mod plugins;

use plugins::{ai_chat, ocr};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{Manager, State};

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

// ── Debug Logging ────────────────────────────────────────────

use std::fs::{create_dir_all, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use chrono::Local;

fn log_path(app: &tauri::AppHandle) -> PathBuf {
    let mut p = app.path().app_data_dir().unwrap_or_else(|_| PathBuf::from("."));
    p.push("logs");
    let _ = create_dir_all(&p);
    p.push("app.log");
    p
}

#[tauri::command]
fn log_message(app: tauri::AppHandle, level: String, message: String) -> Result<(), String> {
    let p = log_path(&app);
    let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S%.3f");
    let line = format!("[{timestamp}] [{level}] {message}\n");
    if let Ok(mut f) = OpenOptions::new().create(true).append(true).open(&p) {
        let _ = f.write_all(line.as_bytes());
    }
    Ok(())
}

#[tauri::command]
fn get_logs(app: tauri::AppHandle) -> Result<String, String> {
    let p = log_path(&app);
    if !p.exists() {
        return Ok(String::new());
    }
    let content = std::fs::read_to_string(&p).map_err(|e| e.to_string())?;
    // Return last 200 lines
    let lines: Vec<&str> = content.lines().collect();
    let tail = lines.len().saturating_sub(200);
    Ok(lines[tail..].join("\n"))
}

// ── Floating Window Config ────────────────────────────────────

fn floating_size(plugin_id: &str) -> (f64, f64) {
    match plugin_id {
        "ocr" => (440.0, 600.0),
        "ai_chat" => (420.0, 580.0),
        _ => (400.0, 500.0),
    }
}

#[tauri::command]
fn create_floating_window(app: tauri::AppHandle, plugin_id: String) -> Result<(), String> {
    let label = format!("floating-{plugin_id}");
    if app.get_webview_window(&label).is_some() {
        if let Some(win) = app.get_webview_window(&label) {
            let _ = win.set_focus();
        }
        return Ok(());
    }

    let (w, h) = floating_size(&plugin_id);

    let builder = tauri::WebviewWindowBuilder::new(
        &app,
        &label,
        tauri::WebviewUrl::App(format!("/?floating={plugin_id}").into()),
    )
    .title("Ultimate Toolkit")
    .inner_size(w, h)
    .always_on_top(true)
    .decorations(false)
    .resizable(true);

    builder.build().map_err(|e| format!("Failed to create window: {e}"))?;

    Ok(())
}

#[tauri::command]
fn close_floating_window(app: tauri::AppHandle, plugin_id: String) -> Result<(), String> {
    let label = format!("floating-{plugin_id}");
    if let Some(win) = app.get_webview_window(&label) {
        win.close().map_err(|e| format!("Failed to close: {e}"))?;
    }
    Ok(())
}

#[tauri::command]
fn show_floating_toolbar(app: tauri::AppHandle) -> Result<(), String> {
    if app.get_webview_window("floating-toolbar").is_some() {
        return Ok(());
    }

    let builder = tauri::WebviewWindowBuilder::new(
        &app,
        "floating-toolbar",
        tauri::WebviewUrl::App("/?toolbar".into()),
    )
    .title("Toolbar")
    .inner_size(380.0, 64.0)
    .always_on_top(true)
    .decorations(false)
    .resizable(false);

    builder.build().map_err(|e| format!("Failed to create toolbar: {e}"))?;

    Ok(())
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
    let client = reqwest::Client::new();
    let resp = client
        .get("https://api.github.com/repos/egebulut/ultimate_toolkit_by_egebulut/releases/latest")
        .header("User-Agent", "ultimate-toolkit")
        .send()
        .await
        .map_err(|e| format!("Update check failed: {e}"))?;

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

    let release: Release = resp.json().await.map_err(|e| format!("Parse error: {e}"))?;
    let current = "1.0.1";

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
                PluginToggle { id: "ocr".to_string(), active: false },
                PluginToggle { id: "ai_chat".to_string(), active: false },
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
    log_message,
    get_logs,
    create_floating_window,
            close_floating_window,
            show_floating_toolbar,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_plugin_toggle_structure() {
        let toggle = PluginToggle { id: "ocr".to_string(), active: true };
        assert_eq!(toggle.id, "ocr");
        assert!(toggle.active);
    }

    #[test]
    fn test_app_settings_initial_state() {
        let settings = AppSettings {
            theme: Mutex::new("system".to_string()),
            auto_update: Mutex::new(true),
            plugin_states: Mutex::new(vec![
                PluginToggle { id: "ocr".to_string(), active: false },
                PluginToggle { id: "ai_chat".to_string(), active: false },
            ]),
        };
        assert_eq!(*settings.theme.lock().unwrap(), "system");
        assert!(*settings.auto_update.lock().unwrap());
        assert_eq!(settings.plugin_states.lock().unwrap().len(), 2);
    }

    #[test]
    fn test_update_check_result_structure() {
        let result = UpdateCheckResult {
            available: true,
            version: Some("v1.0.0".to_string()),
            download_url: Some("https://example.com".to_string()),
        };
        assert!(result.available);
        assert_eq!(result.version.unwrap(), "v1.0.0");
    }

    #[test]
    fn test_update_check_result_not_available() {
        let result = UpdateCheckResult {
            available: false,
            version: None,
            download_url: None,
        };
        assert!(!result.available);
        assert!(result.version.is_none());
    }

    #[test]
    fn test_floating_size_known() {
        assert_eq!(floating_size("ocr"), (440.0, 600.0));
        assert_eq!(floating_size("ai_chat"), (420.0, 580.0));
    }

    #[test]
    fn test_floating_size_fallback() {
        assert_eq!(floating_size("unknown"), (400.0, 500.0));
    }
}
