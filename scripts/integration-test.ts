import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Pool } from "pg";
import { defaults } from "../lib/content";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
if (!process.env.TEST_ADMIN_CREDENTIALS_FILE || !process.env.DATABASE_URL)
  throw Error(
    "Use a dedicated test database and TEST_ADMIN_CREDENTIALS_FILE containing test email/password.",
  );
const credentials = JSON.parse(
  readFileSync(process.env.TEST_ADMIN_CREDENTIALS_FILE, "utf8"),
);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
let cookie = "";
async function post(path: string, data: unknown, origin = base, auth = true) {
  return fetch(base + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      ...(auth ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(data),
  });
}
let id = "";
try {
  assert.equal(
    (
      await post(
        "/api/admin/content",
        { action: "save", settings: defaults },
        base,
        false,
      )
    ).status,
    403,
  );
  assert.equal(
    (await post("/api/admin/login", credentials, "https://evil.invalid"))
      .status,
    403,
  );
  assert.equal(
    (await post("/api/admin/login", { ...credentials, password: "incorrect" }))
      .status,
    401,
  );
  const login = await post("/api/admin/login", credentials);
  assert.equal(login.status, 200);
  cookie = login.headers.get("set-cookie")!.split(";")[0];
  assert.ok(login.headers.get("set-cookie")!.includes("HttpOnly"));
  assert.ok(login.headers.get("set-cookie")!.includes("Secure"));
  assert.equal((await post("/api/contact", { name: "x" })).status, 400);
  assert.equal(
    (
      await post("/api/contact", {
        name: "Test",
        email: "test@example.invalid",
        phone: "",
        service: "Testing",
        message: "integration test message",
        website: "bot.example",
      })
    ).status,
    400,
  );
  const contact = await post("/api/contact", {
    name: "Integration Test",
    email: "integration@example.invalid",
    phone: "",
    service: "Testing",
    message: "Integration test message. Not a real inquiry.",
  });
  assert.equal(contact.status, 201);
  const records = await pool.query("SELECT id FROM inquiry WHERE email=$1", [
    "integration@example.invalid",
  ]);
  assert.equal(records.rows.length, 1);
  id = records.rows[0].id;
  assert.equal(
    (await post("/api/admin/content", { action: "address", id })).status,
    200,
  );
  assert.equal(
    (await pool.query("SELECT addressed FROM inquiry WHERE id=$1", [id]))
      .rows[0].addressed,
    true,
  );
  assert.equal(
    (
      await post("/api/admin/content", {
        action: "save",
        settings: { ...defaults, businessName: "Integration Test Accounting" },
      })
    ).status,
    200,
  );
  assert.ok(
    (await (await fetch(base + "/about")).text()).includes(
      "Integration Test Accounting",
    ),
  );
  assert.equal(
    (
      await post("/api/admin/content", {
        action: "save",
        settings: { ...defaults, bookingUrl: "javascript:alert(1)" },
      })
    ).status,
    400,
  );
  const form = new FormData();
  form.append(
    "image",
    new File([Buffer.from("not an image")], "bad.svg", {
      type: "image/svg+xml",
    }),
  );
  assert.equal(
    (
      await fetch(base + "/api/admin/images", {
        method: "POST",
        headers: { Origin: base, Cookie: cookie },
        body: form,
      })
    ).status,
    400,
  );
  const png = new FormData();
  png.append(
    "image",
    new File(
      [
        Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j4ZkAAAAASUVORK5CYII=",
          "base64",
        ),
      ],
      "test.png",
      { type: "image/png" },
    ),
  );
  const upload = await fetch(base + "/api/admin/images", {
    method: "POST",
    headers: { Origin: base, Cookie: cookie },
    body: png,
  });
  assert.equal(upload.status, 200);
  const { url } = await upload.json();
  const image = await fetch(base + url);
  assert.equal(image.headers.get("content-type"), "image/png");
  await pool.query("DELETE FROM content WHERE id=$1", [url.split("/").pop()]);
  assert.equal(
    (await post("/api/admin/content", { action: "delete", id })).status,
    200,
  );
  id = "";
  assert.equal((await post("/api/admin/logout", {})).status, 200);
  console.log(
    "PASS: auth, CSRF, cookie flags, validation, bot rejection, inquiry persistence/address/delete, settings persistence, image validation/upload/read, logout.",
  );
} finally {
  if (id) await pool.query("DELETE FROM inquiry WHERE id=$1", [id]);
  await pool.query("DELETE FROM content WHERE id='settings'");
  await pool.query("DELETE FROM rate_limit");
  await pool.end();
}
