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
