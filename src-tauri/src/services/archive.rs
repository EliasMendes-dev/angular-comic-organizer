use crate::models::ComicEdition;
use crate::services::builder::build_editions_from_temp;
use natord::compare;
use std::collections::HashSet;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

pub fn process_cbr_files(paths: Vec<String>) -> Result<Vec<ComicEdition>, String> {
    let temp_dir = get_temp_dir();

    fs::create_dir_all(&temp_dir).map_err(|e| format!("Failed to create temp dir: {e}"))?;

    for (archive_path, edition_dir) in build_extraction_tasks(&paths, &temp_dir) {
        extract_one_cbr(&archive_path, &edition_dir)?;
    }

    let editions = build_editions_from_temp(&temp_dir)
        .map_err(|e| format!("Failed to build editions from temp dir: {e}"))?;

    Ok(editions)
}

fn extract_one_cbr(archive_path: &str, edition_dir: &Path) -> Result<(), String> {
    fs::create_dir_all(edition_dir)
        .map_err(|error| format!("Failed to create edition dir {edition_dir:?}: {error}"))?;

    extract_cbr(archive_path, edition_dir)?;
    normalize_edition_directory(edition_dir)
}

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
    let downloads_dir = get_downloads_dir()?;
    let output_dir = downloads_dir.join(&series_name);

    let output_paths = editions
        .iter()
        .enumerate()
        .map(|(index, _)| {
            let edition_number = starting_edition + index;
            let edition_name = format!("{series_name} #{edition_number:03}");
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
        .map_err(|error| format!("Failed to create output directory: {error}"))?;

    let staging_root = get_temp_dir().join(".rename-export");
    fs::create_dir_all(&staging_root)
        .map_err(|error| format!("Failed to create export staging directory: {error}"))?;

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
            .map_err(|error| format!("Failed to clear export staging directory: {error}"))?;
    }

    let result = (|| {
        fs::create_dir_all(staging_dir)
            .map_err(|error| format!("Failed to create edition staging directory: {error}"))?;

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
                .map_err(|error| format!("Failed to stage page {}: {error}", source.display()))?;
        }

        let page_paths = fs::read_dir(staging_dir)
            .map_err(|error| format!("Failed to read staged pages: {error}"))?
            .filter_map(Result::ok)
            .map(|entry| entry.path())
            .filter(|path| path.is_file())
            .collect::<Vec<_>>();

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
            .map_err(|error| format!("Failed to run RAR: {error}"))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!(
                "RAR failed for {}: {}",
                archive_path.display(),
                stderr.trim()
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
            let edition_dir;

            loop {
                let candidate = temp_dir.join(&edition_name);

                if !used_directories.contains(&candidate) && !candidate.exists() {
                    edition_dir = candidate;
                    break;
                }

                edition_name = format!("{base_name}-{suffix}");
                suffix += 1;
            }

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
        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!(
            "UnRAR extraction failed for {cbr_path}: status={} stdout={} stderr={}",
            output.status,
            stdout.trim(),
            stderr.trim()
        ));
    }

    Ok(())
}

fn normalize_edition_directory(edition_dir: &Path) -> Result<(), String> {
    rename_extracted_pages(edition_dir)?;
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

        let destination =
            edition_dir.join(format!("{edition_name} - {:03}.{extension}", index + 1));

        rename_page(&path, &destination)?;
    }

    Ok(())
}

fn rename_page(source: &Path, destination: &Path) -> Result<(), String> {
    if source == destination {
        return Ok(());
    }

    fs::rename(source, destination).map_err(|error| {
        format!(
            "Failed to rename page {} to {}: {error}",
            source.display(),
            destination.display()
        )
    })
}

fn sort_image_paths(paths: &mut [PathBuf]) {
    paths.sort_by(|a, b| {
        let a_name = a.file_name().and_then(|n| n.to_str()).unwrap_or("");
        let b_name = b.file_name().and_then(|n| n.to_str()).unwrap_or("");
        compare(a_name, b_name)
    });
}

fn is_image(path: &Path) -> bool {
    if let Some(ext) = path.extension() {
        let ext = ext.to_string_lossy().to_lowercase();
        return matches!(ext.as_str(), "jpg" | "jpeg" | "png" | "webp");
    }

    false
}

fn find_unrar_binary() -> Result<PathBuf, String> {
    if let Some(path) = env::var_os("COMIC_ORGANIZER_UNRAR") {
        return Ok(PathBuf::from(path));
    }

    if let Some(path) = env::var_os("UNRAR_EXE") {
        return Ok(PathBuf::from(path));
    }

    let candidates = ["unrar", "unrar.exe", "UnRAR.exe"];

    if let Some(path_var) = env::var_os("PATH") {
        for dir in env::split_paths(&path_var) {
            for candidate in candidates {
                let full_path = dir.join(candidate);
                if full_path.is_file() {
                    return Ok(full_path);
                }
            }
        }
    }

    let fallback = PathBuf::from(r"C:\Program Files\WinRAR\UnRAR.exe");
    if fallback.is_file() {
        return Ok(fallback);
    }

    Err("No UnRAR executable was found. Install WinRAR or set COMIC_ORGANIZER_UNRAR.".to_string())
}

