import { settings } from "@/lib/settings";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  HeartHandshake,
  Wallet,
  CalendarDays,
  MessageCircle,
  ChartNoAxesCombined,
  BookOpen,
  ShieldCheck,
  Leaf,
} from "lucide-react";
import { services, calculators } from "@/lib/content";
import { CTA } from "@/components/shared";
export const dynamic = "force-dynamic";
export default async function Home() {
  const s = await settings();
  const features = [
    [
      HeartHandshake,
      "Personalized service",
      "You’re more than a number. Get guidance that starts with understanding you.",
    ],
    [
      Wallet,
      "Fair, clear pricing",
      "Thoughtful accounting support, with costs discussed before we get started.",
    ],
    [
      CalendarDays,
      "Appointments made easy",
      "A simple way to connect, at a time that works for you.",
    ],
    [
      MessageCircle,
      "A real conversation",
      "Clear answers and personal attention, every step of the way.",
    ],
  ] as const;
  return (
    <>
      <section className="wrap hero reveal">
        <div>
          <div className="eyebrow">A little clarity. A lot of care.</div>
          <h1>
            Your finances deserve <em>personal attention.</em>
          </h1>
          <p>
            Professional accounting and tax services with exceptional customer
            care, easy appointments, and fair, straightforward pricing.
          </p>
          <div className="actions">
            <Link href="/booking" className="btn">
              {s.consultationFree
                ? "Book a Free Consultation"
                : "Book a Consultation"}{" "}
              <ArrowUpRight size={17} />
            </Link>
            <a className="btn light" href={`tel:${s.phone}`}>
              Call {s.phone}
            </a>
          </div>
          <div className="micro">
            <span>✓ Personal attention</span>
            <span>✓ Straightforward guidance</span>
            <span>✓ Fair prices</span>
          </div>
        </div>
        <div className="scene">
          <img
            src="/workspace.svg"
            alt="A calm, sunlit workspace with natural greenery"
            fetchPriority="high"
          />
          <div className="badge">
            <Leaf size={23} style={{ margin: "0 auto 4px" }} />
            ROOTED IN
            <br />
            PERSONAL SERVICE
          </div>
          <div className="floatcard">
            <span className="iconbox" style={{ margin: 0 }}>
              <ChartNoAxesCombined />
            </span>
            <div>
              <b>More clarity. Less worry.</b>
              <small>Your next chapter starts with a conversation.</small>
            </div>
          </div>
        </div>
      </section>
      <div className="band">
        <div className="wrap">
          <span>
            <HeartHandshake size={19} /> Accounting with a human touch
          </span>
          <span>
            <ShieldCheck size={19} /> Clear communication, always
          </span>
          <span>
            <Leaf size={19} /> Here for you and your business
          </span>
        </div>
      </div>
      <section className="block wrap">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">The difference is personal</div>
            <h2>
              Good with numbers.
              <br />
              Even better with people.
            </h2>
          </div>
          <p>
            You deserve an accountant who listens. Someone who makes the
            complicated feel manageable, and puts your needs first.
          </p>
        </div>
        <div className="grid four">
          {features.map(([Icon, title, text]) => (
            <div className="card" key={title}>
              <div className="iconbox">
                <Icon size={22} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="block green">
        <div className="wrap">
          <div className="sectionhead">
            <div>
              <div className="eyebrow">Support for your financial life</div>
              <h2>
                Let’s make room for
                <br />
                what matters to you.
              </h2>
            </div>
            <Link href="/services" className="btn text">
              Explore our services <ArrowUpRight size={16} />
            </Link>
          </div>
          <p>
            Explore proposed services. Contact Chaim to confirm availability and
            the right fit.
          </p>
          <div className="grid">
            {services
              .filter(([id]) => !s.hiddenServices.includes(id))
              .slice(0, 7)
              .map(([slug, title, , desc], i) => (
                <Link className="card" href={`/services/${slug}`} key={slug}>
                  <div className="iconbox">
                    {i % 2 ? <BookOpen /> : <ChartNoAxesCombined />}
                  </div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                  <span className="btn text">
                    Let’s explore <ArrowUpRight size={15} />
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>
      <section className="block wrap">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">Simple steps. Thoughtful support.</div>
            <h2>A clearer path forward.</h2>
          </div>
          <p>
            No overwhelming processes. Just a conversation, a plan, and someone
            in your corner.
          </p>
        </div>
        <div className="grid steps">
          {[
            [
              "Book an appointment",
              "Choose a convenient time to connect with Chaim.",
            ],
            [
              "Tell us your story",
              "Share your questions, your goals, and what you need help with.",
            ],
            [
              "Move forward confidently",
              "Understand your next steps with clear, personal guidance.",
            ],
          ].map(([t, d]) => (
            <div className="step" key={t}>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="block dark">
        <div className="wrap">
          <div className="sectionhead">
            <div>
              <div className="eyebrow">A little insight goes a long way</div>
              <h2>
                Big questions.
                <br />
                Useful little tools.
              </h2>
            </div>
            <p>
              Explore your numbers with free financial planning calculators. A
              starting point for better conversations.
            </p>
          </div>
          <div className="grid">
            {[calculators[2], calculators[3], calculators[4]].map(
              ([id, title, desc]) => (
                <Link
                  className="card"
                  style={{ color: "var(--navy)" }}
                  href={`/calculators/${id}`}
                  key={id}
                >
                  <div className="iconbox">
                    <ChartNoAxesCombined />
                  </div>
                  <h3>{title}</h3>
                  <p style={{ color: "var(--muted)" }}>{desc}</p>
                  <span className="btn text">Try the calculator ↗</span>
                </Link>
              ),
            )}
          </div>
          <div className="actions">
            <Link href="/calculators" className="btn light">
              Explore all calculators <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <section className="block wrap">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">A helpful place to start</div>
            <h2>Find your next step.</h2>
          </div>
        </div>
        <form action="/services" className="split">
          <div>
            <p>
              What do you need help with? Choose a topic and we’ll point you
              toward relevant services.
            </p>
          </div>
          <div className="form">
            <label>
              Your accounting question
              <select name="need">
                <option value="individual-tax-preparation">
                  Personal taxes
                </option>
                <option value="business-tax-preparation">Business taxes</option>
                <option value="bookkeeping">Bookkeeping</option>
                <option value="small-business-accounting">
                  Starting a business
                </option>
                <option value="business-accounting-advisory">
                  General accounting advice
                </option>
                <option value="">I’m not sure yet</option>
              </select>
            </label>
            <button className="btn">
              Find my starting point <ArrowUpRight size={16} />
            </button>
          </div>
        </form>
      </section>
      {s.testimonials.some((t) => t.permission) && (
        <section className="block green">
          <div className="wrap">
            <h2>Words from our clients.</h2>
            <div className="grid">
              {s.testimonials
                .filter((t) => t.permission)
                .map((t, i) => (
                  <blockquote className="card" key={i}>
                    <p>“{t.text}”</p>
                    <b>{t.name}</b>
                  </blockquote>
                ))}
            </div>
          </div>
        </section>
      )}
      {s.articles.filter((a) => a.published && a.reviewedAt).length > 0 && (
        <section className="block wrap">
          <div className="sectionhead">
            <div>
              <div className="eyebrow">Helpful financial tips & insights</div>
              <h2>
                A little knowledge.
                <br />A clearer perspective.
              </h2>
            </div>
            <Link href="/articles" className="btn text">
              Explore the resource center ↗
            </Link>
          </div>
          <div className="grid">
            {s.articles
              .filter((a) => a.published && a.reviewedAt)
              .slice(-3)
              .reverse()
              .map((a) => (
                <Link
                  className="card"
                  href={`/articles/${a.slug}`}
                  key={a.slug}
                >
                  <img
                    className="articlecover"
                    src={a.image || "/article-0.svg"}
                    alt="Financial planning illustration"
                  />
                  <div className="articlemeta">
                    {a.category} · {Math.ceil(a.body.split(/\s+/).length / 200)}{" "}
                    min read
                  </div>
                  <h3>{a.title}</h3>
                  <p>
                    {a.body
                      .split("\n\n")
                      .find((p) => !p.startsWith("##"))
                      ?.slice(0, 150)}
                    …
                  </p>
                  <span className="btn text">Read the guide ↗</span>
                </Link>
              ))}
          </div>
        </section>
      )}
      <CTA />
    </>
  );
}
