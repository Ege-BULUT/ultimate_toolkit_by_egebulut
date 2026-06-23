use std::collections::HashMap;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use tauri::{Manager, State};

pub struct PythonPluginState {
    pub processes: Mutex<HashMap<String, Child>>,
}

impl PythonPluginState {
    pub fn new() -> Self {
        Self {
            processes: Mutex::new(HashMap::new()),
        }
    }
}

fn find_python() -> Result<PathBuf, String> {
    let candidates = ["python", "python3", "py"];

    for name in &candidates {
        if let Ok(output) = Command::new(name).arg("--version").output() {
            if output.status.success() {
                return Ok(PathBuf::from(name));
            }
        }
    }

    let more_candidates = [
        r"C:\Python313\python.exe",
        r"C:\Python312\python.exe",
        r"C:\Python311\python.exe",
        r"C:\Python310\python.exe",
        &format!(r"{}\AppData\Local\Programs\Python\Python313\python.exe",
                 std::env::var("USERPROFILE").unwrap_or_default()),
        &format!(r"{}\AppData\Local\Programs\Python\Python312\python.exe",
                 std::env::var("USERPROFILE").unwrap_or_default()),
        &format!(r"{}\AppData\Local\Programs\Python\Python311\python.exe",
                 std::env::var("USERPROFILE").unwrap_or_default()),
        &format!(r"{}\AppData\Local\Microsoft\WindowsApps\python.exe",
                 std::env::var("LOCALAPPDATA").unwrap_or_default()),
    ];

    for path in &more_candidates {
        if std::path::Path::new(path).exists() {
            return Ok(PathBuf::from(path));
        }
    }

    Err("Python not found. Install Python from https://python.org".to_string())
}

fn find_plugin_script(app: &tauri::AppHandle, plugin_id: &str) -> Result<PathBuf, String> {
    let filename = format!("{}.py", plugin_id);

    // Try resource dir (production / dev bundled resources)
    if let Ok(dir) = app.path().resource_dir() {
        let p = dir.join("plugins").join("python").join(&filename);
        if p.exists() {
            return Ok(p);
        }
    }

    // Ponytail: dev mode — try relative to CARGO_MANIFEST_DIR
    if let Ok(manifest) = std::env::var("CARGO_MANIFEST_DIR") {
        let p = PathBuf::from(&manifest)
            .parent()
            .unwrap_or(&manifest.as_ref())
            .join("plugins")
            .join("python")
            .join(&filename);
        if p.exists() {
            return Ok(p);
        }
    }

    // Try current working directory (npm run tauri:dev from project root)
    if let Ok(cwd) = std::env::current_dir() {
        let p = cwd.join("plugins").join("python").join(&filename);
        if p.exists() {
            return Ok(p);
        }
    }

    Err(format!(
        "Python plugin script '{}' not found in resources or dev paths.\n\
         Expected at: plugins/python/{}",
        plugin_id, filename
    ))
}

#[tauri::command]
pub fn get_python_plugin_path(app: tauri::AppHandle, plugin_id: String) -> Result<String, String> {
    let path = find_plugin_script(&app, &plugin_id)?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn launch_python_plugin(
    app: tauri::AppHandle,
    state: State<PythonPluginState>,
    id: String,
    script_path: Option<String>,
) -> Result<(), String> {
    let python = find_python()?;

    let path = match script_path {
        Some(p) => PathBuf::from(p),
        None => find_plugin_script(&app, &id)?,
    };

    if !path.exists() {
        return Err(format!("Script not found: {}", path.display()));
    }

    let child = Command::new(&python)
        .arg(&path)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| format!("Failed to launch Python plugin '{}': {}", id, e))?;

    let pid = child.id();
    let mut processes = state.processes.lock().map_err(|e| e.to_string())?;

    if let Some(mut old) = processes.remove(&id) {
        let _ = old.kill();
        let _ = old.wait();
    }

    processes.insert(id.clone(), child);
    println!("[python-plugin] Launched '{}' (PID {})", id, pid);
    Ok(())
}

#[tauri::command]
pub fn stop_python_plugin(state: State<PythonPluginState>, id: String) -> Result<(), String> {
    let mut processes = state.processes.lock().map_err(|e| e.to_string())?;

    if let Some(mut child) = processes.remove(&id) {
        let pid = child.id();
        let _ = child.kill();
        let _ = child.wait();
        println!("[python-plugin] Stopped '{}' (PID {})", id, pid);
    }

    Ok(())
}

#[tauri::command]
pub fn list_python_plugins(state: State<PythonPluginState>) -> Result<Vec<String>, String> {
    let processes = state.processes.lock().map_err(|e| e.to_string())?;
    Ok(processes.keys().cloned().collect())
}

#[tauri::command]
pub fn is_python_plugin_running(state: State<PythonPluginState>, id: String) -> Result<bool, String> {
    let processes = state.processes.lock().map_err(|e| e.to_string())?;
    Ok(processes.contains_key(&id))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_python_plugin_state_new() {
        let state = PythonPluginState::new();
        assert!(state.processes.lock().unwrap().is_empty());
    }
}
