use tauri::command;

use crate::commands::extract::extract_cbr;

#[command]
pub fn convert_cbr(paths: Vec<String>) -> Result<(), String> {
    println!("Iniciando conversão de CBR...");

    for path in paths {
        println!("Processando: {}", path);

        extract_cbr(&path)?;
    }

    Ok(())
}
