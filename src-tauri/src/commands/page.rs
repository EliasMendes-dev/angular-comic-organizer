use serde::Serialize;
use std::{fs, path::Path};

#[derive(Serialize)]
pub struct PageData {
    pub bytes: Vec<u8>,
    pub mime: String,
}

#[tauri::command]
pub fn load_page(path: String) -> Result<PageData, String> {
  println!("load_page: {}", path);
    let bytes = fs::read(&path).map_err(|e| e.to_string())?;

    let mime = match Path::new(&path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase()
        .as_str()
    {
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "webp" => "image/webp",
        _ => "application/octet-stream",
    };

    Ok(PageData {
        bytes,
        mime: mime.to_string(),
    })
}
