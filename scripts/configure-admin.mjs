import { createInterface } from "node:readline/promises";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes, scryptSync } from "node:crypto";
if (!process.stdin.isTTY)
  throw Error(
    "Run in an interactive terminal; passwords are never accepted as command-line arguments.",
  );
const rl = createInterface({ input: process.stdin, output: process.stdout });
const email = (await rl.question("Administrator email: ")).trim();
rl.close();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  throw Error("Enter a valid email.");
process.stdout.write(
  "Administrator password (minimum 14 characters, hidden): ",
);
const password = await new Promise((resolve, reject) => {
  let value = "";
  process.stdin.setRawMode(true);
  process.stdin.resume();
  const listener = (chunk) => {
    for (const c of chunk.toString()) {
      if (c === "\u0003") {
        cleanup();
        reject(Error("Cancelled"));
        return;
      }
      if (c === "\r" || c === "\n") {
        cleanup();
        resolve(value);
        return;
      }
      if (c === "\u007f") {
        value = value.slice(0, -1);
      } else if (c >= " ") value += c;
    }
  };
  const cleanup = () => {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdin.removeListener("data", listener);
  };
  process.stdin.on("data", listener);
});
process.stdout.write("\n");
if (password.length < 14 || password.length > 256)
  throw Error("Password must be 14–256 characters.");
let text = existsSync(".env.local") ? readFileSync(".env.local", "utf8") : "";
const salt = randomBytes(16).toString("hex");
const bindings = {
  ADMIN_EMAIL: email,
  ADMIN_PASSWORD_HASH:
    salt + ":" + scryptSync(password, salt, 64).toString("hex"),
  SESSION_SECRET: randomBytes(32).toString("hex"),
};
for (const [key, value] of Object.entries(bindings)) {
  const line = key + "=" + value;
  const pattern = new RegExp("^" + key + "=.*$", "m");
  text = pattern.test(text) ? text.replace(pattern, line) : text + "\n" + line;
}
writeFileSync(".env.local", text + "\n", { mode: 0o600 });
console.log(
  "Administrator configured in ignored .env.local. Existing sessions are revoked. Restart the app. For deployment, transfer bindings through secure environment settings.",
);
