import { test } from "node:test";
import assert from "node:assert/strict";
import {
  federalIncomeTax,
  selfEmploymentTax,
  quarterlyBudget,
  estimatedPaymentDates,
} from "../lib/calculators";
import { rulesFor } from "../lib/tax-rules";
import { defaults } from "../lib/content";
const near = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 0.00001, `${actual} != ${expected}`);
test("2026 single ordinary income applies progressive brackets after basic deduction", () => {
  const r = federalIncomeTax(80000, "single", 2026);
  assert.equal(r.deduction, 16100);
  assert.equal(r.taxable, 63900);
  near(r.tax, 8770);
  assert.equal(r.afterTax, 71230);
});
test("2025 single reflects the updated standard deduction", () => {
  const r = federalIncomeTax(80000, "single", 2025);
  assert.equal(r.deduction, 15750);
  // $1,192.50 + $4,386.00 + $3,470.50 = $9,049.00.
  near(r.tax, 9049);
});
test("2026 joint brackets and deduction scale consistently", () => {
  near(federalIncomeTax(160000, "joint", 2026).tax, 17540);
});
test("all supported statuses and years handle exact bracket edges", () => {
  for (const year of [2025, 2026] as const) {
    const r = rulesFor(year);
    for (const status of ["single", "joint", "separate", "head"] as const) {
      let lower = 0,
        expected = 0;
      for (let i = 0; i < r.brackets[status].length; i++) {
        const upper = r.brackets[status][i];
        expected += (upper - lower) * r.rates[i];
        near(
          federalIncomeTax(upper + r.standardDeduction[status], status, year)
            .tax,
          expected,
        );
        near(
          federalIncomeTax(
            upper + r.standardDeduction[status] + 1,
            status,
            year,
          ).tax,
          expected + r.rates[i + 1],
        );
        lower = upper;
      }
    }
  }
});
test("zero income, negative profit, adjustments, and itemized deduction zero are distinct", () => {
  assert.equal(federalIncomeTax(0, "single", 2026).effective, 0);
  assert.equal(federalIncomeTax(15000, "single", 2026).tax, 0);
  assert.equal(federalIncomeTax(10000, "single", 2026, 0).tax, 1000);
  assert.equal(federalIncomeTax(20000, "single", 2026, null, 3900).tax, 0);
  assert.equal(selfEmploymentTax(-100, 0, 0, "single", 2026).total, 0);
  assert.throws(() => federalIncomeTax(NaN, "single", 2026));
});
test("SE tax uses 92.35 percent and a net-earnings threshold of $400", () => {
  const r = selfEmploymentTax(100000, 0, 0, "single", 2026);
  near(r.net, 92350);
  near(r.socialSecurity, 11451.4);
  near(r.medicare, 2678.15);
  near(r.total, 14129.55);
  near(r.deductibleHalf, 7064.775);
  assert.equal(selfEmploymentTax(400, 0, 0, "single", 2026).total, 0);
  assert.ok(
    selfEmploymentTax(400 / 0.9235 + 0.001, 0, 0, "single", 2026).total > 0,
  );
});
test("Social Security wages exhaust only their own cap, Medicare remains uncapped", () => {
  const r = selfEmploymentTax(100000, 184500, 184500, "single", 2026);
  assert.equal(r.socialSecurity, 0);
  near(r.medicare, 2678.15);
  near(r.additionalMedicare, (92350 - 15500) * 0.009);
  const y25 = selfEmploymentTax(300000, 0, 0, "joint", 2025);
  near(y25.socialSecurity, 176100 * 0.124);
  near(y25.additionalMedicare, (277050 - 250000) * 0.009);
});
test("additional Medicare wage-only liability is not incorrectly charged to SE income", () => {
  assert.equal(
    selfEmploymentTax(0, 184500, 300000, "single", 2026).additionalMedicare,
    0,
  );
  near(
    selfEmploymentTax(100000, 184500, 300000, "single", 2026)
      .additionalMedicare,
    92350 * 0.009,
  );
});
test("quarterly budget accounts for withholding and prior payments without suggesting negatives", () => {
  assert.deepEqual(quarterlyBudget(12000, 4000, 2000), {
    annualTax: 12000,
    annualPayments: 8000,
    quarterly: 2000,
    remaining: 6000,
  });
  assert.equal(quarterlyBudget(100, 200, 500).remaining, 0);
  assert.equal(quarterlyBudget(0, 0, 0).quarterly, 0);
});
test("regular payment calendar includes June 2025 weekend adjustment", () => {
  assert.deepEqual(estimatedPaymentDates(2025), [
    "2025-04-15",
    "2025-06-16",
    "2025-09-15",
    "2026-01-15",
  ]);
  assert.equal(estimatedPaymentDates(2026)[3], "2027-01-15");
});
test("ten distinct public articles meet length, image, publication, and review requirements", () => {
  assert.equal(defaults.articles.length, 10);
  assert.equal(new Set(defaults.articles.map((a) => a.slug)).size, 10);
  for (const a of defaults.articles) {
    assert.equal(a.published, true);
    assert.ok(a.reviewedAt);
    assert.ok(a.image.endsWith(".webp"));
    assert.ok(a.body.split(/\s+/).length >= 600);
  }
});
