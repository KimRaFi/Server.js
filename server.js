const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory command queue
// Structure: { ROUTER_AUTH_KEY: [ {command, mac, speed} ] }
const commandQueue = {};

// =================== API ===================

// Router polling endpoint
app.get("/api/router/poll/:authKey", (req, res) => {
  const authKey = req.params.authKey;
  if (!commandQueue[authKey] || commandQueue[authKey].length === 0) {
    return res.json({}); // No pending commands
  }
  // Return the first command and remove it from queue
  const cmd = commandQueue[authKey].shift();
  res.json(cmd);
});

// Admin endpoint to add commands
app.post("/api/admin/command", (req, res) => {
  const { authKey, command, mac, speed } = req.body;
  if (!authKey || !command || !mac) return res.status(400).json({ error: "Missing fields" });

  if (!commandQueue[authKey]) commandQueue[authKey] = [];
  commandQueue[authKey].push({ command, mac, speed: speed || 0 });
  res.json({ status: "ok", queueLength: commandQueue[authKey].length });
});

// Simple health check
app.get("/", (req, res) => res.send("Hotspot server running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));