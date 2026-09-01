use crate::models::ComicEdition;
use crate::services::archive::{
    process_cbr_files as process_cbr_files_service,
    process_cbz_files as process_cbz_files_service,
};

#[tauri::command]
pub async fn process_cbr_files(paths: Vec<String>) -> Result<Vec<ComicEdition>, String> {
    tauri::async_runtime::spawn_blocking(move || process_cbr_files_service(paths))
        .await
        .map_err(|error| format!("CBR extraction task failed: {error}"))?
}

#[tauri::command]
pub async fn process_cbz_files(paths: Vec<String>) -> Result<Vec<ComicEdition>, String> {
    tauri::async_runtime::spawn_blocking(move || process_cbz_files_service(paths))
        .await
        .map_err(|error| format!("CBZ extraction task failed: {error}"))?
}
