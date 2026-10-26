import { test } from "node:test";
import assert from "node:assert/strict";
import { profit, hourly, savings } from "../lib/calculators";
import { taxRules } from "../lib/tax-rules";
test("profit includes all costs and annualizes", () => {
  assert.deepEqual(profit(10000, [2000, 1000, 500]), {
    expenses: 3500,
    monthly: 6500,
    annual: 78000,
    margin: 65,
  });
});
test("loss and zero revenue remain finite", () => {
  assert.equal(profit(0, [50]).margin, 0);
  assert.equal(profit(10, [50]).monthly, -40);
});
test("hourly uses billable hours", () => {
  assert.equal(hourly(80000, 20000, 50, 20).rate, 100);
  assert.throws(() => hourly(1, 1, 0, 2));
});
test("savings zero interest and monthly contributions", () => {
  const r = savings(1200, 0, 100, 0, 12);
  assert.equal(r.projected, 1200);
  assert.equal(r.needed, 100);
  assert.equal(r.months, 12);
});
test("savings compound at month end", () => {
  assert.ok(
    Math.abs(savings(2000, 1000, 100, 12, 2).projected - 1221.1) < 0.001,
  );
});
test("unreachable goals and passed goals", () => {
  assert.equal(savings(1, 0, 0, 0, 12).months, null);
  assert.equal(savings(1, 10, 0, 0, 12).months, 0);
  assert.equal(savings(1, 0, 0, 0, 0).needed, null);
});
test("unverified tax rules cannot produce public estimates", () =>
  assert.equal(taxRules.verified, false));
