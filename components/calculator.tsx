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
  LineChart,
  Line,
} from "recharts";
import { profit, hourly, savings } from "@/lib/calculators";
import { taxRules } from "@/lib/tax-rules";
const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
export default function Calculator({
  kind,
  disclaimer,
}: {
  kind: string;
  disclaimer: string;
}) {
  const [values, setValues] = useState<Record<string, number>>({
    revenue: 10000,
    payroll: 2500,
    rent: 1000,
    utilities: 200,
    marketing: 300,
    insurance: 200,
    other: 500,
    income: 80000,
    expenses: 15000,
    weeks: 48,
    hours: 25,
    goal: 30000,
    current: 5000,
    contribution: 400,
    rate: 4,
    months: 36,
  });
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");
  const change = (key: string, value: string) =>
    setValues((v) => ({
      ...v,
      [key]: Math.max(0, Math.min(1e10, Number(value) || 0)),
    }));
  const field = (key: string, label: string, max?: number) => (
    <label key={key}>
      {label}
      <input
        type="number"
        value={values[key]}
        min={0}
        max={max}
        step="any"
        onChange={(e) => change(key, e.target.value)}
      />
      {max && (
        <input
          aria-label={`${label} slider`}
          type="range"
          min={0}
          max={max}
          value={values[key]}
          onChange={(e) => change(key, e.target.value)}
        />
      )}
    </label>
  );
  const tax = ["income-tax", "self-employment", "quarterly-tax"].includes(kind);
  let rows: [string, string][] = [];
  let amount = 0;
  let points: { name: string; value: number }[] = [];
  let growth: { month: number; balance: number }[] = [];
  if (kind === "business-profit") {
    const r = profit(values.revenue, [
      values.payroll,
      values.rent,
      values.utilities,
      values.marketing,
      values.insurance,
      values.other,
    ]);
    amount = r.monthly;
    rows = [
      ["Monthly expenses", money(r.expenses)],
      ["Annualized operating profit", money(r.annual)],
      ["Operating profit margin", r.margin.toFixed(1) + "%"],
    ];
    points = [
      { name: "Revenue", value: values.revenue },
      { name: "Expenses", value: r.expenses },
      { name: "Profit", value: r.monthly },
    ];
  }
  if (kind === "hourly-rate" && values.weeks > 0 && values.hours > 0) {
    const r = hourly(
      values.income,
      values.expenses,
      values.weeks,
      values.hours,
    );
    amount = r.rate;
    rows = [
      ["Monthly revenue target", money(r.monthly)],
      ["Weekly revenue target", money(r.weekly)],
    ];
    points = [
      { name: "Desired income", value: values.income },
      { name: "Expenses", value: values.expenses },
    ];
  }
  if (kind === "savings-goal") {
    const r = savings(
      values.goal,
      values.current,
      values.contribution,
      Math.min(values.rate, 30),
      Math.min(values.months, 600),
    );
    amount = r.projected;
    rows = [
      [
        "Monthly contribution needed",
        r.needed === null ? "Select a future target date" : money(r.needed),
      ],
      [
        "Estimated time to goal",
        r.months === null
          ? "Not reached within 100 years"
          : `${r.months} months`,
      ],
    ];
    growth = r.points;
  }
  return (
    <>
      <div className="split">
        <div className="card">
          <h2 style={{ fontSize: 26, marginTop: 0 }}>
            Let’s explore your numbers.
          </h2>
          <div className="form">
            {kind === "business-profit" &&
              [
                ["revenue", "Monthly revenue"],
                ["payroll", "Payroll"],
                ["rent", "Rent"],
                ["utilities", "Utilities"],
                ["marketing", "Marketing"],
                ["insurance", "Insurance"],
                ["other", "Other operating expenses"],
              ].map(([k, l]) => field(k, l))}
            {kind === "hourly-rate" && (
              <>
                {field("income", "Desired annual income")}
                {field("expenses", "Annual business expenses")}
                {field("weeks", "Working weeks per year", 52)}
                {field("hours", "Billable hours per week", 80)}
                {(!values.weeks || !values.hours) && (
                  <p role="alert">
                    Weeks and billable hours must be greater than zero.
                  </p>
                )}
              </>
            )}
            {kind === "savings-goal" && (
              <>
                {field("goal", "Savings goal")}
                {field("current", "Current savings")}
                {field("contribution", "Monthly contribution")}
                {field("rate", "Expected annual return (%)", 30)}
                <label>
                  Target date
                  <input
                    type="date"
                    value={target}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => {
                      setTarget(e.target.value);
                      const days =
                        (new Date(e.target.value + "T12:00:00").getTime() -
                          Date.now()) /
                        86400000;
                      if (days <= 0) {
                        setError("Choose a future date.");
                        return;
                      }
                      setError("");
                      change(
                        "months",
                        String(Math.max(1, Math.ceil(days / 30.4375))),
                      );
                    }}
                  />
                </label>
                {!target && (
                  <p>
                    Default projection: 36 months. Choose a target date to
                    adjust it.
                  </p>
                )}
                {error && <p role="alert">{error}</p>}
              </>
            )}
            {tax && (
              <>
                <label>
                  Tax year
                  <select disabled>
                    <option>{taxRules.year} — verification required</option>
                  </select>
                </label>
                <label>
                  {kind === "self-employment"
                    ? "Annual net self-employment profit"
                    : "Estimated annual income"}
                  <input type="number" min="0" />
                </label>
                {kind !== "self-employment" && (
                  <label>
                    Filing status
                    <select>
                      <option>Single</option>
                      <option>Married filing jointly</option>
                      <option>Married filing separately</option>
                      <option>Head of household</option>
                    </select>
                  </label>
                )}
                <label>
                  {kind === "self-employment"
                    ? "Relevant wage income"
                    : "Expected deductions"}
                  <input type="number" min="0" />
                </label>
                {kind === "income-tax" && (
                  <label>
                    Applicable adjustments
                    <input type="number" min="0" />
                  </label>
                )}
                {kind === "quarterly-tax" && (
                  <>
                    <label>
                      Tax already withheld
                      <input type="number" min="0" />
                    </label>
                    <label>
                      Prior-year tax liability
                      <input type="number" min="0" />
                    </label>
                  </>
                )}
              </>
            )}
            <button
              className="btn light"
              onClick={() => {
                setValues({
                  revenue: 10000,
                  payroll: 2500,
                  rent: 1000,
                  utilities: 200,
                  marketing: 300,
                  insurance: 200,
                  other: 500,
                  income: 80000,
                  expenses: 15000,
                  weeks: 48,
                  hours: 25,
                  goal: 30000,
                  current: 5000,
                  contribution: 400,
                  rate: 4,
                  months: 36,
                });
                setTarget("");
                setError("");
              }}
            >
              Reset inputs
            </button>
          </div>
        </div>
        <div>
          {tax ? (
            <div className="result">
              <h2 style={{ fontSize: 28 }}>Accuracy comes first.</h2>
              <p>
                Final estimates are disabled until this year’s tax rules have
                been verified.
              </p>
              <div className="notice">
                Tax year: {taxRules.year}
                <br />
                Last verification: not yet verified
                <br />
                Configuration required: tax brackets, deductions, wage bases,
                filing thresholds, safe-harbor rules, and payment deadlines.
              </div>
              <p>
                We won’t guess at your tax obligations. Call Chaim to discuss
                your circumstances.
              </p>
              {taxRules.sources.map((url) => (
                <p key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "underline" }}
                  >
                    Review IRS guidance ↗
                  </a>
                </p>
              ))}
            </div>
          ) : (
            <div className="result" aria-live="polite">
              <p>
                {kind === "business-profit"
                  ? "Monthly operating profit"
                  : kind === "hourly-rate"
                    ? "Minimum hourly billing rate"
                    : "Projected savings at target"}
              </p>
              <strong>
                {kind === "hourly-rate" && (!values.weeks || !values.hours)
                  ? "—"
                  : money(amount)}
              </strong>
              <dl>
                {rows.map(([k, v]) => (
                  <div key={k} style={{ display: "contents" }}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div
                className="chart"
                role="img"
                aria-label={
                  kind === "savings-goal"
                    ? "Projected savings growth over the selected period"
                    : points
                        .map((p) => `${p.name}: ${money(p.value)}`)
                        .join("; ")
                }
              >
                <ResponsiveContainer width="100%" height="100%">
                  {growth.length ? (
                    <LineChart data={growth}>
                      <XAxis dataKey="month" />
                      <YAxis width={65} />
                      <Tooltip />
                      <Line
                        dataKey="balance"
                        stroke="#17695f"
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={points}>
                      <XAxis dataKey="name" />
                      <YAxis width={65} />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#17695f"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}
          <div className="notice">
            {disclaimer}{" "}
            {kind === "savings-goal"
              ? "Assumes fixed returns compounded monthly and contributions at month end. Returns are not guaranteed. Inflation, fees, taxes, and contribution timing may change results. Projection limited to 50 years."
              : kind === "hourly-rate"
                ? "Excludes taxes, unpaid leave beyond selected working weeks, and additional reserves."
                : kind === "business-profit"
                  ? "Operating profit excludes taxes, financing costs, owner draws, and expenses not entered. Annualization assumes twelve identical months."
                  : "Simplified federal estimates would exclude credits and special circumstances. No estimate or payment deadlines are provided until verification."}
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 30 }}>
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
