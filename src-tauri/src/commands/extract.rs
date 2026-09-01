use crate::models::ComicEdition;
use crate::services::archive::{
    process_cbr_files as process_cbr_files_service,
    process_cbz_files as process_cbz_files_service,
};

#[tauri::command]
pub fn process_cbr_files(paths: Vec<String>) -> Result<Vec<ComicEdition>, String> {
    process_cbr_files_service(paths)
}

#[tauri::command]
pub fn process_cbz_files(paths: Vec<String>) -> Result<Vec<ComicEdition>, String> {
    process_cbz_files_service(paths)
}
