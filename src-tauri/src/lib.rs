use std::env;
use std::fs;
use std::path::Path;

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

    fs::create_dir_all(&temp_dir).expect("failed to create temp directory");

    println!("=== TEMP DIRECTORY ===");
    println!("{}", temp_dir.display());

    println!("=== EDITION DIRECTORIES ===");

    for path in &paths {
        let file_name = Path::new(path).file_stem().unwrap().to_string_lossy();

        let edition_dir = temp_dir.join(file_name.as_ref());

        fs::create_dir_all(&edition_dir).expect("failed to create edition directory");

        println!("{}", edition_dir.display());
    }
}
