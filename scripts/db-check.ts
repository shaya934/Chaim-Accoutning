import { Pool } from "pg";
if (!process.env.DATABASE_URL) throw Error("DATABASE_URL is not configured.");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 3000,
});
try {
  await pool.query("SELECT 1");
  console.log("PostgreSQL is accepting queries.");
} finally {
  await pool.end();
}
