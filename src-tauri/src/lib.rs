mod commands;
mod models;
mod services;

use crate::commands::extract::process_cbr_files;
use crate::commands::library::{
    clear_all_temp_editions, delete_edition_from_temp, get_edition_order, save_edition_order,
};
use crate::services::archive::clear_temp_directory;
use crate::commands::page::load_page;

use tauri::WindowEvent;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            process_cbr_files,
            save_edition_order,
            get_edition_order,
            delete_edition_from_temp,
            clear_all_temp_editions,
            load_page
        ])
        .setup(|app| {
            // Remove qualquer arquivo temporário deixado por uma execução anterior.
            if let Err(error) = clear_temp_directory() {
                log::error!("{error}");
            }

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            Ok(())
        })
        .on_window_event(|_, event| {
            if let WindowEvent::CloseRequested { .. } = event {
                // Remove os arquivos temporários da execução atual.
                if let Err(error) = clear_temp_directory() {
                    log::error!("{error}");
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
