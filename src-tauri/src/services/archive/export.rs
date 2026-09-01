use super::environment::{find_rar_binary, get_export_dir, get_temp_dir};
use crate::models::ComicEdition;
use std::ffi::OsString;
use std::fs::{self, File};
use std::io;
use std::path::Path;
use std::process::Command;
use tauri::{AppHandle, Emitter};
use zip::write::FileOptions;
use zip::ZipWriter;

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct ExportProgress {
    current: usize,
    total: usize,
    progress: u8,
    message: String,
}

pub fn export_renamed_cbrs(
    app: &AppHandle,
    editions: Vec<ComicEdition>,
    title: String,
    year: String,
    starting_edition: usize,
) -> Result<Vec<String>, String> {
    if editions.is_empty() {
        return Err("No editions selected".to_string());
    }

    let series_name = format!("{} ({})", title.trim(), year.trim());
    let output_dir = get_export_dir(&series_name)?;
    let output_paths = editions
        .iter()
        .enumerate()
        .map(|(index, _)| {
            let edition_name = format!("{series_name} #{:03}", starting_edition + index);
            output_dir.join(format!("{edition_name}.cbr"))
        })
        .collect::<Vec<_>>();

    if let Some(existing_path) = output_paths.iter().find(|path| path.exists()) {
        return Err(format!(
            "The output file already exists: {}",
            existing_path.display()
        ));
    }
    fs::create_dir_all(&output_dir)
        .map_err(|e| format!("Failed to create output directory: {e}"))?;
    let staging_root = get_temp_dir().join(".rename-export");
    fs::create_dir_all(&staging_root)
        .map_err(|e| format!("Failed to create export staging directory: {e}"))?;
    let rar_binary = find_rar_binary()?;
    let mut created_paths = Vec::with_capacity(editions.len());

    for (index, edition) in editions.iter().enumerate() {
        let edition_number = starting_edition + index;
        let edition_name = format!("{series_name} #{edition_number:03}");
        let archive_path = &output_paths[index];
        let staging_dir = staging_root.join(format!("{index}-{edition_number:03}"));
        emit_export_progress(
            app,
            index + 1,
            index,
            editions.len(),
            format!("Renomeando {} para {edition_name}.cbr", edition.title),
        );
        if let Err(error) = create_renamed_cbr(
            edition,
            &edition_name,
            archive_path,
            &staging_dir,
            &rar_binary,
        ) {
            for created_path in &created_paths {
                let _ = fs::remove_file(created_path);
            }
            return Err(error);
        }
        created_paths.push(archive_path.clone());
        emit_export_progress(
            app,
            index + 1,
            index + 1,
            editions.len(),
            format!("Arquivo {edition_name}.cbr criado"),
        );
    }
    Ok(created_paths
        .into_iter()
        .map(|path| path.to_string_lossy().into_owned())
        .collect())
}

fn create_renamed_cbr(
    edition: &ComicEdition,
    edition_name: &str,
    archive_path: &Path,
    staging_dir: &Path,
    rar_binary: &Path,
) -> Result<(), String> {
    if staging_dir.exists() {
        fs::remove_dir_all(staging_dir)
            .map_err(|e| format!("Failed to clear export staging directory: {e}"))?;
    }
    let result = (|| {
        fs::create_dir_all(staging_dir)
            .map_err(|e| format!("Failed to create edition staging directory: {e}"))?;
        let mut pages = edition.pages.clone();
        pages.sort_by_key(|page| page.page_number);
        let mut staged_page_names = Vec::<OsString>::with_capacity(pages.len());
        for (page_index, page) in pages.iter().enumerate() {
            let source = Path::new(&page.image_path);
            let extension = source
                .extension()
                .and_then(|extension| extension.to_str())
                .unwrap_or("jpg")
                .to_lowercase();
            let destination = staging_dir.join(format!(
                "{edition_name} - {:03}.{extension}",
                page_index + 1
            ));
            fs::copy(source, &destination)
                .map_err(|e| format!("Failed to stage page {}: {e}", source.display()))?;
            let file_name = destination.file_name().ok_or_else(|| {
                format!(
                    "Failed to determine staged page name for {}",
                    destination.display()
                )
            })?;
            staged_page_names.push(file_name.to_os_string());
        }
        let mut command = Command::new(rar_binary);
        command.current_dir(staging_dir).args([
            "a",
            "-ep",
            archive_path.to_string_lossy().as_ref(),
        ]);
        for page_name in &staged_page_names {
            command.arg(page_name);
        }
        let output = command
            .output()
            .map_err(|e| format!("Failed to run RAR: {e}"))?;
        if !output.status.success() {
            return Err(format!(
                "RAR failed for {}: {}",
                archive_path.display(),
                String::from_utf8_lossy(&output.stderr).trim()
            ));
        }
        Ok(())
    })();
    let _ = fs::remove_dir_all(staging_dir);
    if result.is_err() {
        let _ = fs::remove_file(archive_path);
    }
    result
}

