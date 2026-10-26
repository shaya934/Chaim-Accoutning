"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  federalIncomeTax,
  selfEmploymentTax,
  quarterlyBudget,
  estimatedPaymentDates,
} from "@/lib/calculators";
import {
  taxRules,
  rulesFor,
  filingStatuses,
  type TaxYear,
  type FilingStatus,
} from "@/lib/tax-rules";
const currency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
export default function TaxCalculator({
  kind,
  disclaimer,
}: {
  kind: string;
  disclaimer: string;
}) {
  const [year, setYear] = useState<TaxYear>(2026);
  const [status, setStatus] = useState<FilingStatus>("single");
  const defaults = {
    income: 80000,
    adjustments: 0,
    deduction: 0,
    ssWages: 0,
    medicareWages: 0,
    withheld: 0,
    paid: 0,
    otherTax: 0,
  };
  const [v, setV] = useState(defaults);
  const [useStandard, setStandard] = useState(true);
  const change = (key: keyof typeof defaults, value: string) =>
    setV((old) => ({
      ...old,
      [key]: Math.max(0, Math.min(1e9, Number(value) || 0)),
    }));
  const field = (key: keyof typeof defaults, label: string, help?: string) => (
    <div className="input-group" key={key}>
      <label htmlFor={`tax-${key}`}>{label}</label>
      <input
        id={`tax-${key}`}
        aria-describedby={help ? `tax-${key}-help` : undefined}
        type="number"
        min={0}
        max={1e9}
        step="any"
        value={v[key]}
        onChange={(e) => change(key, e.target.value)}
      />
      {help && <small id={`tax-${key}-help`}>{help}</small>}
    </div>
  );
  const se = selfEmploymentTax(
    v.income,
    v.ssWages,
    v.medicareWages,
    status,
    year,
  );
  const income = federalIncomeTax(
    v.income,
    status,
    year,
    useStandard ? null : v.deduction,
    v.adjustments,
  );
  const quarterly = quarterlyBudget(
    income.tax + v.otherTax,
    v.withheld,
    v.paid,
  );
  const isSE = kind === "self-employment",
    isQuarter = kind === "quarterly-tax";
  const amount = isSE ? se.total : isQuarter ? quarterly.quarterly : income.tax;
  const points = isSE
    ? [
        { name: "Social Security", value: se.socialSecurity },
        { name: "Medicare", value: se.medicare },
        { name: "Additional Medicare", value: se.additionalMedicare },
      ]
    : [
        { name: "Income tax", value: income.tax },
        {
          name: isQuarter ? "Withholding" : "After income tax",
          value: isQuarter ? v.withheld : income.afterTax,
        },
      ];
  return (
    <>
      <div className="calculator-layout">
        <div className="calculator-inputs">
          <h2>
            Let’s put a little clarity
            <br />
            around your numbers.
          </h2>
          <p className="calculator-intro">
            Change an input to see your estimate update. Your numbers stay in
            your browser.
          </p>
          <div className="form">
            <div className="calculator-pair">
              <label>
                Tax year
                <select
                  aria-label="Tax year"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value) as TaxYear)}
                >
                  {taxRules.availableYears.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </label>
              <label>
                Filing status
                <select
                  aria-label="Filing status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FilingStatus)}
                >
                  {Object.entries(filingStatuses).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {field(
              "income",
              isSE
                ? "Annual net self-employment profit"
                : "Annual ordinary income",
              isSE
                ? "Net business profit before self-employment tax."
                : "Before deductions. This model treats income as ordinary income, not capital gains.",
            )}
            {isSE ? (
              <>
                {field(
                  "ssWages",
                  "Your W-2 Social Security wages",
                  "Your own wages only; do not include a spouse’s wages. Usually W-2 box 3.",
                )}
                {field(
                  "medicareWages",
                  "Household Medicare wages",
                  "W-2 Medicare wages relevant to your filing status, including a spouse’s wages on a joint return.",
                )}
              </>
            ) : (
              <>
                {field(
                  "adjustments",
                  "Applicable income adjustments",
                  "Eligible adjustments only. For business income, enter deductible half of SE tax here if applicable.",
                )}
                <label>
                  Deduction method
                  <select
                    aria-label="Deduction method"
                    value={useStandard ? "standard" : "itemized"}
                    onChange={(e) => setStandard(e.target.value === "standard")}
                  >
                    <option value="standard">
                      Basic standard deduction (
                      {currency(rulesFor(year).standardDeduction[status])})
                    </option>
                    <option value="itemized">
                      Enter eligible itemized deductions
                    </option>
                  </select>
                </label>
                {!useStandard &&
                  field("deduction", "Eligible itemized deductions")}
                <small>
                  Basic deduction only: assumes not claimed as a dependent,
                  under 65 and not blind. Married filing separately may require
                  itemization when a spouse itemizes.
                </small>
                {isQuarter && (
                  <>
                    {field(
                      "otherTax",
                      "Other federal taxes to include",
                      "Include your estimated self-employment tax and other taxes not computed by the income-tax model.",
                    )}
                    {field(
                      "withheld",
                      "Expected full-year federal withholding",
                    )}
                    {field("paid", "Estimated payments already made")}
                  </>
                )}
              </>
            )}
            <button
              className="btn light reset-button"
              onClick={() => {
                setV(defaults);
                setYear(2026);
                setStatus("single");
                setStandard(true);
              }}
            >
              Reset inputs
            </button>
          </div>
        </div>
        <div className="calculator-output">
          <div className="result" aria-live="polite">
            <p>
              {isSE
                ? "Estimated self-employment taxes"
                : isQuarter
                  ? "Full-year budget per payment period"
                  : "Estimated federal income tax"}
            </p>
            <strong>{currency(amount)}</strong>
            <span className="estimate-label">
              {year} · {filingStatuses[status]} · Simplified estimate
            </span>
            <dl>
              {(isSE
                ? [
                    ["Net earnings subject to SE tax", currency(se.net)],
                    ["Social Security portion", currency(se.socialSecurity)],
                    ["Medicare portion", currency(se.medicare)],
                    [
                      "Additional Medicare on SE income",
                      currency(se.additionalMedicare),
                    ],
                    [
                      "Deductible half of regular SE tax",
                      currency(se.deductibleHalf),
                    ],
                  ]
                : isQuarter
                  ? [
                      [
                        "Estimated annual federal tax",
                        currency(quarterly.annualTax),
                      ],
                      [
                        "Annual budget after withholding",
                        currency(quarterly.annualPayments),
                      ],
                      ["Payments already made", currency(v.paid)],
                      [
                        "Remaining annual budget",
                        currency(quarterly.remaining),
                      ],
                    ]
                  : [
                      ["Taxable ordinary income", currency(income.taxable)],
                      ["Deduction used", currency(income.deduction)],
                      [
                        "Effective income tax rate",
                        income.effective.toFixed(1) + "%",
                      ],
                      [
                        "Income after federal income tax",
                        currency(income.afterTax),
                      ],
                    ]
              ).map(([k, val]) => (
                <div key={k} style={{ display: "contents" }}>
                  <dt>{k}</dt>
                  <dd>{val}</dd>
                </div>
              ))}
            </dl>
            <div
              className="chart"
              role="img"
              aria-label={points
                .map((p) => `${p.name}: ${currency(p.value)}`)
                .join("; ")}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={points}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 13 }}
                    tickFormatter={(value) =>
                      value === "Additional Medicare"
                        ? "Addl. Med."
                        : value === "Social Security"
                          ? "Social Sec."
                          : value === "After income tax"
                            ? "After tax"
                            : value
                    }
                  />
                  <YAxis width={65} />
                  <Tooltip formatter={(value) => currency(Number(value))} />
                  <Bar dataKey="value" fill="#a1af80" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="calculator-assumptions">
            {disclaimer}{" "}
            {isSE
              ? "Uses 92.35% of net profit, a $400 net-earnings minimum, your own Social Security wage cap, and incremental Additional Medicare on SE income. This covers one self-employed person and excludes optional methods, church employees, RRTA, exempt earnings, and spouse SE income. Additional Medicare already owed on wages is excluded."
              : isQuarter
                ? "Plans 100% of estimated current-year federal liability, after withholding, across four equal periods. This is a full-year budget, not a prior-year safe-harbor or underpayment-penalty calculation. Payments already made reduce the remaining budget, not the original four-period allocation. Do not treat past due dates as future payment opportunities."
                : "Ordinary income only. Excludes credits, preferential capital-gains rates, QBI, AMT, SE/payroll tax, NIIT, new special deductions, and state/local taxes. It is not a complete tax return."}
          </p>
        </div>
      </div>
      {!isSE && !isQuarter && (
        <section className="calculator-breakdown">
          <h2>How the estimate comes together</h2>
          <p>Each rate applies only to the income in that bracket.</p>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Rate</th>
                  <th>Income in bracket</th>
                  <th>Estimated tax</th>
                </tr>
              </thead>
              <tbody>
                {income.breakdown
                  .filter((b) => b.income > 0)
                  .map((b) => (
                    <tr key={b.rate}>
                      <td>{b.rate * 100}%</td>
                      <td>{currency(b.income)}</td>
                      <td>{currency(b.tax)}</td>
                    </tr>
                  ))}
                {income.taxable === 0 && (
                  <tr>
                    <td colSpan={3}>
                      No taxable ordinary income under these assumptions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {isQuarter && (
        <section className="calculator-breakdown">
          <h2>Your planning calendar</h2>
          <p>
            Regular calendar-year federal dates. Disaster relief and individual
            exceptions may change deadlines.
          </p>
          <div className="payment-timeline">
            {estimatedPaymentDates(year).map((date, i) => (
              <div key={date}>
                <small>Payment period {i + 1}</small>
                <b>
                  {new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </b>
                <span>{currency(quarterly.quarterly)}</span>
              </div>
            ))}
          </div>
          <p>
            Safe-harbor rules can produce a different required payment amount.
            Ask Chaim to review prior-year tax, prior-year AGI, uneven income,
            and payment timing before relying on a payment plan.
          </p>
        </section>
      )}
      <details className="calculator-sources">
        <summary>Assumptions, tax year & source notes</summary>
        <p>
          Tax year: {year}. Data cross-check: {taxRules.verifiedAt}, using the
          versioned Policy Simulation Library Tax-Calculator dataset. This does
          not imply a professional review or a complete return. Direct IRS/SSA
          access was unavailable in this development environment; official links
          are provided for further checking.
        </p>
        {taxRules.sources.map((s) => (
          <p key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.label} ↗
            </a>
          </p>
        ))}
      </details>
      <div className="calculator-help">
        <h2>
          A number is a starting point.
          <br />
          <em>A conversation adds perspective.</em>
        </h2>
        <p>
          Have questions about your results? Chaim Gesteter can help you
          understand your financial situation.
        </p>
        <Link className="btn" href="/booking">
          Book an Appointment ↗
        </Link>
      </div>
    </>
  );
}
