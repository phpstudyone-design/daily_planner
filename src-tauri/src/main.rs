// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::Manager;
use std::process::{Command, Child};
use std::path::PathBuf;
use std::sync::Mutex;
use once_cell::sync::Lazy;

static NODE_PROCESS: Lazy<Mutex<Option<Child>>> = Lazy::new(|| Mutex::new(None));

fn find_resources_dir(app: &tauri::AppHandle) -> PathBuf {
    let base = app.path().resource_dir().unwrap_or_else(|_| {
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).parent().unwrap().to_path_buf()
    });

    // On Windows NSIS install, Tauri extracts resources under _up_ subdir.
    // In dev mode resources are directly under the project directory.
    let up_dir = base.join("_up_");
    if up_dir.exists() {
        return up_dir;
    }
    base
}

#[cfg(target_os = "windows")]
fn spawn_node_backend(server_dir: PathBuf, node_exe: PathBuf) {
    use std::os::windows::process::CommandExt;
    use std::process::Stdio;
    
    const CREATE_NO_WINDOW: u32 = 0x08000000;
    const CREATE_NEW_PROCESS_GROUP: u32 = 0x00000200;
    
    if let Ok(child) = Command::new(&node_exe)
        .creation_flags(CREATE_NO_WINDOW | CREATE_NEW_PROCESS_GROUP)
        .current_dir(&server_dir)
        .arg("server.js")
        .env("PORT", "17321")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
    {
        if let Ok(mut process_lock) = NODE_PROCESS.lock() {
            *process_lock = Some(child);
        }
    }
}

#[cfg(not(target_os = "windows"))]
fn spawn_node_backend(server_dir: PathBuf, node_exe: PathBuf) {
    use std::process::Stdio;
    
    if let Ok(child) = Command::new(&node_exe)
        .current_dir(&server_dir)
        .arg("server.js")
        .env("PORT", "17321")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
    {
        if let Ok(mut process_lock) = NODE_PROCESS.lock() {
            *process_lock = Some(child);
        }
    }
}

fn kill_node_backend() {
    if let Ok(mut process_lock) = NODE_PROCESS.lock() {
        if let Some(mut child) = process_lock.take() {
            // Don't wait for the child to exit — just kill and forget.
            // Waiting on the main thread can cause deadlocks during shutdown.
            let _ = child.kill();
        }
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let resources = find_resources_dir(&app.handle());
            let server_dir = resources.join("server");

            // Try multiple node locations
            let node_candidates: Vec<PathBuf> = vec![
                PathBuf::from("C:\\Program Files\\nodejs\\node.exe"),
                PathBuf::from("C:\\Program Files (x86)\\nodejs\\node.exe"),
                PathBuf::from("node"),
            ];

            let node_exe = node_candidates.iter().find(|p| {
                if p.file_name().is_some() && !p.extension().is_some() {
                    return false;
                }
                p.exists()
            }).cloned()
                .unwrap_or_else(|| PathBuf::from("node"));

            spawn_node_backend(server_dir, node_exe);

            // Show main window after backend has time to initialize
            let window = app.get_webview_window("main")
                .expect("main window not found");

            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_secs(2));
                let _ = window.show();
                let _ = window.set_focus();
            });

            Ok(())
        })
        .on_window_event(|_window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                // Kill the backend then exit cleanly — do NOT prevent_close().
                kill_node_backend();
                std::process::exit(0);
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
