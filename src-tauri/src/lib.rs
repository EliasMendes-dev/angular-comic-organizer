use std::env;
use std::fs;

use tauri_plugin_dialog;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![process_cbr_files])
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

#[tauri::command]
fn process_cbr_files(paths: Vec<String>) {
    println!("=== CBR FILES RECEIVED ===");

    for path in &paths {
        println!("{}", path);
    }

    let temp_dir = env::temp_dir().join("comic-organizer");

    fs::create_dir_all(&temp_dir)
        .expect("failed to create temp directory");

    println!("=== TEMP DIRECTORY ===");
    println!("{}", temp_dir.display());
}
