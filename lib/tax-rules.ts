import data from "./data/federal-tax.json";
import verification from "./data/tax-verification.json";
export type TaxYear = 2025 | 2026;
export type FilingStatus = "single" | "joint" | "separate" | "head";
export const filingStatuses: Record<FilingStatus, string> = {
  single: "Single",
  joint: "Married filing jointly",
  separate: "Married filing separately",
  head: "Head of household",
};
export const taxRules = {
  year: 2026,
  availableYears: [2026, 2025] as TaxYear[],
  verified: true,
  verifiedAt: verification.checkedAt,
  verification,
  data,
  sources: [
    {
      label: "Versioned Tax-Calculator policy data",
      url: verification.dataSource,
    },
    {
      label: "IRS federal income tax guidance",
      url: "https://www.irs.gov/filing/federal-income-tax-rates-and-brackets",
    },
    {
      label: "IRS self-employment guidance",
      url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes",
    },
    {
      label: "IRS estimated payment guidance",
      url: "https://www.irs.gov/businesses/small-businesses-self-employed/estimated-taxes",
    },
  ],
};
export function rulesFor(year: TaxYear) {
  const r = data[String(year) as "2025" | "2026"];
  if (!r) throw new Error("Unsupported tax year");
  return r;
}
