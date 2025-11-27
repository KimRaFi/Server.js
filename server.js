const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./database");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Router polling endpoint
app.get("/api/router/poll/:authKey", (req, res) => {
  const authKey = req.params.authKey;
  db.get(
    "SELECT * FROM commands WHERE authKey=? AND processed=0 ORDER BY timestamp LIMIT 1",
    [authKey],
    (err, row) => {
      if (err) return res.json({});
      if (!row) return res.json({});
      // Mark as processed
      db.run("UPDATE commands SET processed=1 WHERE id=?", [row.id]);
      res.json({
        command: row.command,
        mac: row.mac,
        speed: row.speed,
      });
    }
  );
});

// Admin add command
app.post("/api/admin/command", (req, res) => {
  const { authKey, command, mac, speed } = req.body;
  if (!authKey || !command || !mac) return res.status(400).json({ error: "Missing fields" });
  db.run(
    "INSERT INTO commands (authKey, command, mac, speed) VALUES (?, ?, ?, ?)",
    [authKey, command, mac, speed || 0],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: "ok", id: this.lastID });
    }
  );
});

// Admin interface
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin.html"));
});

// Health check
app.get("/", (req, res) => res.send("Hotspot server running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));