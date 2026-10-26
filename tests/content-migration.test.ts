import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeSettings } from "../lib/settings";
import { defaults } from "../lib/content";
test("existing business settings and drafts survive addition of ten public articles", () => {
  const old = {
    businessName: "Existing owner name",
    articles: [
      {
        ...defaults.articles[0],
        slug: "owner-draft",
        title: "Owner draft",
        published: false,
        reviewedAt: "",
      },
    ],
  };
  const merged = mergeSettings(old);
  assert.equal(merged.businessName, "Existing owner name");
  assert.equal(merged.articles.length, 11);
  assert.equal(
    merged.articles.find((a) => a.slug === "owner-draft")?.published,
    false,
  );
});
test("saved edits and unpublication override a bundled article rather than duplicate it", () => {
  const article = {
    ...defaults.articles[0],
    title: "Edited title",
    published: false,
  };
  const merged = mergeSettings({ articles: [article] });
  assert.equal(merged.articles.length, 10);
  assert.equal(
    merged.articles.find((a) => a.slug === article.slug)?.published,
    false,
  );
  assert.equal(
    merged.articles.find((a) => a.slug === article.slug)?.title,
    "Edited title",
  );
});
test("after migration a deliberate empty resource center remains empty", () =>
  assert.equal(
    mergeSettings({ contentVersion: 2, articles: [] }).articles.length,
    0,
  ));
