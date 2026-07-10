use crate::models::{ComicEdition, ComicPage};
use natord::compare;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::{fs, path::Path};

pub fn build_editions_from_temp(temp_dir: &Path) -> Result<Vec<ComicEdition>, std::io::Error> {
    let mut editions = Vec::new();

    let mut entries = fs::read_dir(temp_dir)?
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        .filter(|path| path.is_dir())
        .collect::<Vec<_>>();

    entries.sort_by(|a, b| {
        let a_name = a
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("unknown");
        let b_name = b
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("unknown");
        compare(a_name, b_name)
    });

    for path in entries {
        let title = path
            .file_name()
            .map(|name| name.to_string_lossy().into_owned())
            .unwrap_or_else(|| "unknown".to_string());

        let edition_id = stable_id(&title);

        let mut images = match fs::read_dir(&path) {
            Ok(dir) => dir
                .filter_map(Result::ok)
                .map(|entry| entry.path())
                .filter(|path| is_image(path))
                .collect::<Vec<_>>(),
            Err(_) => continue,
        };

        sort_image_paths(&mut images);

        let pages = images
            .into_iter()
            .enumerate()
            .map(|(index, path)| {
                let file_name = path
                    .file_name()
                    .map(|name| name.to_string_lossy().into_owned())
                    .unwrap_or_else(|| "unknown".to_string());

                let page_id = stable_id(&format!("{title}:{file_name}"));

                ComicPage {
                    id: page_id as usize,
                    file_name: file_name.clone(),
                    image_path: path.to_string_lossy().into_owned(),
                    page_number: index + 1,
                }
            })
            .collect::<Vec<_>>();

        editions.push(ComicEdition {
            id: edition_id as usize,
            title,
            pages,
        });
    }

    sort_editions_by_title(&mut editions);

    Ok(editions)
}

fn sort_editions_by_title(editions: &mut [ComicEdition]) {
    editions.sort_by(|left, right| compare(&left.title, &right.title));
}

fn sort_image_paths(paths: &mut [std::path::PathBuf]) {
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

fn stable_id(input: &str) -> u64 {
    let mut hasher = DefaultHasher::new();
    input.hash(&mut hasher);
    hasher.finish()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn stable_ids_are_deterministic_for_same_content() {
        assert_eq!(stable_id("Batman: 001"), stable_id("Batman: 001"));
        assert_ne!(stable_id("Batman: 001"), stable_id("Batman: 002"));
    }

    #[test]
    fn natural_sort_orders_numeric_suffixes() {
        let mut paths = vec![
            PathBuf::from("page10.jpg"),
            PathBuf::from("page2.jpg"),
            PathBuf::from("page1.jpg"),
        ];

        sort_image_paths(&mut paths);

        let names: Vec<_> = paths
            .iter()
            .map(|path| path.file_name().unwrap().to_string_lossy().to_string())
            .collect();

        assert_eq!(names, vec!["page1.jpg", "page2.jpg", "page10.jpg"]);
    }

    #[test]
    fn editions_are_sorted_naturally_by_title() {
        let mut editions = vec![
            ComicEdition {
                id: 3,
                title: "Zeta".to_string(),
                pages: vec![],
            },
            ComicEdition {
                id: 1,
                title: "Alpha 2".to_string(),
                pages: vec![],
            },
            ComicEdition {
                id: 2,
                title: "Alpha 1".to_string(),
                pages: vec![],
            },
        ];

        sort_editions_by_title(&mut editions);

        let titles: Vec<_> = editions
            .iter()
            .map(|edition| edition.title.as_str())
            .collect();

        assert_eq!(titles, vec!["Alpha 1", "Alpha 2", "Zeta"]);
    }
}
