import { settings } from "@/lib/settings";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero, CTA } from "@/components/shared";
import { services, calculators, faqs } from "@/lib/content";
import { configured } from "@/lib/db";
import ContactForm from "@/components/contact";
import Articles from "@/components/articles";
import { BookOpen, ArrowUpRight } from "lucide-react";
export const dynamic = "force-dynamic";
const titles: Record<string, string> = {
  about: "Professional Accounting With a Personal Touch.",
  services: "Thoughtful support. For your financial life.",
  pricing: "Quality Accounting Services at Reasonable Prices.",
  booking: "Let’s make time for your next step.",
  calculators: "Free Financial Calculators",
  articles: "Helpful Financial Tips & Insights",
  faq: "A little clarity, right here.",
  contact: "Let’s Talk About Your Accounting Needs.",
  privacy: "Your privacy matters.",
  terms: "Terms of Use",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return {
    title: titles[section] || "Page not found",
    description: titles[section],
  };
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ need?: string }>;
}) {
  const { section } = await params;
  const { need } = await searchParams;
  const s = await settings();
  if (!titles[section]) notFound();
  const active = services.filter(([id]) => !s.hiddenServices.includes(id));
  const recommended = active.find(([id]) => id === need);
  return (
    <>
      <PageHero
        eyebrow={
          section === "booking"
            ? "A conversation is a great beginning"
            : section
        }
        title={titles[section]}
      >
        {section === "articles"
          ? "Simple explanations and practical advice to help you make smarter financial decisions."
          : section === "calculators"
            ? "Useful tools to explore your numbers. Clear assumptions, real calculations, and a little more perspective."
            : section === "contact"
              ? "Have a question or ready to get started? We’d be happy to hear from you."
              : section === "pricing"
                ? "Every financial situation is different. Our approach is personal service and clear pricing based on your needs."
                : undefined}
      </PageHero>
      <div className="wrap">
        {section === "about" && (
          <>
            <div className="split">
              <div className="prose">
                <p>
                  At {s.businessName}, we believe great accounting is about more
                  than numbers. It’s about understanding your needs, answering
                  your questions, and helping you make confident financial
                  decisions.
                </p>
                <p>
                  Our approach is simple: provide dependable accounting
                  services, give every client personal attention, and keep
                  pricing reasonable and straightforward.
                </p>
                <p>
                  Whether you’re preparing your personal taxes, managing a
                  business, or looking for accounting guidance, our goal is to
                  make the process as smooth and stress-free as possible.
                </p>
                {s.bio && <p style={{ whiteSpace: "pre-line" }}>{s.bio}</p>}
                <Link className="btn" href="/booking">
                  Let’s get acquainted ↗
                </Link>
              </div>
              <div className="scene" style={{ minHeight: 320 }}>
                <img
                  src={s.photo || "/quiet-planning.webp"}
                  alt={
                    s.photo
                      ? "Chaim Gesteter"
                      : "A welcoming workspace with natural light"
                  }
                />
              </div>
            </div>
            <section className="block grid">
              {[
                [
                  "Our approach",
                  "Clear communication, practical guidance, and attention to detail.",
                ],
                [
                  "Personal service",
                  "Every client deserves to feel heard, respected, and supported.",
                ],
                [
                  "Fair pricing",
                  "Professional accounting assistance should come with clear and reasonable pricing.",
                ],
              ].map(([t, d]) => (
                <div className="card" key={t}>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              ))}
            </section>
          </>
        )}
        {section === "services" && (
          <>
            {recommended && (
              <div className="notice">
                Your starting point:{" "}
                <Link
                  style={{ textDecoration: "underline" }}
                  href={`/services/${recommended[0]}`}
                >
                  {recommended[1]} ↗
                </Link>
                . Confirm the right fit with Chaim.
              </div>
            )}
            <div className="notice">
              Services below are proposed offerings until confirmed by the
              owner. Please contact Chaim to confirm availability.
            </div>
            <div className="grid">
              {active.map(([id, title, , desc]) => (
                <Link className="card" href={`/services/${id}`} key={id}>
                  <div className="iconbox">
                    <BookOpen />
                  </div>
                  <h3>{title}</h3>
                  <p>{s.serviceOverrides[id]?.description || desc}</p>
                  <span className="btn text">
                    Learn more <ArrowUpRight size={15} />
                  </span>
                </Link>
              ))}
              {s.customServices.map((item) => (
                <Link
                  className="card"
                  href={`/services/${item.slug}`}
                  key={item.slug}
                >
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span>Learn more ↗</span>
                </Link>
              ))}
            </div>
          </>
        )}
        {section === "pricing" && (
          <>
            <div className="grid">
              {active
                .filter(
                  ([id]) =>
                    !["tax-planning", "payroll-assistance"].includes(id),
                )
                .map(([id, title]) => (
                  <div className="card" key={id}>
                    <h3>{title}</h3>
                    <p>
                      {s.prices[id] || "Contact Us for a Personalized Quote"}
                    </p>
                    <Link className="btn text" href="/contact">
                      Let’s discuss your needs ↗
                    </Link>
                  </div>
                ))}
            </div>
            <div className="notice">
              Scope of work, responsibilities, and pricing are discussed before
              an engagement begins. No prices or tax savings are guaranteed.
            </div>
          </>
        )}
        {section === "faq" && (
          <div className="prose">
            {(s.customFaqs.length
              ? s.customFaqs.map((f) => [f.question, f.answer])
              : faqs
            ).map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        )}
        {section === "calculators" && (
          <div className="grid">
            {calculators.map(([id, title, desc]) => (
              <Link className="card" href={`/calculators/${id}`} key={id}>
                <div className="iconbox">
                  <BookOpen />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <div className="articlemeta">
                  {["business-profit", "hourly-rate", "savings-goal"].includes(
                    id,
                  )
                    ? "Ready to explore"
                    : "2025 & 2026 planning estimates"}
                </div>
                <span className="btn text">Open calculator ↗</span>
              </Link>
            ))}
          </div>
        )}
        {section === "booking" && (
          <div className="split">
            <div className="card">
              <h3>A simple path to a real conversation.</h3>
              <ol>
                <li>Choose your appointment type.</li>
                <li>Select a meeting format.</li>
                <li>Choose a live available time in your timezone.</li>
                <li>Enter your contact information securely.</li>
                <li>Receive confirmation from the scheduling provider.</li>
              </ol>
              <p>
                Consultation topics: initial accounting, personal taxes,
                business taxes, bookkeeping, and general accounting questions.
              </p>
              <p>
                Configured meeting formats: {s.meetingFormats.join(", ")}.<br />
                Typical duration: {s.appointmentDuration} minutes.
              </p>
              {s.bookingNotes && <p>{s.bookingNotes}</p>}
              <p>
                Availability, confirmations, cancellations, and rescheduling are
                managed by the connected scheduling provider.
              </p>
            </div>
            <div className="card">
              {s.bookingUrl ? (
                <>
                  <h3>Your appointment starts here.</h3>
                  <p>
                    Continue to our scheduling provider to see actual
                    availability, choose your timezone, and complete your
                    booking. Your appointment is confirmed only when the
                    provider confirms it.
                  </p>
                  <a
                    className="btn"
                    href={s.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    See available appointments ↗
                  </a>
                  <p>
                    Use the link in your provider confirmation email to cancel
                    or reschedule.
                  </p>
                </>
              ) : (
                <>
                  <h3>Let’s find a time together.</h3>
                  <div className="notice">
                    Online scheduling is awaiting provider configuration. No
                    appointment has been booked. Call Chaim to arrange a time.
                  </div>
                  <a className="btn" href={`tel:${s.phone}`}>
                    Call {s.phone}
                  </a>
                </>
              )}
            </div>
          </div>
        )}
        {section === "contact" && (
          <div className="split">
            <div>
              <h2>
                A real person.
                <br />A helpful conversation.
              </h2>
              <p>Chaim Gesteter · Accountant</p>
              <a className="btn" href={`tel:${s.phone}`}>
                Call {s.phone}
              </a>
              {s.email && (
                <p>
                  <a href={`mailto:${s.email}`}>{s.email}</a>
                </p>
              )}
              {s.address && <p>{s.address}</p>}
              <h3>Prefer an appointment?</h3>
              <p>Find a time to discuss what matters to you.</p>
              <Link className="btn light" href="/booking">
                Schedule an appointment ↗
              </Link>
            </div>
            <ContactForm available={configured()} />
          </div>
        )}
        {section === "articles" && (
          <Articles
            articles={s.articles
              .filter((a) => a.published && a.reviewedAt)
              .map((a) => ({
                ...a,
                minutes: Math.max(
                  1,
                  Math.ceil(a.body.split(/\s+/).length / 200),
                ),
              }))}
          />
        )}
        {section === "privacy" && (
          <div className="prose">
            <p>
              Effective October 25, 2026. This policy describes the website’s
              intended handling of contact information. The owner should review
              it before launch and add the business’s actual legal and
              jurisdictional details.
            </p>
            <h2>Information you choose to share</h2>
            <p>
              The contact form collects your name, email, phone, selected
              service, and message so we can respond to your inquiry. Please do
              not submit sensitive tax documents, identification numbers, or
              banking information.
            </p>
            <h2>Storage and retention</h2>
            <p>
              When configured, inquiries are stored in our PostgreSQL database.
              Administrators can address or delete inquiries. The current
              retention setting is {s.retentionDays} days; deletion must be run
              by an administrator or scheduled maintenance. We do not sell
              inquiry information. We may use a configured email provider to
              notify the administrator of new inquiries without including your
              full message.
            </p>
            <h2>Cookies and third parties</h2>
            <p>
              Administration uses an essential, HTTP-only session cookie. This
              site does not include advertising analytics. Default fonts and
              illustrations are served locally. If remote images are configured,
              their providers receive image requests from your browser.
              Following the scheduling link opens a third-party service with its
              own privacy policy. Newsletter subscriptions are only available
              through a separately configured consent process.
            </p>
            <h2>Your choices</h2>
            <p>
              Call {s.phone} to ask about access, correction, or deletion of
              information you submitted. Applicable rights and legally required
              retention may vary. We do not intentionally collect information
              from children.
            </p>
          </div>
        )}
        {section === "terms" && (
          <div className="prose">
            <p>
              Effective October 25, 2026. Please have these terms reviewed for
              the business’s actual jurisdiction before launch.
            </p>
            <h2>Educational information</h2>
            <p>
              Website content and calculator results are general educational
              information. They are not individualized tax, legal, investment,
              or financial advice. Calculators simplify assumptions and do not
              establish filing or payment obligations.
            </p>
            <h2>No engagement through browsing</h2>
            <p>
              Using this site, sending a message, or requesting an appointment
              does not establish an accountant-client engagement. Services,
              responsibilities, availability, and fees must be confirmed
              separately.
            </p>
            <h2>Appointments and external services</h2>
            <p>
              Appointments are confirmed only by the scheduling provider or by
              Chaim directly. Provider policies govern cancellations and
              rescheduling. External links do not imply control over third-party
              services.
            </p>
            <h2>Responsible use</h2>
            <p>
              Do not use the website to submit sensitive financial identifiers,
              malicious content, or unsolicited advertising. We aim for accurate
              information but cannot guarantee that every educational example
              applies to your circumstances. Contact Chaim at {s.phone} with
              questions.
            </p>
          </div>
        )}
      </div>
      {!["privacy", "terms", "booking"].includes(section) && <CTA />}
    </>
  );
}
