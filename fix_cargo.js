const fs = require('fs');
let content = fs.readFileSync('D:/projects/daily_planner/src-tauri/Cargo.toml', 'utf8');
content = content.replace(/tauri = \{ version = "2", features = \["tray-icon"\] \}/, 'tauri = { version = "2", features = ["tray-icon", "shell"] }');
fs.writeFileSync('D:/projects/daily_planner/src-tauri/Cargo.toml', content);
console.log('Updated Cargo.toml');
