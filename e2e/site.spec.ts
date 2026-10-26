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
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      await expect
        .poll(
          async () => page.evaluate(() => document.documentElement.scrollWidth),
          { message: `${path} at ${width}px` },
        )
        .toBeLessThanOrEqual(width);
    }
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
test("federal tax estimate works and unconfigured booking stays honest", async ({
  page,
}) => {
  await page.goto("/calculators/income-tax");
  await expect(page.locator(".result strong")).toHaveText("$8,770");
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

test("header phone replaces consultation, hero has no duplicate phone and floating box is gone", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("header a.header-phone")).toHaveText(
    "848-223-4073",
  );
  await expect(page.locator('header a[href="/booking"]:visible')).toHaveCount(
    0,
  );
  await expect(page.locator('.hero a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator(".contactfloat, .mobilecall")).toHaveCount(0);
  await expect(page.locator(".hero-picture img")).toHaveAttribute(
    "src",
    "/hero-sunlit-meeting-space.webp",
  );
});
test("all three tax tools recalculate and reset", async ({ page }) => {
  await page.goto("/calculators/income-tax");
  await page
    .getByLabel("Annual ordinary income", { exact: true })
    .fill("100000");
  await expect(page.locator(".result strong")).toHaveText("$13,170");
  await page.getByLabel("Tax year", { exact: true }).selectOption("2025");
  await expect(page.locator(".result strong")).toHaveText("$13,449");
  await page.getByRole("button", { name: "Reset inputs" }).click();
  await expect(page.locator(".result strong")).toHaveText("$8,770");
  await page.goto("/calculators/self-employment");
  await page.getByLabel("Annual net self-employment profit").fill("100000");
  await expect(page.locator(".result strong")).toHaveText("$14,130");
  await page.getByLabel("Your W-2 Social Security wages").fill("184500");
  await expect(page.locator(".result strong")).toHaveText("$2,678");
  await page.goto("/calculators/quarterly-tax");
  await page.getByLabel("Expected full-year federal withholding").fill("4000");
  await expect(page.locator(".result strong")).toHaveText("$1,193");
});
test("ten articles publish without a database and open as complete readable pages", async ({
  page,
}) => {
  await page.goto("/articles");
  await expect(page.locator(".grid>a")).toHaveCount(10);
  await page.getByLabel("Search articles").fill("Savings");
  await expect(page.locator(".grid>a")).toHaveCount(1);
  await page.locator(".grid>a").click();
  await expect(page.locator("article h2").first()).toBeVisible();
  await expect(page.locator("article")).toContainText("expected returns");
  await expect(page.locator("article .articlecover")).toHaveAttribute(
    "src",
    /\.webp$/,
  );
});

test("savings estimates update for zero returns and reset restores inputs", async ({
  page,
}) => {
  await page.goto("/calculators/savings-goal");
  await page.getByLabel("Current savings", { exact: true }).fill("1000");
  await page.getByLabel("Monthly contribution", { exact: true }).fill("0");
  await page
    .getByLabel("Expected annual return (%)", { exact: true })
    .fill("0");
  await expect(page.locator(".result strong")).toHaveText("$1,000");
  await page.getByRole("button", { name: "Reset inputs" }).click();
  await expect(page.getByLabel("Current savings", { exact: true })).toHaveValue(
    "5000",
  );
  await expect(
    page.getByLabel("Monthly contribution", { exact: true }),
  ).toHaveValue("400");
  await expect(page.locator(".result strong")).not.toHaveText("$1,000");
});
