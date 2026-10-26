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
import TaxCalculator from "./tax-calculator";
const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
const defaults = {
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
};
export default function Calculator(props: {
  kind: string;
  disclaimer: string;
}) {
  return ["income-tax", "self-employment", "quarterly-tax"].includes(
    props.kind,
  ) ? (
    <TaxCalculator {...props} />
  ) : (
    <PlanningCalculator {...props} />
  );
}
function PlanningCalculator({
  kind,
  disclaimer,
}: {
  kind: string;
  disclaimer: string;
}) {
  const [values, setValues] = useState<Record<string, number>>(defaults);
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");
  const change = (key: string, value: string, max = 1e9) =>
    setValues((v) => ({
      ...v,
      [key]: Math.max(0, Math.min(max, Number(value) || 0)),
    }));
  const field = (key: string, label: string, max?: number) => (
    <div className="input-group" key={key}>
      <label htmlFor={key}>{label}</label>
      <input
        id={key}
        type="number"
        value={values[key]}
        min={0}
        max={max ?? 1e9}
        step="any"
        onChange={(e) => change(key, e.target.value, max)}
      />
      {max && (
        <input
          aria-label={`${label} slider`}
          type="range"
          min={0}
          max={max}
          value={values[key]}
          onChange={(e) => change(key, e.target.value, max)}
        />
      )}
    </div>
  );
  let amount = 0;
  let rows: [string, string][] = [];
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
      { name: "Income goal", value: values.income },
      { name: "Expenses", value: values.expenses },
    ];
  }
  if (kind === "savings-goal") {
    const r = savings(
      values.goal,
      values.current,
      values.contribution,
      values.rate,
      values.months,
    );
    amount = r.projected;
    rows = [
      [
        "Monthly contribution needed",
        r.needed === null ? "Choose a future target" : money(r.needed),
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
      <div className="calculator-layout">
        <div className="calculator-inputs">
          <h2>
            A little planning.
            <br />A clearer picture.
          </h2>
          <p className="calculator-intro">
            Try a few numbers and see what changes. Your inputs stay in your
            browser.
          </p>
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
                      const value = e.target.value;
                      setTarget(value);
                      if (!value) {
                        setError("");
                        change("months", "36");
                        return;
                      }
                      const days =
                        (new Date(value + "T12:00:00Z").getTime() -
                          Date.now()) /
                        86400000;
                      if (!Number.isFinite(days) || days <= 0) {
                        setError("Choose a future date.");
                        return;
                      }
                      const months = Math.ceil(days / 30.4375);
                      if (months > 600) {
                        setError("Choose a target within the next 50 years.");
                        return;
                      }
                      setError("");
                      change("months", String(Math.max(1, months)));
                    }}
                  />
                </label>
                {!target && (
                  <small>
                    Starting projection: 36 months. Choose a date to explore a
                    different timeline.
                  </small>
                )}
                {error && <p role="alert">{error}</p>}
              </>
            )}
            <button
              className="btn light reset-button"
              onClick={() => {
                setValues(defaults);
                setTarget("");
                setError("");
              }}
            >
              Reset inputs
            </button>
          </div>
        </div>
        <div className="calculator-output">
          <div className="result" aria-live="polite">
            <p>
              {kind === "business-profit"
                ? "Monthly operating profit"
                : kind === "hourly-rate"
                  ? "Minimum hourly billing rate"
                  : "Projected savings at target"}
            </p>
            <strong>
              {(kind === "hourly-rate" && (!values.weeks || !values.hours)) ||
              (kind === "savings-goal" && error)
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
                  ? "Projected savings growth"
                  : points.map((p) => `${p.name}: ${money(p.value)}`).join("; ")
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                {growth.length ? (
                  <LineChart data={growth}>
                    <XAxis dataKey="month" />
                    <YAxis width={65} />
                    <Tooltip formatter={(value) => money(Number(value))} />
                    <Line
                      dataKey="balance"
                      stroke="#6d8252"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={points}>
                    <XAxis dataKey="name" />
                    <YAxis width={65} />
                    <Tooltip formatter={(value) => money(Number(value))} />
                    <Bar dataKey="value" fill="#a1af80" radius={[8, 8, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
          <p className="calculator-assumptions">
            {disclaimer}{" "}
            {kind === "savings-goal"
              ? "Assumes fixed returns compounded monthly with contributions at month end. Returns are not guaranteed. Excludes inflation, fees, and taxes. Projection limited to 50 years."
              : kind === "hourly-rate"
                ? "Excludes taxes, extra reserves, and unpaid leave beyond your selected working weeks."
                : "Excludes taxes, financing costs, owner draws, and costs not entered. Annualization assumes twelve identical months."}
          </p>
        </div>
      </div>
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
