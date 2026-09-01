use std::env;
use std::fs;
use std::path::PathBuf;

pub(super) fn get_temp_dir() -> PathBuf {
    env::var_os("COMIC_ORGANIZER_TEMP_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|| env::temp_dir().join("comic-organizer"))
}

pub(super) fn get_export_dir(series_name: &str) -> Result<PathBuf, String> {
    let home = env::var_os("USERPROFILE")
        .or_else(|| env::var_os("HOME"))
        .ok_or_else(|| "Could not determine the user home directory".to_string())?;
    Ok(PathBuf::from(home).join("Downloads").join(series_name))
}

pub(super) fn find_unrar_binary() -> Result<PathBuf, String> {
    if let Some(path) = env::var_os("COMIC_ORGANIZER_UNRAR")
        .or_else(|| env::var_os("UNRAR_EXE"))
    {
        return Ok(PathBuf::from(path));
    }

    if let Some(path) = find_on_path(&["unrar", "unrar.exe", "UnRAR.exe"]) {
        return Ok(path);
    }

    let path = PathBuf::from(r"C:\Program Files\WinRAR\UnRAR.exe");

    if path.is_file() {
        return Ok(path);
    }

    // UnRAR incluído no próprio projeto
    let bundled = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("resources")
        .join("UnRAR.exe");

    if bundled.is_file() {
        return Ok(bundled);
    }

    Err(
        "No UnRAR executable was found. Install WinRAR or provide COMIC_ORGANIZER_UNRAR."
            .to_string()
    )
}

pub fn find_rar_binary() -> Result<PathBuf, String> {
    if let Some(path) = env::var_os("COMIC_ORGANIZER_RAR").or_else(|| env::var_os("RAR_EXE")) {
        return Ok(PathBuf::from(path));
    }

    if let Some(path) = find_on_path(&["rar", "rar.exe", "Rar.exe"]) {
        return Ok(path);
    }

    // 1. Procura nos locais de instalação padrão do Windows
    let common_paths = [
        env::var_os("ProgramFiles").map(|root| PathBuf::from(root).join(r"WinRAR\Rar.exe")),
        env::var_os("ProgramFiles(x86)")
            .map(|root| PathBuf::from(root).join(r"WinRAR\Rar.exe")),
    ];

    if let Some(path) = common_paths.into_iter().flatten().find(|path| path.is_file()) {
        return Ok(path);
    }

    // 2. Procura nas variáveis de ambiente do sistema
    // 3. Se não achar no PC do usuário, devolve um erro avisando
    Err(
        "WinRAR não encontrado no sistema. Para exportar em CBR, você precisa ter o WinRAR instalado na sua máquina. \n\nRecomendamos exportar no formato CBZ, que não exige programas externos e é muito mais rápido!"
            .to_string(),
    )
}

fn find_on_path(candidates: &[&str]) -> Option<PathBuf> {
    let path_var = env::var_os("PATH")?;
    env::split_paths(&path_var)
        .flat_map(|dir| candidates.iter().map(move |candidate| dir.join(candidate)))
        .find(|path| path.is_file())
}

pub fn remove_edition_from_temp(edition_title: &str) -> Result<(), String> {
    let edition_dir = get_temp_dir().join(edition_title);
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
    fn remove_edition_from_temp_removes_the_matching_directory() {
        let temp_dir = env::temp_dir().join("comic-organizer-delete-test");
        let edition_dir = temp_dir.join("Batman");
        let _ = fs::remove_dir_all(&temp_dir);
        fs::create_dir_all(&edition_dir).unwrap();
        fs::write(edition_dir.join("page1.jpg"), b"x").unwrap();
        let previous = env::var_os("COMIC_ORGANIZER_TEMP_DIR");
        unsafe {
            env::set_var("COMIC_ORGANIZER_TEMP_DIR", &temp_dir);
        }
        remove_edition_from_temp("Batman").unwrap();
        assert!(!edition_dir.exists());
        match previous {
            Some(value) => unsafe { env::set_var("COMIC_ORGANIZER_TEMP_DIR", value) },
            None => unsafe { env::remove_var("COMIC_ORGANIZER_TEMP_DIR") },
        }
        let _ = fs::remove_dir_all(temp_dir);
    }
}
