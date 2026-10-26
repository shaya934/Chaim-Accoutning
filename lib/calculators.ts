export function profit(revenue: number, expenses: number[]) {
  const total = expenses.reduce((a, b) => a + b, 0);
  return {
    expenses: total,
    monthly: revenue - total,
    annual: (revenue - total) * 12,
    margin: revenue > 0 ? ((revenue - total) / revenue) * 100 : 0,
  };
}
export function hourly(
  income: number,
  expenses: number,
  weeks: number,
  hours: number,
) {
  if (weeks <= 0 || hours <= 0)
    throw new Error("Weeks and billable hours must be greater than zero.");
  return {
    rate: (income + expenses) / (weeks * hours),
    monthly: (income + expenses) / 12,
    weekly: (income + expenses) / weeks,
  };
}
export function savings(
  goal: number,
  current: number,
  contribution: number,
  rate: number,
  months: number,
) {
  const r = rate / 1200;
  const growth = (n: number) => (r === 0 ? 1 : Math.pow(1 + r, n));
  const future = (n: number) =>
    current * growth(n) + contribution * (r === 0 ? n : (growth(n) - 1) / r);
  const factor = r === 0 ? months : (growth(months) - 1) / r;
  const needed =
    months > 0 ? Math.max(0, (goal - current * growth(months)) / factor) : null;
  let time: number | null = current >= goal ? 0 : null;
  for (let m = 1; time === null && m <= 1200; m++)
    if (future(m) >= goal) time = m;
  return {
    projected: future(months),
    needed,
    months: time,
    points: Array.from({ length: 13 }, (_, i) => ({
      month: Math.round((months * i) / 12),
      balance: Math.round(future(Math.round((months * i) / 12))),
    })),
  };
}

import { rulesFor, type TaxYear, type FilingStatus } from "./tax-rules";
const nonnegative = (value: number) => {
  if (!Number.isFinite(value)) throw new Error("Enter a finite number");
  return Math.max(0, value);
};
export function federalIncomeTax(
  income: number,
  status: FilingStatus,
  year: TaxYear,
  itemized: number | null = null,
  adjustments = 0,
) {
  const rules = rulesFor(year);
  const gross = nonnegative(income);
  const deduction =
    itemized === null ? rules.standardDeduction[status] : nonnegative(itemized);
  const taxable = Math.max(0, gross - nonnegative(adjustments) - deduction);
  let lower = 0,
    total = 0;
  const breakdown = rules.rates.map((rate, i) => {
    const upper = rules.brackets[status][i] ?? Infinity;
    const portion = Math.max(0, Math.min(taxable, upper) - lower);
    const tax = portion * rate;
    const row = {
      rate,
      lower,
      upper: Number.isFinite(upper) ? upper : null,
      income: portion,
      tax,
    };
    total += tax;
    lower = upper;
    return row;
  });
  return {
    tax: total,
    taxable,
    deduction,
    afterTax: gross - total,
    effective: gross > 0 ? (total / gross) * 100 : 0,
    breakdown,
  };
}
export function selfEmploymentTax(
  profit: number,
  ssWages: number,
  medicareWages: number,
  status: FilingStatus,
  year: TaxYear,
) {
  const r = rulesFor(year);
  const raw = nonnegative(profit) * r.netEarningsFactor;
  const net = raw < r.minimumNetEarnings ? 0 : raw;
  const socialSecurity =
    Math.min(
      net,
      Math.max(0, r.socialSecurityWageBase - nonnegative(ssWages)),
    ) * r.ssRate;
  const medicare = net * r.medicareRate;
  // Only the incremental Additional Medicare attributable to SE income is shown.
  const additionalMedicare =
    Math.max(
      0,
      net -
        Math.max(
          0,
          r.additionalMedicareThreshold[status] - nonnegative(medicareWages),
        ),
    ) * r.additionalMedicareRate;
  return {
    net,
    socialSecurity,
    medicare,
    additionalMedicare,
    total: socialSecurity + medicare + additionalMedicare,
    deductibleHalf: (socialSecurity + medicare) / 2,
  };
}
export function quarterlyBudget(
  annualTax: number,
  withheld: number,
  paid: number,
) {
  const tax = nonnegative(annualTax),
    withholding = nonnegative(withheld),
    alreadyPaid = nonnegative(paid);
  return {
    annualTax: tax,
    annualPayments: Math.max(0, tax - withholding),
    quarterly: Math.max(0, tax - withholding) / 4,
    remaining: Math.max(0, tax - withholding - alreadyPaid),
  };
}
export function estimatedPaymentDates(year: TaxYear) {
  // Calendar-year regular schedule; weekend adjustment for the supported years.
  return year === 2025
    ? ["2025-04-15", "2025-06-16", "2025-09-15", "2026-01-15"]
    : ["2026-04-15", "2026-06-15", "2026-09-15", "2027-01-15"];
}
