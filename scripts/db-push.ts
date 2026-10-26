import { Pool } from "pg";
if (!process.env.DATABASE_URL) throw Error("Set DATABASE_URL first.");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query(`CREATE TABLE IF NOT EXISTS content (id TEXT PRIMARY KEY,data JSONB NOT NULL,updated_at TIMESTAMP NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS inquiry (id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL,phone TEXT NOT NULL,service TEXT NOT NULL,message TEXT NOT NULL,addressed BOOLEAN NOT NULL DEFAULT false,created_at TIMESTAMP NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS inquiry_created_at_idx ON inquiry(created_at);
CREATE TABLE IF NOT EXISTS rate_limit (key TEXT PRIMARY KEY,count INTEGER NOT NULL DEFAULT 1,expires_at TIMESTAMP NOT NULL);
CREATE INDEX IF NOT EXISTS rate_limit_expires_at_idx ON rate_limit(expires_at);`);
  console.log("Database schema prepared (idempotent).");
} finally {
  await pool.end();
}
