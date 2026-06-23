use base64::{engine::general_purpose::STANDARD, Engine};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Debug, Serialize, Deserialize)]
pub struct OcrResult {
    pub text: String,
    pub confidence: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LanguageInfo {
    pub code: String,
    pub name: String,
    pub installed: bool,
}

const KNOWN_LANGUAGES: &[(&str, &str)] = &[
    ("eng", "English"),
    ("tur", "Türkçe"),
    ("deu", "Deutsch"),
    ("fra", "Français"),
    ("spa", "Español"),
    ("ita", "Italiano"),
    ("rus", "Русский"),
    ("ara", "العربية"),
    ("chi_sim", "简体中文"),
    ("chi_tra", "繁體中文"),
    ("jpn", "日本語"),
    ("kor", "한국어"),
    ("por", "Português"),
    ("nld", "Nederlands"),
    ("pol", "Polski"),
    ("swe", "Svenska"),
];

// ── Tesseract binary discovery ─────────────────────────────────

fn find_tesseract() -> Option<PathBuf> {
    if let Ok(path) = Command::new("tesseract").arg("--version").output() {
        if path.status.success() {
            return Some(PathBuf::from("tesseract"));
        }
    }
    let candidates = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        &format!(r"{}\AppData\Local\Programs\Tesseract-OCR\tesseract.exe",
                 std::env::var("USERPROFILE").unwrap_or_default()),
    ];
    for c in &candidates {
        if Path::new(c).exists() {
            return Some(PathBuf::from(c));
        }
    }
    None
}

fn tessdata_path() -> PathBuf {
    if let Ok(prefix) = std::env::var("TESSDATA_PREFIX") {
        let p = Path::new(&prefix).join("tessdata");
        if p.exists() { return p; }
    }
    let candidates = [
        r"C:\Program Files\Tesseract-OCR\tessdata",
        r"C:\Program Files (x86)\Tesseract-OCR\tessdata",
        &format!(r"{}\AppData\Local\Programs\Tesseract-OCR\tessdata",
                 std::env::var("USERPROFILE").unwrap_or_default()),
    ];
    for c in &candidates {
        if Path::new(c).exists() { return PathBuf::from(c); }
    }
    PathBuf::from(std::env::var("APPDATA").unwrap_or_else(|_| r"C:\ProgramData".to_string()))
        .join("ultimate-toolkit").join("tessdata")
}

// ── OCR Command ────────────────────────────────────────────────

#[tauri::command]
pub fn perform_ocr(image_base64: String, lang: Option<String>) -> Result<OcrResult, String> {
    let lang = lang.unwrap_or_else(|| "eng".to_string());
    let tesseract = find_tesseract()
        .ok_or_else(|| "Tesseract OCR not found. Install from: https://github.com/UB-Mannheim/tesseract/wiki".to_string())?;

    let tessdata = tessdata_path();
    let bytes = STANDARD.decode(&image_base64).map_err(|e| format!("Base64 error: {}", e))?;

    let temp_dir = std::env::temp_dir().join("ut-ocr");
    std::fs::create_dir_all(&temp_dir).map_err(|e| e.to_string())?;
    let input_path = temp_dir.join("input.png");
    std::fs::write(&input_path, &bytes).map_err(|e| e.to_string())?;

    let output = Command::new(&tesseract)
        .arg(input_path.to_str().unwrap()).arg("stdout")
        .arg("-l").arg(&lang).arg("--psm").arg("3")
        .env("TESSDATA_PREFIX", tessdata.parent().unwrap_or(Path::new("")))
        .output()
        .map_err(|e| format!("Tesseract failed: {}", e))?;

    // TSV for confidence
    let tsv_dir = temp_dir.join("tsv");
    std::fs::create_dir_all(&tsv_dir).map_err(|e| e.to_string())?;
    let tsv_base = tsv_dir.join("out");
    let _ = Command::new(&tesseract)
        .arg(input_path.to_str().unwrap()).arg(tsv_base.to_str().unwrap())
        .arg("-l").arg(&lang).arg("--psm").arg("3").arg("tsv")
        .env("TESSDATA_PREFIX", tessdata.parent().unwrap_or(Path::new("")))
        .output();

    let _ = std::fs::remove_file(&input_path);
    let confidence = parse_confidence(&tsv_dir.join("out.tsv"));
    let _ = std::fs::remove_dir_all(&tsv_dir);

    let text = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if text.is_empty() && !output.status.success() {
        return Err(format!("Tesseract error: {}", String::from_utf8_lossy(&output.stderr)));
    }
    Ok(OcrResult { text, confidence })
}