fn find_rar_binary() -> Result<PathBuf, String> {
    if let Some(path) = env::var_os("COMIC_ORGANIZER_RAR") {
        return Ok(PathBuf::from(path));
    }

    let candidates = ["rar", "rar.exe", "Rar.exe", "WinRAR.exe"];

    if let Some(path_var) = env::var_os("PATH") {
        for dir in env::split_paths(&path_var) {
            for candidate in candidates {
                let full_path = dir.join(candidate);
                if full_path.is_file() {
                    return Ok(full_path);
                }
            }
        }
    }

    for fallback in [
        PathBuf::from(r"C:\Program Files\WinRAR\Rar.exe"),
        PathBuf::from(r"C:\Program Files\WinRAR\WinRAR.exe"),
    ] {
        if fallback.is_file() {
            return Ok(fallback);
        }
    }

    Err("No RAR executable was found. Install WinRAR or set COMIC_ORGANIZER_RAR.".to_string())
}

fn get_downloads_dir() -> Result<PathBuf, String> {
    let home = env::var_os("USERPROFILE")
        .or_else(|| env::var_os("HOME"))
        .ok_or_else(|| "Could not determine the user home directory".to_string())?;

    Ok(PathBuf::from(home).join("Downloads"))
}

fn get_temp_dir() -> PathBuf {
    if let Some(path) = env::var_os("COMIC_ORGANIZER_TEMP_DIR") {
        return PathBuf::from(path);
    }

    env::temp_dir().join("comic-organizer")
}

pub fn remove_edition_from_temp(edition_title: &str) -> Result<(), String> {
    let temp_dir = get_temp_dir();
    let edition_dir = temp_dir.join(edition_title);

    if !edition_dir.exists() {
        return Ok(());
    }

    fs::remove_dir_all(&edition_dir).map_err(|error| {
        format!(
            "Failed to remove edition directory {}: {error}",
            edition_dir.display()
        )
    })
}

pub fn clear_temp_directory() -> Result<(), String> {
    let temp_dir = get_temp_dir();

    if !temp_dir.exists() {
        return Ok(());
    }

    fs::remove_dir_all(&temp_dir).map_err(|error| {
        format!(
            "Failed to clear temp directory {}: {error}",
            temp_dir.display()
        )
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn build_extraction_tasks_preserves_order_and_name() {
        let temp_dir = Path::new("/tmp/comic-organizer");
        let paths = vec!["/tmp/Alpha.cbr".to_string(), "/tmp/Beta.cbr".to_string()];

        let tasks = build_extraction_tasks(&paths, temp_dir);

        assert_eq!(tasks[0].0, "/tmp/Alpha.cbr");
        assert_eq!(tasks[0].1, temp_dir.join("Alpha"));
        assert_eq!(tasks[1].0, "/tmp/Beta.cbr");
        assert_eq!(tasks[1].1, temp_dir.join("Beta"));
    }

    #[test]
    fn build_extraction_tasks_avoids_duplicate_directory_names() {
        let temp_dir = Path::new("/tmp/comic-organizer");
        let paths = vec![
            "/tmp/first/Comic.cbr".to_string(),
            "/tmp/second/Comic.cbr".to_string(),
        ];

        let tasks = build_extraction_tasks(&paths, temp_dir);

        assert_eq!(tasks[0].1, temp_dir.join("Comic"));
        assert_eq!(tasks[1].1, temp_dir.join("Comic-2"));
    }

    #[test]
    fn normalize_edition_directory_renames_pages_in_place() {
        let temp_dir = env::temp_dir().join("comic-organizer-normalize-test");
        let edition_dir = temp_dir.join("Flash Absoluto (2025) #002");

        let _ = fs::remove_dir_all(&temp_dir);

        fs::create_dir_all(&edition_dir).unwrap();
        fs::write(edition_dir.join("page_02.jpg"), b"2").unwrap();
        fs::write(edition_dir.join("page_01.jpg"), b"1").unwrap();
        fs::write(edition_dir.join("page_03.png"), b"3").unwrap();

        normalize_edition_directory(&edition_dir).unwrap();

        let mut files = fs::read_dir(&edition_dir)
            .unwrap()
            .filter_map(Result::ok)
            .map(|entry| entry.file_name().to_string_lossy().into_owned())
            .collect::<Vec<_>>();

        files.sort();

        assert_eq!(
            files,
            vec![
                "Flash Absoluto (2025) #002 - 001.jpg".to_string(),
                "Flash Absoluto (2025) #002 - 002.jpg".to_string(),
                "Flash Absoluto (2025) #002 - 003.png".to_string(),
            ]
        );
        let _ = fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn remove_edition_from_temp_removes_the_matching_directory() {
        let temp_dir = env::temp_dir().join("comic-organizer-delete-test");
        let edition_dir = temp_dir.join("Batman");

        fs::create_dir_all(&edition_dir).unwrap();
        fs::write(edition_dir.join("page1.jpg"), b"x").unwrap();

        let original_temp_dir = env::var_os("COMIC_ORGANIZER_TEMP_DIR").map(PathBuf::from);
        unsafe {
            std::env::set_var("COMIC_ORGANIZER_TEMP_DIR", &temp_dir);
        }

        remove_edition_from_temp("Batman").unwrap();

        assert!(!edition_dir.exists());

        if let Some(previous) = original_temp_dir {
            unsafe {
                std::env::set_var("COMIC_ORGANIZER_TEMP_DIR", previous);
            }
        } else {
            unsafe {
                std::env::remove_var("COMIC_ORGANIZER_TEMP_DIR");
            }
        }

        let _ = fs::remove_dir_all(&temp_dir);
    }
}
