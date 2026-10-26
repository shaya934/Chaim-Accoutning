import EmbeddedPostgres from "embedded-postgres";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  appendFileSync,
} from "node:fs";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
mkdirSync(".local-data", { recursive: true, mode: 0o700 });
const configPath = ".local-data/database.json";
const config = existsSync(configPath)
  ? JSON.parse(readFileSync(configPath, "utf8"))
  : { password: randomBytes(24).toString("hex"), port: 55433 };
if (!existsSync(configPath))
  writeFileSync(configPath, JSON.stringify(config), { mode: 0o600 });
const url = `postgresql://postgres:${config.password}@127.0.0.1:${config.port}/chaim`;
const localEnv = existsSync(".env.local")
  ? readFileSync(".env.local", "utf8")
  : "";
if (
  /^DATABASE_URL=.+$/m.test(localEnv) &&
  !localEnv.includes("DATABASE_URL=" + url)
)
  throw Error(
    "A different DATABASE_URL is already configured. Use that database or preserve and remove that binding before starting the local development database.",
  );
const additions = [];
if (!/^DATABASE_URL=.+$/m.test(localEnv)) additions.push("DATABASE_URL=" + url);
if (!/^SESSION_SECRET=.+$/m.test(localEnv))
  additions.push("SESSION_SECRET=" + randomBytes(32).toString("hex"));
if (!/^NEXT_PUBLIC_SITE_URL=.+$/m.test(localEnv))
  additions.push("NEXT_PUBLIC_SITE_URL=http://localhost:3000");
if (additions.length)
  appendFileSync(".env.local", "\n" + additions.join("\n") + "\n", {
    mode: 0o600,
  });
const fresh = !existsSync(".local-data/postgres/PG_VERSION");
const pg = new EmbeddedPostgres({
  databaseDir: resolve(".local-data/postgres"),
  user: "postgres",
  password: config.password,
  port: config.port,
  persistent: true,
  authMethod: "scram-sha-256",
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: (message) => console.error(message),
});
if (fresh) await pg.initialise();
await pg.start();
if (fresh) await pg.createDatabase("chaim");
console.log(
  "Local PostgreSQL is ready. Connection settings are in ignored .env.local. Keep this process running; use another terminal for npm run db:push and npm run dev.",
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    await pg.stop();
    process.exit(0);
  });
await new Promise(() => {});
