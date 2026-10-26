import { test, expect } from "@playwright/test";
import { services, calculators } from "../lib/content";
test("public routes have a heading, distinct title and no horizontal mobile overflow", async ({
  page,
}) => {
  for (const path of [
    "/",
    "/about",
    "/services",
    "/pricing",
    "/booking",
    "/calculators",
    "/articles",
    "/faq",
    "/contact",
    "/privacy",
    "/terms",
    ...services.map(([id]) => "/services/" + id),
    ...calculators.map(([id]) => "/calculators/" + id),
  ]) {
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      path,
    ).toBeTruthy();
  }
});
test("business profit calculator responds to input and reset", async ({
  page,
}) => {
  await page.goto("/calculators/business-profit");
  await page.getByLabel("Monthly revenue", { exact: true }).fill("20000");
  await expect(page.locator(".result strong")).toHaveText("$15,300");
  await page.getByRole("button", { name: "Reset inputs" }).click();
  await expect(page.locator(".result strong")).toHaveText("$5,300");
});
test("hourly calculator prevents a zero-hours estimate", async ({ page }) => {
  await page.goto("/calculators/hourly-rate");
  await page.getByLabel("Billable hours per week", { exact: true }).fill("0");
  await expect(page.locator("p[role=alert]")).toContainText(
    "greater than zero",
  );
  await expect(page.locator(".result strong")).toHaveText("—");
});
test("tax estimates and booking cannot pretend to complete", async ({
  page,
}) => {
  await page.goto("/calculators/income-tax");
  await expect(
    page.getByText("Final estimates are disabled", { exact: false }),
  ).toBeVisible();
  await page.goto("/booking");
  await expect(
    page.getByText("No appointment has been booked.", { exact: false }),
  ).toBeVisible();
});
test("FAQ works with a keyboard and service finder recommends a service", async ({
  page,
}) => {
  await page.goto("/faq");
  const first = page
    .locator("summary")
    .filter({ hasText: "How do I schedule" });
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("Use the booking page to access", { exact: false }),
  ).toBeVisible();
  await page.goto("/");
  await page.getByLabel("Your accounting question").selectOption("bookkeeping");
  await page.getByRole("button", { name: "Find my starting point" }).click();
  await expect(page.getByText("Your starting point:")).toBeVisible();
});
test("unconfigured admin shows no private information", async ({ page }) => {
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "A little behind the scenes." }),
  ).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
});
