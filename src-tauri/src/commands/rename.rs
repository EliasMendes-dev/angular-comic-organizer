/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

use crate::models::ComicEdition;
use crate::services::archive::{
    export_renamed_cbzs as export_renamed_cbzs_service,
    export_renamed_cbrs as export_renamed_cbrs_service,
};
use tauri::AppHandle;

#[tauri::command]
pub async fn export_renamed_cbrs(
    app: AppHandle,
    editions: Vec<ComicEdition>,
    title: String,
    year: String,
    starting_edition: usize,
) -> Result<Vec<String>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        export_renamed_cbrs_service(&app, editions, title, year, starting_edition)
    })
    .await
    .map_err(|error| format!("Export task failed: {error}"))?
}

#[tauri::command]
pub async fn export_renamed_cbzs(
    app: AppHandle,
    editions: Vec<ComicEdition>,
    title: String,
    year: String,
    starting_edition: usize,
) -> Result<Vec<String>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        export_renamed_cbzs_service(&app, editions, title, year, starting_edition)
    })
    .await
    .map_err(|error| format!("Export task failed: {error}"))?
}
