use super::environment::{find_unrar_binary, get_temp_dir};
use crate::models::ComicEdition;
use crate::services::builder::build_editions_from_temp;
use natord::compare;
use std::collections::HashSet;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

pub fn process_cbr_files(paths: Vec<String>) -> Result<Vec<ComicEdition>, String> {
    let temp_dir = get_temp_dir();
    fs::create_dir_all(&temp_dir).map_err(|e| format!("Failed to create temp dir: {e}"))?;
    for (archive_path, edition_dir) in build_extraction_tasks(&paths, &temp_dir) {
        extract_one_cbr(&archive_path, &edition_dir)?;
    }
    build_editions_from_temp(&temp_dir)
        .map_err(|e| format!("Failed to build editions from temp dir: {e}"))
}

fn extract_one_cbr(archive_path: &str, edition_dir: &Path) -> Result<(), String> {
    fs::create_dir_all(edition_dir)
        .map_err(|e| format!("Failed to create edition dir {edition_dir:?}: {e}"))?;
    extract_cbr(archive_path, edition_dir)?;
    rename_extracted_pages(edition_dir)
}

fn build_extraction_tasks(paths: &[String], temp_dir: &Path) -> Vec<(String, PathBuf)> {
    let mut used_directories = HashSet::new();
    paths
        .iter()
        .map(|path| {
            let base_name = Path::new(path)
                .file_stem()
                .and_then(|stem| stem.to_str())
                .unwrap_or("unknown")
                .to_string();
            let mut edition_name = base_name.clone();
            let mut suffix = 2;
            let edition_dir = loop {
                let candidate = temp_dir.join(&edition_name);
                if !used_directories.contains(&candidate) && !candidate.exists() {
                    break candidate;
                }
                edition_name = format!("{base_name}-{suffix}");
                suffix += 1;
            };
            used_directories.insert(edition_dir.clone());
            (path.clone(), edition_dir)
        })
        .collect()
}

fn extract_cbr(cbr_path: &str, output_dir: &Path) -> Result<(), String> {
    let unrar_binary = find_unrar_binary()?;
    let output = Command::new(&unrar_binary)
        .args([
            "x",
            "-ep",
            "-o+",
            cbr_path,
            output_dir.to_string_lossy().as_ref(),
        ])
        .output()
        .map_err(|e| format!("Failed to run {unrar_binary:?}: {e}"))?;
    if !output.status.success() {
        return Err(format!(
            "UnRAR extraction failed for {cbr_path}: status={} stdout={} stderr={}",
            output.status,
            String::from_utf8_lossy(&output.stdout).trim(),
            String::from_utf8_lossy(&output.stderr).trim()
        ));
    }
    Ok(())
}

fn rename_extracted_pages(edition_dir: &Path) -> Result<(), String> {
    let edition_name = edition_dir
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("unknown");
    let mut image_paths = fs::read_dir(edition_dir)
        .map_err(|e| format!("Failed to read directory {}: {e}", edition_dir.display()))?
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        .filter(|path| path.is_file() && is_image(path))
        .collect::<Vec<_>>();
    sort_image_paths(&mut image_paths);
    for (index, path) in image_paths.into_iter().enumerate() {
        let extension = path
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("jpg")
            .to_lowercase();
        rename_page(
            &path,
            &edition_dir.join(format!("{edition_name} - {:03}.{extension}", index + 1)),
        )?;
    }
    Ok(())
}

fn rename_page(source: &Path, destination: &Path) -> Result<(), String> {
    if source == destination {
        return Ok(());
    }
    fs::rename(source, destination).map_err(|e| {
        format!(
            "Failed to rename page {} to {}: {e}",
            source.display(),
            destination.display()
        )
    })
}

fn sort_image_paths(paths: &mut [PathBuf]) {
    paths.sort_by(|a, b| {
        compare(
            a.file_name().and_then(|n| n.to_str()).unwrap_or(""),
            b.file_name().and_then(|n| n.to_str()).unwrap_or(""),
        )
    });
}

fn is_image(path: &Path) -> bool {
    matches!(
        path.extension()
            .and_then(|ext| ext.to_str())
            .map(str::to_ascii_lowercase)
            .as_deref(),
        Some("jpg" | "jpeg" | "png" | "webp")
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn build_extraction_tasks_preserves_order_and_name() {
        let temp_dir = Path::new("/tmp/comic-organizer");
        let tasks =
            build_extraction_tasks(&["/tmp/Alpha.cbr".into(), "/tmp/Beta.cbr".into()], temp_dir);
        assert_eq!(tasks[0].1, temp_dir.join("Alpha"));
        assert_eq!(tasks[1].1, temp_dir.join("Beta"));
    }

    #[test]
    fn build_extraction_tasks_avoids_duplicate_directory_names() {
        let temp_dir = Path::new("/tmp/comic-organizer");
        let tasks = build_extraction_tasks(
            &[
                "/tmp/first/Comic.cbr".into(),
                "/tmp/second/Comic.cbr".into(),
            ],
            temp_dir,
        );
        assert_eq!(tasks[0].1, temp_dir.join("Comic"));
        assert_eq!(tasks[1].1, temp_dir.join("Comic-2"));
    }

    #[test]
    fn normalize_edition_directory_renames_pages_in_place() {
        let temp_dir = std::env::temp_dir().join("comic-organizer-normalize-test");
        let edition_dir = temp_dir.join("Flash Absoluto (2025) #002");
        let _ = fs::remove_dir_all(&temp_dir);
        fs::create_dir_all(&edition_dir).unwrap();
        fs::write(edition_dir.join("page_02.jpg"), b"2").unwrap();
        fs::write(edition_dir.join("page_01.jpg"), b"1").unwrap();
        fs::write(edition_dir.join("page_03.png"), b"3").unwrap();
        rename_extracted_pages(&edition_dir).unwrap();
        assert!(edition_dir
            .join("Flash Absoluto (2025) #002 - 001.jpg")
            .exists());
        assert!(edition_dir
            .join("Flash Absoluto (2025) #002 - 002.jpg")
            .exists());
        assert!(edition_dir
            .join("Flash Absoluto (2025) #002 - 003.png")
            .exists());
        let _ = fs::remove_dir_all(temp_dir);
    }
}
