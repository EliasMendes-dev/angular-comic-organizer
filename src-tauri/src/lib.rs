mod commands;
mod models;
mod services;

use crate::commands::extract::process_cbr_files;
use crate::commands::library::{
    clear_all_temp_editions, delete_edition_from_temp, get_edition_order, save_edition_order,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            process_cbr_files,
            save_edition_order,
            get_edition_order,
            delete_edition_from_temp,
            clear_all_temp_editions
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
