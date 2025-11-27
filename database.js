const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./hotspot.db");

// Initialize tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS commands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    authKey TEXT,
    command TEXT,
    mac TEXT,
    speed INTEGER,
    processed INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;