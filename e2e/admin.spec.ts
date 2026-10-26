import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
test("authenticated dashboard imports, edits, and saves drafts without publishing", async ({
  page,
}) => {
  test.skip(
    !process.env.TEST_ADMIN_CREDENTIALS_FILE,
    "Requires a disposable configured test instance.",
  );
  const credentials = JSON.parse(
    readFileSync(process.env.TEST_ADMIN_CREDENTIALS_FILE!, "utf8"),
  );
  await page.goto("/admin");
  await page.getByLabel("Email", { exact: true }).fill(credentials.email);
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome to your workspace." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Articles", exact: true }).click();
  await page.getByRole("button", { name: "Import starter drafts" }).click();
  await expect(
    page.getByLabel("Choose an article").locator("option"),
  ).toHaveCount(22);
  await page
    .getByRole("button", { name: "Save website changes", exact: true })
    .first()
    .click();
  await expect(page.getByRole("status")).toHaveText("Changes saved.");
  await page.goto("/articles");
  await expect(
    page.getByRole("heading", {
      name: "A Calmer Monthly Money Routine for Your Small Business",
    }),
  ).toBeVisible();
  await page.goto("/admin");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
});
test("contact form saves a real inquiry and gives a real confirmation", async ({
  page,
}) => {
  test.skip(
    !process.env.TEST_ADMIN_CREDENTIALS_FILE,
    "Requires a disposable configured test instance.",
  );
  await page.goto("/contact");
  await page.getByLabel("Name", { exact: true }).fill("Browser test");
  await page
    .getByLabel("Email", { exact: true })
    .fill("browser@example.invalid");
  await page
    .getByLabel("Message", { exact: true })
    .fill("Browser test inquiry. Not a real client request.");
  await page.getByRole("button", { name: "Send your message" }).click();
  await expect(page.locator("form p[role=status]")).toContainText(
    "Your message has been received",
  );
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("");
});
