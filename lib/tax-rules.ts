// Deliberately fail closed. An accountant must verify an entire version against IRS sources.
export const taxRules = {
  year: 2026,
  verified: false,
  verifiedAt: null,
  sources: [
    "https://www.irs.gov/filing/federal-income-tax-rates-and-brackets",
    "https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes",
    "https://www.irs.gov/businesses/small-businesses-self-employed/estimated-taxes",
  ],
};
