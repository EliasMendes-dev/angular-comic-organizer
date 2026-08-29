use super::environment::{find_rar_binary, get_export_dir, get_temp_dir};
use crate::models::ComicEdition;
use std::fs;
use std::path::Path;
use std::process::Command;

pub fn export_renamed_cbrs(
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
        }
        let mut page_paths = fs::read_dir(staging_dir)
            .map_err(|e| format!("Failed to read staged pages: {e}"))?
            .filter_map(Result::ok)
            .map(|entry| entry.path())
            .filter(|path| path.is_file())
            .collect::<Vec<_>>();
        page_paths.sort();
        let mut command = Command::new(rar_binary);
        command.current_dir(staging_dir).args([
            "a",
            "-ep",
            archive_path.to_string_lossy().as_ref(),
        ]);
        for page_path in &page_paths {
            command.arg(page_path.file_name().unwrap_or_default());
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
