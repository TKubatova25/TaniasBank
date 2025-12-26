const express = require("express");

const bcrypt = require("bcrypt");
const { z } = require("zod");
const { pool } = require("./db");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});


app.get("/db-health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ db: "ok" });
  } catch (err) {
    res.status(500).json({ db: "down" });
  }
});


app.post("/auth/register", async (req, res) => {
  // Validate input safely (so bad input returns 400, not 500)
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const { email, password } = parsed.data;

  // Hash password (never store plain text passwords)
  const password_hash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO users(email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
      [email, password_hash]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    // Unique violation in Postgres is error code 23505
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.error("Register failed:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


module.exports = { app };