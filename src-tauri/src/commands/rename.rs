use crate::models::ComicEdition;
use crate::services::archive::{
    export_renamed_cbzs as export_renamed_cbzs_service,
    export_renamed_cbrs as export_renamed_cbrs_service,
};

#[tauri::command]
pub fn export_renamed_cbrs(
    editions: Vec<ComicEdition>,
    title: String,
    year: String,
    starting_edition: usize,
) -> Result<Vec<String>, String> {
    export_renamed_cbrs_service(editions, title, year, starting_edition)
}

#[tauri::command]
pub fn export_renamed_cbzs(
    editions: Vec<ComicEdition>,
    title: String,
    year: String,
    starting_edition: usize,
) -> Result<Vec<String>, String> {
    export_renamed_cbzs_service(editions, title, year, starting_edition)
}
