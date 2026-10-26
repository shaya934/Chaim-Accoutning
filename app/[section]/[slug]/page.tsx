import { siteUrl } from "@/lib/site-url";
import { settings } from "@/lib/settings";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero, CTA } from "@/components/shared";
import { services, calculators, faqs, serviceDetails } from "@/lib/content";
import Calculator from "@/components/calculator";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}) {
  const { section, slug } = await params;
  const s = await settings();
  const title =
    section === "services"
      ? services.find((a) => a[0] === slug)?.[1] ||
        s.customServices.find((a) => a.slug === slug)?.title
      : section === "calculators"
        ? calculators.find((a) => a[0] === slug)?.[1]
        : s.articles.find((a) => a.slug === slug && a.published && a.reviewedAt)
            ?.title;
  return { title: title || "Page not found", description: title };
}
export default async function Detail({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}) {
  const { section, slug } = await params;
  const s = await settings();
  if (section === "calculators") {
    const c = calculators.find((a) => a[0] === slug);
    if (!c) notFound();
    return (
      <>
        <PageHero eyebrow="Free financial tools" title={c[1]}>
          {c[2]}
        </PageHero>
        <div className="wrap">
          <Calculator kind={slug} disclaimer={s.calculatorDisclaimer} />
        </div>
      </>
    );
  }
  if (section === "services") {
    const original = services.find((a) => a[0] === slug);
    const custom = s.customServices.find((a) => a.slug === slug);
    if ((!original && !custom) || s.hiddenServices.includes(slug)) notFound();
    const title = original?.[1] || custom!.title;
    const desc =
      s.serviceOverrides[slug]?.description ||
      original?.[3] ||
      custom!.description;
    return (
      <>
        <PageHero eyebrow="Personal support, clear guidance" title={title}>
          {original?.[2] || desc}
        </PageHero>
        <div className="wrap split">
          <div className="prose">
            <p>{desc}</p>
            {!s.confirmedServices.includes(slug) && (
              <div className="notice">
                Proposed service — contact Chaim to confirm that this service is
                currently available.
              </div>
            )}
            <h2>Support that starts with you.</h2>
            <p>
              Every financial situation is different. A conversation about your
              needs, records, and goals helps define an appropriate scope of
              work. Chaim’s approach emphasizes personal attention, clear
              communication, and straightforward pricing.
            </p>
            {(serviceDetails[slug] || []).map((part) => (
              <div key={part.heading}>
                <h2>{part.heading}</h2>
                <p>{part.text}</p>
              </div>
            ))}
            <h2>What a conversation can cover</h2>
            <ul>
              <li>
                Your current records and the questions you want to resolve.
              </li>
              <li>Which information is needed to understand your situation.</li>
              <li>Relevant deadlines, responsibilities, and next steps.</li>
              <li>Scope and pricing before an engagement begins.</li>
            </ul>
            <h2>Common questions</h2>
            {[faqs[3], faqs[1], faqs[9]].map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
            <p>
              No specific tax savings or financial outcomes are promised. Advice
              depends on your facts and applicable rules.
            </p>
          </div>
          <aside>
            <img
              className="articlecover"
              style={{ height: 300 }}
              src={s.serviceOverrides[slug]?.image || "/workspace.svg"}
              alt="Thoughtful planning with organized financial records"
            />
            <div className="card">
              <h3>Let’s discuss your next step.</h3>
              <p>Personal attention. Practical guidance.</p>
              <Link className="btn" href="/booking">
                Book a Consultation ↗
              </Link>
              <p>
                <a href={`tel:${s.phone}`}>Or call {s.phone}</a>
              </p>
            </div>
          </aside>
        </div>
        <CTA />
      </>
    );
  }
  if (section === "articles") {
    const article = s.articles.find(
      (a) => a.slug === slug && a.published && a.reviewedAt,
    );
    if (!article) notFound();
    const related = s.articles
      .filter((a) => a.slug !== slug && a.published && a.reviewedAt)
      .slice(0, 3);
    return (
      <>
        <PageHero eyebrow={article.category} title={article.title} />
        <article className="wrap prose">
          <div className="articlemeta">
            Published / reviewed {article.reviewedAt} ·{" "}
            {Math.max(1, Math.ceil(article.body.split(/\s+/).length / 200))} min
            read
          </div>
          <img
            className="articlecover"
            style={{ height: 300 }}
            src={article.image || "/article-0.svg"}
            alt="Illustrated financial planning workspace"
          />
          {article.body
            .split("\n\n")
            .map((p, i) =>
              p.startsWith("## ") ? (
                <h2 key={i}>{p.slice(3)}</h2>
              ) : (
                <p key={i}>{p}</p>
              ),
            )}
          <div className="notice">
            General education only. Tax rules change and individual
            circumstances differ. Consult an appropriate professional before
            acting.
          </div>
          <a
            className="btn light"
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl() + "/articles/" + slug)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Share this article ↗
          </a>
          <h2>Keep exploring</h2>
          {related.map((a) => (
            <p key={a.slug}>
              <Link href={`/articles/${a.slug}`}>{a.title} ↗</Link>
            </p>
          ))}
        </article>
        <CTA />
      </>
    );
  }
  notFound();
}