fn parse_confidence(tsv_path: &PathBuf) -> f32 {
    let content = match std::fs::read_to_string(tsv_path) { Ok(c) => c, Err(_) => return 0.0 };
    let (mut total, mut count) = (0.0f32, 0u32);
    for line in content.lines().skip(1) {
        if let Some(conf_str) = line.split('\t').nth(9) {
            if let Ok(conf) = conf_str.trim().parse::<f32>() {
                if conf > 0.0 { total += conf; count += 1; }
            }
        }
    }
    if count > 0 { total / count as f32 } else { 0.0 }
}

#[tauri::command]
pub fn get_available_ocr_languages() -> Result<Vec<LanguageInfo>, String> {
    let tessdata = tessdata_path();
    Ok(KNOWN_LANGUAGES.iter().map(|(code, name)| {
        LanguageInfo {
            code: code.to_string(),
            name: name.to_string(),
            installed: tessdata.join(format!("{}.traineddata", code)).exists(),
        }
    }).collect())
}

#[tauri::command]
pub fn download_language_data(lang: String) -> Result<String, String> {
    if !KNOWN_LANGUAGES.iter().any(|(c, _)| *c == lang.as_str()) {
        return Err(format!("Unknown language: {}", lang));
    }
    let tessdata = tessdata_path();
    std::fs::create_dir_all(&tessdata).map_err(|e| e.to_string())?;
    let url = format!("https://github.com/tesseract-ocr/tessdata_fast/raw/main/{}.traineddata", lang);
    let resp = reqwest::blocking::get(&url).map_err(|e| format!("Download failed: {}", e))?;
    if !resp.status().is_success() {
        return Err(format!("HTTP {}", resp.status()));
    }
    let bytes = resp.bytes().map_err(|e| e.to_string())?;
    std::fs::write(&tessdata.join(format!("{}.traineddata", lang)), &bytes).map_err(|e| e.to_string())?;
    Ok(format!("✅ {} installed", lang))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_known_languages_contains_english() {
        assert!(KNOWN_LANGUAGES.iter().any(|(code, _)| *code == "eng"));
    }

    #[test]
    fn test_known_languages_contains_turkish() {
        assert!(KNOWN_LANGUAGES.iter().any(|(code, _)| *code == "tur"));
    }

    #[test]
    fn test_known_languages_count() {
        assert_eq!(KNOWN_LANGUAGES.len(), 16);
    }

    #[test]
    fn test_known_languages_all_have_names() {
        for (code, name) in KNOWN_LANGUAGES {
            assert!(!code.is_empty(), "Language code is empty");
            assert!(!name.is_empty(), "Language name is empty for code: {}", code);
        }
    }

    #[test]
    fn test_parse_confidence_empty_tsv() {
        let result = parse_confidence(&PathBuf::from("nonexistent.tsv"));
        assert_eq!(result, 0.0);
    }

    #[test]
    fn test_language_info_structure() {
        let info = LanguageInfo {
            code: "eng".to_string(),
            name: "English".to_string(),
            installed: true,
        };
        assert_eq!(info.code, "eng");
        assert_eq!(info.name, "English");
        assert!(info.installed);
    }

    #[test]
    fn test_ocr_result_structure() {
        let result = OcrResult {
            text: "hello".to_string(),
            confidence: 0.95,
        };
        assert_eq!(result.text, "hello");
        assert!(result.confidence > 0.9);
    }

    #[test]
    fn test_unknown_language_returns_error() {
        let result = download_language_data("xyz".to_string());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Unknown language"));
    }
}