pub fn export_renamed_cbzs(
    app: &AppHandle,
    editions: Vec<ComicEdition>,
    title: String,
    year: String,
    starting_edition: usize,
) -> Result<Vec<String>, String> {
    if editions.is_empty() {
        return Err("No editions selected".to_string());
    }

    let series_name = format!("{} ({})", title.trim(), year.trim());
    let output_dir = get_export_dir(&series_name)?;

    let output_paths = editions
        .iter()
        .enumerate()
        .map(|(index, _)| {
            let edition_name = format!("{series_name} #{:03}", starting_edition + index);
            output_dir.join(format!("{edition_name}.cbz")) // Extensão CBZ
        })
        .collect::<Vec<_>>();

    if let Some(existing_path) = output_paths.iter().find(|path| path.exists()) {
        return Err(format!(
            "The output file already exists: {}",
            existing_path.display()
        ));
    }

    fs::create_dir_all(&output_dir)
        .map_err(|e| format!("Failed to create output directory: {e}"))?;

    let mut created_paths = Vec::with_capacity(editions.len());

    for (index, edition) in editions.iter().enumerate() {
        let edition_number = starting_edition + index;
        let edition_name = format!("{series_name} #{edition_number:03}");
        let archive_path = &output_paths[index];
        emit_export_progress(
            app,
            index + 1,
            index,
            editions.len(),
            format!("Renomeando {} para {edition_name}.cbz", edition.title),
        );

        if let Err(error) = create_renamed_cbz(edition, &edition_name, archive_path) {
            // Em caso de erro, apaga os arquivos que já tinham sido criados
            for created_path in &created_paths {
                let _ = fs::remove_file(created_path);
            }
            return Err(error);
        }
        created_paths.push(archive_path.clone());
        emit_export_progress(
            app,
            index + 1,
            index + 1,
            editions.len(),
            format!("Arquivo {edition_name}.cbz criado"),
        );
    }

    Ok(created_paths
        .into_iter()
        .map(|path| path.to_string_lossy().into_owned())
        .collect())
}

fn emit_export_progress(
    app: &AppHandle,
    current: usize,
    completed: usize,
    total: usize,
    message: String,
) {
    let progress = if total == 0 {
        0
    } else {
        ((completed * 100) / total).min(100) as u8
    };
    let _ = app.emit(
        "export-progress",
        ExportProgress {
            current: current.min(total),
            total,
            progress,
            message,
        },
    );
}

// Diferente do CBR, o CBZ pode ler o arquivo original e ejetar direto no ZIP,
// sem precisar copiar para uma pasta de staging temporária. É muito mais rápido.
fn create_renamed_cbz(
    edition: &ComicEdition,
    edition_name: &str,
    archive_path: &Path,
) -> Result<(), String> {
    let file = File::create(archive_path)
        .map_err(|e| format!("Failed to create CBZ file: {e}"))?;

    let mut zip = ZipWriter::new(file);
    let options = FileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated)
        .unix_permissions(0o755);

    let mut pages = edition.pages.clone();
    pages.sort_by_key(|page| page.page_number);

    for (page_index, page) in pages.iter().enumerate() {
        let source = Path::new(&page.image_path);
        let extension = source
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("jpg")
            .to_lowercase();

        // Nome renomeado que ficará dentro do CBZ
        let zip_file_name = format!("{edition_name} - {:03}.{extension}", page_index + 1);

        zip.start_file(zip_file_name, options)
            .map_err(|e| format!("Failed to start file in ZIP: {e}"))?;

        let mut f = File::open(source)
            .map_err(|e| format!("Failed to open source image {}: {e}", source.display()))?;

        io::copy(&mut f, &mut zip)
            .map_err(|e| format!("Failed to write to ZIP: {e}"))?;
    }

    zip.finish().map_err(|e| format!("Failed to finalize CBZ: {e}"))?;

    Ok(())
}
