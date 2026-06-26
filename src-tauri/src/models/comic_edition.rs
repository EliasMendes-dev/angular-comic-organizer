use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ComicPage {
    pub id: usize,
    pub file_name: String,
    pub image_path: String,
    pub page_number: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ComicEdition {
    pub id: usize,
    pub title: String,
    pub pages: Vec<ComicPage>,
}
