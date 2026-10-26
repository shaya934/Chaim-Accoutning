export const services = [
  [
    "individual-tax-preparation",
    "Individual Tax Preparation",
    "A clearer path through tax season.",
    "Organize your income, deductions, and filing questions with personal attention.",
  ],
  [
    "business-tax-preparation",
    "Business Tax Preparation",
    "Bring your business picture into focus.",
    "Prepare business records and understand the filing considerations for your entity.",
  ],
  [
    "bookkeeping",
    "Bookkeeping",
    "Good records. More breathing room.",
    "Keep transactions categorized, accounts reconciled, and monthly records organized.",
  ],
  [
    "small-business-accounting",
    "Small Business Accounting",
    "Know where your business stands.",
    "Understand financial statements, organize your finances, and make informed decisions.",
  ],
  [
    "tax-planning",
    "Tax Planning",
    "Think ahead with confidence.",
    "Discuss estimated payments, changing circumstances, and potential tax obligations.",
  ],
  [
    "payroll-assistance",
    "Payroll Assistance",
    "Make room for your people.",
    "Organize payroll records and coordinate questions with your payroll provider.",
  ],
  [
    "business-accounting-advisory",
    "Business Accounting Advisory",
    "Practical guidance for your next step.",
    "Explore budgets, profitability, cash flow, and the financial side of business decisions.",
  ],
];
export const calculators = [
  [
    "income-tax",
    "Federal Income Tax Estimator",
    "Understand your federal income tax picture.",
  ],
  [
    "self-employment",
    "Self-Employment Tax Calculator",
    "Explore Social Security and Medicare obligations.",
  ],
  [
    "business-profit",
    "Business Profit Calculator",
    "See what your business really brings home.",
  ],
  [
    "hourly-rate",
    "Hourly Rate Calculator",
    "Find a rate that supports your goals.",
  ],
  [
    "savings-goal",
    "Savings Goal Calculator",
    "Turn a future goal into a monthly plan.",
  ],
  [
    "quarterly-tax",
    "Quarterly Estimated Tax Calculator",
    "Plan ahead for estimated payments.",
  ],
];
export const defaults = {
  businessName: "Chaim Gesteter Accounting",
  phone: "848-223-4073",
  email: "",
  address: "",
  hours: "",
  bio: "",
  photo: "",
  logo: "",
  socialLinks: "",
  serviceArea: "",
  consultationFree: false,
  bookingUrl: "",
  meetingFormats: ["Phone", "Video"],
  appointmentDuration: 30,
  bookingNotes: "",
  newsletterUrl: "",
  confirmedServices: [] as string[],
  hiddenServices: [] as string[],
  serviceOverrides: {} as Record<
    string,
    { description?: string; image?: string }
  >,
  customServices: [] as { slug: string; title: string; description: string }[],
  testimonials: [] as {
    name: string;
    text: string;
    permission: boolean;
    rating?: number;
    businessType?: string;
  }[],
  prices: {} as Record<string, string>,
  articles: [] as {
    slug: string;
    title: string;
    body: string;
    category: string;
    image: string;
    published: boolean;
    reviewedAt: string;
  }[],
  calculatorDisclaimer:
    "Planning estimates only. Results are not tax, investment, or legal advice.",
  customFaqs: [] as { question: string; answer: string }[],
  retentionDays: 90,
};
export type Settings = typeof defaults;
export const faqs = [
  [
    "How do I schedule an appointment?",
    "Use the booking page to access the configured scheduling provider. If online booking is not yet available, call Chaim to arrange a conversation.",
  ],
  [
    "What documents should I bring for tax preparation?",
    "Ask for a checklist tailored to your situation. Typically, you will need income statements, prior-year returns, and records supporting deductions. Do not send tax documents through this website.",
  ],
  [
    "Do you work with small businesses?",
    "Small business accounting is a proposed service. Contact Chaim to confirm availability and discuss your needs.",
  ],
  [
    "How much do accounting services cost?",
    "Pricing depends on the scope and complexity of your needs. Request a personalized quote; discuss fees before an engagement begins.",
  ],
  [
    "Can I book a phone consultation?",
    "Check the booking page for available meeting formats, or call to ask about a phone appointment.",
  ],
  [
    "What is the difference between bookkeeping and accounting?",
    "Bookkeeping organizes day-to-day transactions. Accounting uses those records to prepare reports, understand results, and support decisions.",
  ],
  [
    "When should I start preparing for tax season?",
    "Keep records throughout the year and start gathering tax documents as they arrive. Allow time to resolve missing information before filing deadlines.",
  ],
  [
    "How do I know whether I need estimated tax payments?",
    "Income without adequate withholding may create a need for estimated payments. The rules depend on your tax liability, withholding, and prior-year circumstances.",
  ],
  [
    "Can you help me understand my business expenses?",
    "Contact Chaim to discuss expense organization and confirm the services appropriate to your situation. Deductibility depends on applicable rules and documentation.",
  ],
  [
    "What should I expect during my first appointment?",
    "Expect a conversation about your goals, current records, and questions. You can discuss service availability, scope, and pricing before deciding on next steps.",
  ],
];
export const serviceDetails: Record<
  string,
  { heading: string; text: string }[]
