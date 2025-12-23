const express = require("express");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

module.exports = { app };


const { pool } = require("./db");

app.get("/db-health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ db: "ok" });
  } catch (err) {
    res.status(500).json({ db: "down" });
  }
});
