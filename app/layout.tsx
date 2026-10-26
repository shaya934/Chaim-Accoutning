import { siteUrl } from "@/lib/site-url";
import { settings } from "@/lib/settings";
import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Leaf } from "lucide-react";

import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Chaim Gesteter Accounting | Personal service. Clear guidance.",
    template: "%s | Chaim Gesteter Accounting",
  },
  description:
    "Personal attention, straightforward guidance, and fair pricing. Talk with Chaim Gesteter about your accounting needs.",
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await settings();
  const links = [
    ["Services", "/services"],
    ["About Chaim", "/about"],
    ["Calculators", "/calculators"],
    ["Resources", "/articles"],
    ["Contact", "/contact"],
  ];
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <header>
          <div className="wrap nav">
            <Link href="/" className="brand">
              {s.logo ? (
                <img src={s.logo} width={44} height={44} alt="" />
              ) : (
                <span className="mark">
                  <Leaf size={25} />
                </span>
              )}
              <span>
                {s.businessName.replace(" Accounting", "")}
                <small>Accounting, with you in mind.</small>
              </span>
            </Link>
            <div className="navlinks">
              {links.map(([t, h]) => (
                <Link key={h} href={h}>
                  {t}
                </Link>
              ))}
              <a className="header-phone" href={`tel:${s.phone}`}>
                <Phone size={15} />
                {s.phone}
              </a>
              <details className="mobilemenu">
                <summary>Menu</summary>
                <nav>
                  {[
                    ...links,
                    ["Pricing", "/pricing"],
                    ["FAQ", "/faq"],
                    ["Book a Consultation", "/booking"],
                  ].map(([t, h]) => (
                    <Link href={h} key={h}>
                      {t}
                    </Link>
                  ))}
                </nav>
              </details>
            </div>
          </div>
        </header>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AccountingService",
              name: s.businessName,
              telephone: s.phone,
              url: siteUrl(),
              ...(s.serviceArea ? { areaServed: s.serviceArea } : {}),
            }).replace(/</g, "\\u003c"),
          }}
        />
        <main id="main">{children}</main>
        <footer>
          <div className="wrap">
            <div className="footergrid">
              <div>
                <Link className="brand" href="/">
                  {s.businessName}
                </Link>
                <p>
                  Professional accounting.
                  <br />
                  Personal service. Fair prices.
                </p>
                <a href={`tel:${s.phone}`}>
                  <Phone size={13} /> {s.phone}
                </a>
                {s.address && <p>{s.address}</p>}
                {s.hours && <p>{s.hours}</p>}
              </div>
              <div>
                <b>Explore</b>
                {[
                  ["Services", "/services"],
                  ["About Chaim", "/about"],
                  ["Pricing", "/pricing"],
                  ["Contact", "/contact"],
                ].map(([t, h]) => (
                  <Link key={h} href={h}>
                    {t}
                  </Link>
                ))}
              </div>
              <div>
                <b>A little clarity</b>
                <Link href="/calculators">Financial calculators</Link>
                <Link href="/articles">Tips & insights</Link>
                <Link href="/faq">Common questions</Link>
                <Link href="/booking">Book an appointment</Link>
              </div>
              <div>
                <b>Let’s connect</b>
                {s.socialLinks
                  .split(/\n/)
                  .filter((url) => {
                    try {
                      return new URL(url).protocol === "https:";
                    } catch {
                      return false;
                    }
                  })
                  .map((url) => (
                    <a
                      key={url}
                      href={url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {new URL(url).hostname} ↗
                    </a>
                  ))}
                <p>Thoughtful guidance starts with understanding you.</p>
                <Link href="/contact">Get in touch ↗</Link>
                {s.newsletterUrl && (
                  <a href={s.newsletterUrl} rel="noopener noreferrer">
                    Financial tips newsletter ↗
                  </a>
                )}
              </div>
            </div>
            <div className="footbottom">
              <span>
                © {new Date().getFullYear()} {s.businessName}. All rights
                reserved.
              </span>
              <span>
                <Link href="/privacy">Privacy Policy</Link> ·{" "}
                <Link href="/terms">Terms of Use</Link> ·{" "}
                <Link href="/admin">Admin</Link>
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
