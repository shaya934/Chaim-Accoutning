import { settings } from "@/lib/settings";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  HeartHandshake,
  Wallet,
  CalendarDays,
  MessageCircle,
  ChartNoAxesCombined,
  Leaf,
  Sparkles,
} from "lucide-react";
import { services, calculators } from "@/lib/content";
import { CTA } from "@/components/shared";
export const dynamic = "force-dynamic";
export default async function Home() {
  const s = await settings();
  const features = [
    [
      HeartHandshake,
      "You’re a person, not a number.",
      "Thoughtful guidance starts with listening to what matters to you.",
    ],
    [
      Wallet,
      "Clear advice. Clear pricing.",
      "Understand the work and the cost before we get started.",
    ],
    [
      CalendarDays,
      "A little easier to connect.",
      "Convenient appointments that make room for your life.",
    ],
    [
      MessageCircle,
      "Questions are always welcome.",
      "A real conversation, without the complicated accounting language.",
    ],
  ] as const;
  const offered = [
    ...services
      .filter(([id]) => !s.hiddenServices.includes(id))
      .map(([slug, title, , description]) => ({
        slug,
        title,
        description: s.serviceOverrides[slug]?.description || description,
      })),
    ...s.customServices,
  ];
  const articles = s.articles
    .filter((a) => a.published && a.reviewedAt)
    .slice(-3)
    .reverse();
  return (
    <div className="homepage">
      <section className="hero-background">
        <div className="wrap hero reveal">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" /> Accounting, with you in mind
            </div>
            <h1>
              Your finances deserve <em>personal attention.</em>
            </h1>
            <p>
              Less overwhelm. More understanding. Thoughtful accounting and tax
              guidance from someone who takes the time to know you.
            </p>
            <div className="actions">
              <Link className="btn" href="/booking">
                {s.consultationFree
                  ? "Book a Free Consultation"
                  : "Book a Consultation"}{" "}
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="hero-reassurance">
              <span className="tiny-leaf">
                <Leaf size={15} />
              </span>
              Personal service. Straightforward guidance. Fair prices.
            </div>
          </div>
          <div className="hero-art">
            <div className="art-orbit" aria-hidden="true" />
            <div className="art-sparkle" aria-hidden="true">
              <Sparkles size={36} strokeWidth={1} />
            </div>
            <div className="hero-picture">
              <img
                src="/personal-conversation.webp"
                alt="A warm, sunlit conversation over a notebook and coffee — illustrative imagery"
                fetchPriority="high"
              />
            </div>
            <div className="art-note">
              <span>
                <HeartHandshake size={24} strokeWidth={1.4} />
              </span>
              <div>
                A little clarity.
                <br />
                <b>A lot of care.</b>
              </div>
            </div>
            <span className="art-caption">
              Good with numbers. Here for people.
            </span>
          </div>
        </div>
      </section>
      <section className="wrap benefits-section">
        <div className="benefits-intro">
          <p>
            Professional accounting.
            <br />
            <span>A more personal experience.</span>
          </p>
          <span className="handdrawn-arrow" aria-hidden="true">
            ↝
          </span>
        </div>
        <div className="benefits-list">
          {features.map(([Icon, title, text]) => (
            <div className="benefit" key={title}>
              <Icon size={25} strokeWidth={1.4} />
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="services-section">
        <div className="wrap services-layout">
          <div className="services-intro">
            <div className="eyebrow">A little support goes a long way</div>
            <h2>
              More room for
              <br />
              <em>what matters.</em>
            </h2>
            <p>
              From getting your records in order to understanding your next
              step, let’s make the financial side of life feel more manageable.
            </p>
            <Link className="underlined-link" href="/services">
              Explore our services <ArrowUpRight size={18} />
            </Link>
            <div className="service-note">
              <Leaf size={22} strokeWidth={1.2} />
              <p>
                Every situation is different.
                <br />
                We’ll start with yours.
              </p>
            </div>
          </div>
          <div className="service-list">
            {offered.map(({ slug, title, description }, i) => (
              <Link
                className="service-row"
                href={`/services/${slug}`}
                key={slug}
              >
                <span className="service-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  {!s.confirmedServices.includes(slug) && (
                    <small>Discuss availability with Chaim</small>
                  )}
                </div>
                <span className="round-arrow">
                  <ArrowUpRight size={20} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="wrap personal-section">
        <div className="personal-art">
          <img
            className="personal-photo"
            src="/quiet-planning.webp"
            alt="A sunlit desk with a notebook, coffee, and greenery — illustrative imagery"
          />
          <span className="personal-handwritten">Someone in your corner.</span>
        </div>
        <div className="personal-copy">
          <div className="eyebrow">Meet your accountant</div>
          <h2>
            Hi, I’m Chaim.
            <br />
            Let’s make this
            <br />
            <em>feel simpler.</em>
          </h2>
          <p>
            Great accounting starts with a good conversation. What’s on your
            mind? What could be easier? What would help you feel more confident?
          </p>
          <p>
            My approach is personal attention, practical guidance, and clear
            communication—so you can spend less time worrying about the numbers
            and more time on the things you care about.
          </p>
          <Link className="underlined-link" href="/about">
            A little more about Chaim <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <section className="steps-section">
        <div className="wrap">
          <div className="center-heading">
            <div className="eyebrow">No complicated process</div>
            <h2>
              A conversation.
              <br />A plan. <em>A clearer path.</em>
            </h2>
            <p>We’ll take it one step at a time, together.</p>
          </div>
          <div className="journey">
            {[
              [
                "Let’s find a time",
                "Book an appointment or give Chaim a call. A simple first step, at a time that works for you.",
              ],
              [
                "Tell us your story",
                "Bring your questions and share what you need. We’ll listen before talking numbers.",
              ],
              [
                "Feel ready for what’s next",
                "Understand your options, the scope of support, and a practical way forward.",
              ],
            ].map(([title, text], i) => (
              <div className="journey-step" key={title}>
                <span className="journey-number">{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="wrap tools-section">
        <div className="tools-shell">
          <div className="sectionhead">
            <div>
              <div className="eyebrow">
                For the curious, and the planning ahead
              </div>
              <h2>
                A little insight.
                <br />
                <em>A fresh perspective.</em>
              </h2>
            </div>
            <div>
              <p>
                Explore your numbers with our free planning tools. No sign-up.
                Just a helpful place to start.
              </p>
              <Link href="/calculators" className="underlined-link">
                All financial calculators <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
          <div className="tool-links">
            {[calculators[2], calculators[3], calculators[4]].map(
              ([id, title, description], i) => (
                <Link
                  href={`/calculators/${id}`}
                  className="tool-link"
                  key={id}
                >
                  <div
                    className={`tool-drawing drawing-${i}`}
                    aria-hidden="true"
                  >
                    {i === 0 ? (
                      <>
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                      </>
                    ) : i === 1 ? (
                      <span>$ / hr</span>
                    ) : (
                      <ChartNoAxesCombined size={65} strokeWidth={1} />
                    )}
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className="tool-cta">
                    Let’s explore <ArrowUpRight size={18} />
                  </span>
                </Link>
              ),
            )}
          </div>
        </div>
      </section>
      <section className="wrap finder-section">
        <div>
          <div className="eyebrow">
            You don’t have to have it all figured out
          </div>
          <h2>
            Not sure where
            <br />
            <em>to start?</em>
          </h2>
          <p>
            That’s okay. Tell us a little about what’s on your mind, and we’ll
            point you in the right direction.
          </p>
        </div>
        <form action="/services" className="finder-form form">
          <label>
            Your accounting question
            <select name="need">
              <option value="individual-tax-preparation">
                I need help with personal taxes
              </option>
              <option value="business-tax-preparation">
                I have business tax questions
              </option>
              <option value="bookkeeping">
                I want to organize my bookkeeping
              </option>
              <option value="small-business-accounting">
                I’m starting a business
              </option>
              <option value="business-accounting-advisory">
                I’m looking for accounting advice
              </option>
              <option value="">I’m not sure yet</option>
            </select>
          </label>
          <button className="btn">
            Find my starting point <ArrowRight size={18} />
          </button>
          <p>
            Or skip the form.{" "}
            <a href={`tel:${s.phone}`}>Chaim is a phone call away.</a>
          </p>
        </form>
      </section>
      {s.testimonials.some((t) => t.permission) && (
        <section className="wrap block">
          <div className="center-heading">
            <div className="eyebrow">In their own words</div>
            <h2>
              Personal service.
              <br />
              <em>Meaningful connections.</em>
            </h2>
          </div>
          <div className="testimonial-list">
            {s.testimonials
              .filter((t) => t.permission)
              .map((t, i) => (
                <blockquote key={i}>
                  <p>“{t.text}”</p>
                  <cite>{t.name}</cite>
                </blockquote>
              ))}
          </div>
        </section>
      )}
      {articles.length > 0 && (
        <section className="wrap block">
          <div className="sectionhead">
            <div>
              <div className="eyebrow">Helpful tips & insights</div>
              <h2>
                A little knowledge.
                <br />
                <em>A clearer perspective.</em>
              </h2>
            </div>
            <Link className="underlined-link" href="/articles">
              Visit the resource center <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="grid">
            {articles.map((a) => (
              <Link className="card" key={a.slug} href={`/articles/${a.slug}`}>
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
                <span className="underlined-link">
                  Read the guide <ArrowUpRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <CTA />
    </div>
  );
}
