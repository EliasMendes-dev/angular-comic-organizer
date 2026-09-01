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
