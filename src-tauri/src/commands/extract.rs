use std::fs;
use std::path::Path;
use std::process::Command;

use tauri::command;

/// Comando principal chamado pelo frontend
#[command]
pub fn process_cbr_files(paths: Vec<String>) {
    println!("=== CBR FILES RECEIVED ===");

    for path in &paths {
        println!("{}", path);
    }

    let temp_dir = get_temp_dir();
    clean_temp(&temp_dir);
    fs::create_dir_all(&temp_dir).expect("failed to create temp directory");

    println!("TEMP DIR: {}", temp_dir.display());

    for path in &paths {
        let file_name = Path::new(path).file_stem().unwrap().to_string_lossy();

        let edition_dir = temp_dir.join(file_name.as_ref());

        fs::create_dir_all(&edition_dir).expect("failed to create edition directory");

        println!("EDITION DIR: {}", edition_dir.display());

        extract_cbr(path, &edition_dir);
        normalize_edition_directory(&edition_dir);
    }
}

/// Executa o UnRAR no CBR
fn extract_cbr(cbr_path: &str, output_dir: &Path) {
    println!("=== EXTRACTING ===");
    println!("CBR: {}", cbr_path);
    println!("TO: {}", output_dir.display());

    let output = Command::new(r"C:\Program Files\WinRAR\UnRAR.exe")
        .args(["x", "-o+", cbr_path, output_dir.to_str().unwrap()])
        .output()
        .expect("failed to execute unrar");

    println!("STATUS: {}", output.status);

    if !output.stdout.is_empty() {
        println!("STDOUT:\n{}", String::from_utf8_lossy(&output.stdout));
    }

    if !output.stderr.is_empty() {
        println!("STDERR:\n{}", String::from_utf8_lossy(&output.stderr));
    }
}

/// Normaliza qualquer profundidade de pastas:
/// edition_dir/A/B/C -> edition_dir/
fn normalize_edition_directory(edition_dir: &Path) {
    loop {
        let entries: Vec<_> = fs::read_dir(edition_dir)
            .expect("failed to read edition directory")
            .collect::<Result<Vec<_>, _>>()
            .expect("failed to collect entries");

        let mut directories = Vec::new();
        let mut files = Vec::new();

        for entry in entries {
            let path = entry.path();

            if path.is_dir() {
                directories.push(path);
            } else {
                files.push(path);
            }
        }

        println!(
            "NORMALIZE CHECK -> dirs: {}, files: {}",
            directories.len(),
            files.len()
        );

        // condição de parada:
        // ou tem mais de 1 pasta, ou já tem arquivos
        if directories.len() != 1 || !files.is_empty() {
            break;
        }

        let nested_dir = &directories[0];

        println!("FLATTENING: {}", nested_dir.display());

        for entry in fs::read_dir(nested_dir).expect("failed to read nested directory") {
            let entry = entry.expect("failed to read entry");

            let source = entry.path();

            let destination = edition_dir.join(source.file_name().unwrap());

            fs::rename(&source, &destination).expect("failed to move file");
        }

        fs::remove_dir(nested_dir).expect("failed to remove nested directory");
    }

    println!("NORMALIZATION COMPLETE");
}

fn get_temp_dir() -> std::path::PathBuf {
    std::env::temp_dir().join("comic-organizer")
}

fn clean_temp(temp_dir: &std::path::Path) {
    if temp_dir.exists() {
        fs::remove_dir_all(temp_dir).expect("failed to clean temp directory");
    }
}
