// Variables - imports

const express = require("express");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { pool } = require("./db");

const app = express();
app.use(express.json());

// Helper for authentication (JWT JSON Web Token)
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

//Protected endpoint - isolates auth logic so every protected route doesn’t re-implement token parsing
app.get("/me", auth, (req, res) => {
  res.json({ userId: req.user.userId, email: req.user.email });
});

// First route - API to check the communication is working
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Second route - API to check app communicates with database
app.get("/db-health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ db: "ok" });
  } catch (err) {
    res.status(500).json({ db: "down" });
  }
});

// Third route - API to register
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

//Fourth route - API to login
app.post("/auth/login", async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const { email, password } = parsed.data;

  const result = await pool.query(
    "SELECT id, email, password_hash FROM users WHERE email = $1",
    [email]
  );

  if (result.rowCount === 0) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const user = result.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

// Export - always at the very end
module.exports = { app };