> = {
  "individual-tax-preparation": [
    {
      heading: "Make sense of your filing picture",
      text: "Wages, freelance work, investments, and changes at home can affect a return in different ways. Start with a complete list of income sources and a checklist of documents, then discuss potential deductions and credits that may apply to your circumstances.",
    },
    {
      heading: "Prepare without the last-minute scramble",
      text: "Review prior-year information, identify missing statements, and set aside questions about filing status or changes in income. Keep original supporting records and ask about a secure document-transfer process.",
    },
  ],
  "business-tax-preparation": [
    {
      heading: "Bring the pieces together",
      text: "Business filing starts with knowing the entity’s tax treatment and keeping financial records consistent. Reconciled accounts, payroll summaries, asset purchases, and ownership information help establish the questions that need attention.",
    },
    {
      heading: "Understand responsibilities and timing",
      text: "Entity returns, owner returns, and state filings may have different deadlines. Discuss who prepares each filing, which records are needed, and how estimated payments or extensions fit into the plan.",
    },
  ],
  bookkeeping: [
    {
      heading: "An organized foundation",
      text: "Bookkeeping tracks day-to-day transactions and organizes income and expenses into meaningful categories. Regular reconciliation compares the books with bank and card statements so missing or duplicated entries can be investigated.",
    },
    {
      heading: "A useful monthly rhythm",
      text: "Review unpaid customer invoices, upcoming bills, and unusual transactions. A consistent monthly close can produce more dependable reports and make year-end preparation easier. Agree on which accounts and reporting periods are included.",
    },
  ],
  "small-business-accounting": [
    {
      heading: "See the story behind the numbers",
      text: "A profit-and-loss statement, balance sheet, and cash-flow information answer different questions. Together, they help you understand operating results, obligations, and the timing of cash rather than relying on a bank balance alone.",
    },
    {
      heading: "Build a practical financial routine",
      text: "Organize business records, review reports regularly, and distinguish business spending from personal activity. Discuss reporting needs and responsibilities so the information supports the decisions you actually make.",
    },
  ],
  "tax-planning": [
    {
      heading: "Look ahead, with context",
      text: "Changes in income, business activity, or household circumstances can affect potential tax obligations. Proactive planning starts with reasonable assumptions and current records, then revisits the estimate when those assumptions change.",
    },
    {
      heading: "Understand estimated payments",
      text: "Discuss withholding, estimated payments, prior-year liability, and applicable payment-timing rules. Federal and state obligations may differ. Planning does not guarantee a particular tax outcome or replace a complete review of your facts.",
    },
  ],
  "payroll-assistance": [
    {
      heading: "Keep payroll information organized",
      text: "Reliable employee information, pay-period records, and payroll summaries can help a business coordinate with a payroll provider. Clarify who handles calculations, filings, deposits, and corrections before the service begins.",
    },
    {
      heading: "Coordinate rather than guess",
      text: "Worker classification, withholding, and state payroll requirements depend on applicable rules. Bring provider reports and specific questions to the conversation, and confirm which assistance Chaim offers before relying on a particular workflow.",
    },
  ],
  "business-accounting-advisory": [
    {
      heading: "Make decisions with a clearer view",
      text: "A budget can translate goals into expected income, costs, and cash needs. Comparing actual results with that plan helps identify questions about profitability, spending, or the timing of customer payments.",
    },
    {
      heading: "Explore the next step",
      text: "Discuss pricing assumptions, operating costs, cash reserves, and the financial implications of a proposed change. Advisory conversations use the records and assumptions available; they do not promise growth, investment performance, or financing approval.",
    },
  ],
};
