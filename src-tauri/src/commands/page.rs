/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

use mime_guess::from_path;
use serde::Serialize;
use std::{fs, path::Path};

#[derive(Serialize)]
pub struct PageData {
    pub bytes: Vec<u8>,
    pub mime: String,
}

#[tauri::command]
pub fn load_page(path: String) -> Result<PageData, String> {
    log::debug!("load_page: {}", path);
    let bytes = fs::read(&path).map_err(|e| e.to_string())?;

    let mime = from_path(Path::new(&path))
        .first_or_octet_stream()
        .to_string();

    Ok(PageData {
        bytes,
        mime,
    })
}
