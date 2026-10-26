import { test } from "node:test";
import assert from "node:assert/strict";
import { scryptSync } from "node:crypto";
import { validPassword, sameOrigin, issueSession } from "../lib/auth";
import { jwtVerify } from "jose";
import { settingsSchema } from "../lib/settings-schema";
import { defaults } from "../lib/content";
import articles from "../lib/articles.json";
test("password verification rejects wrong passwords and missing configuration", () => {
  process.env.ADMIN_PASSWORD_HASH =
    "test-salt:" + scryptSync("correct", "test-salt", 64).toString("hex");
  assert.equal(validPassword("correct"), true);
  assert.equal(validPassword("incorrect"), false);
  delete process.env.ADMIN_PASSWORD_HASH;
  assert.equal(validPassword("anything"), false);
});
test("CSRF origin must match configured canonical origin", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
  assert.equal(
    sameOrigin(
      new Request("https://example.com", {
        headers: { origin: "https://evil.com" },
      }),
    ),
    false,
  );
  assert.equal(
    sameOrigin(
      new Request("https://example.com", {
        headers: { origin: "https://example.com" },
      }),
    ),
    true,
  );
});
test("signed admin session has restricted issuer audience and expiry", async () => {
  process.env.SESSION_SECRET = "x".repeat(32);
  const token = await issueSession();
  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(process.env.SESSION_SECRET),
    { issuer: "chaim-accounting", audience: "admin" },
  );
  assert.equal(payload.role, "admin");
  assert.equal(payload.exp! - payload.iat!, 14400);
  await assert.rejects(
    jwtVerify(
      token + "tamper",
      new TextEncoder().encode(process.env.SESSION_SECRET),
    ),
  );
});
test("default content valid and booking rejects malicious schemes", () => {
  assert.equal(settingsSchema.safeParse(defaults).success, true);
  for (const bookingUrl of [
    "javascript:alert(1)",
    "https://calendly.com.evil.com/event",
    "https://evil.com/event",
  ])
    assert.equal(
      settingsSchema.safeParse({ ...defaults, bookingUrl }).success,
      false,
    );
  assert.equal(
    settingsSchema.safeParse({
      ...defaults,
      bookingUrl: "https://calendly.com/owner/consultation",
    }).success,
    true,
  );
});
test("publishing requires a review and unique slugs", () => {
  const article = {
    slug: "test",
    title: "Test",
    body: "Body",
    category: "Business",
    image: "",
    published: true,
    reviewedAt: "",
  };
  assert.equal(
    settingsSchema.safeParse({ ...defaults, articles: [article] }).success,
    false,
  );
  assert.equal(
    settingsSchema.safeParse({
      ...defaults,
      articles: [{ ...article, reviewedAt: "2026-10-25" }],
    }).success,
    true,
  );
});
test("12 distinct complete unpublished starter drafts", () => {
  assert.equal(articles.length, 12);
  assert.equal(new Set(articles.map((a) => a.slug)).size, 12);
  for (const a of articles) {
    const words = a.sections
      .map((s) => s[1])
      .join(" ")
      .split(/\s+/).length;
    assert.ok(words >= 600 && words <= 1000, `${a.title}: ${words} words`);
    assert.equal(a.published, false);
  }
});

test("Vercel preview origins are accepted only from trusted deployment metadata", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://accounting.example";
  process.env.VERCEL_URL = "accounting-preview.vercel.app";
  assert.equal(
    sameOrigin(
      new Request("https://accounting-preview.vercel.app", {
        headers: { origin: "https://accounting-preview.vercel.app" },
      }),
    ),
    true,
  );
  assert.equal(
    sameOrigin(
      new Request("https://accounting-preview.vercel.app", {
        headers: { origin: "https://unrelated.vercel.app" },
      }),
    ),
    false,
  );
  delete process.env.VERCEL_URL;
});
