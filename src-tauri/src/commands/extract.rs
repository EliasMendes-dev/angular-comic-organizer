use crate::models::ComicEdition;
use crate::services::archive::process_cbr_files as process_cbr_files_service;

#[tauri::command]
pub fn process_cbr_files(paths: Vec<String>) -> Result<Vec<ComicEdition>, String> {
    process_cbr_files_service(paths)
}
