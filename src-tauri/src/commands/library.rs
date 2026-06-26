use crate::models::ComicEdition;
use std::sync::{Mutex, OnceLock};

static EDITION_ORDER: OnceLock<Mutex<Vec<String>>> = OnceLock::new();

fn edition_order_store() -> &'static Mutex<Vec<String>> {
    EDITION_ORDER.get_or_init(|| Mutex::new(Vec::new()))
}

#[tauri::command]
pub fn save_edition_order(editions: Vec<ComicEdition>) -> Result<(), String> {
    let ordered_titles: Vec<String> = editions.iter().map(|edition| edition.title.clone()).collect();

    let mut store = edition_order_store()
        .lock()
        .map_err(|error| format!("Failed to lock edition order store: {error}"))?;

    *store = ordered_titles;

    Ok(())
}

#[tauri::command]
pub fn get_edition_order() -> Result<Vec<String>, String> {
    let store = edition_order_store()
        .lock()
        .map_err(|error| format!("Failed to lock edition order store: {error}"))?;

    Ok(store.clone())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn save_edition_order_stores_titles_in_the_given_sequence() {
        let editions = vec![
            ComicEdition {
                id: 2,
                title: "Flsh Abslt #2".to_string(),
                pages: vec![],
            },
            ComicEdition {
                id: 1,
                title: "Flsh Abslt #1".to_string(),
                pages: vec![],
            },
        ];

        save_edition_order(editions).unwrap();

        let saved = get_edition_order().unwrap();

        assert_eq!(saved, vec!["Flsh Abslt #2", "Flsh Abslt #1"]);
    }
}
