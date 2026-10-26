import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="wrap">
      <div className="pagehero reveal">
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
    </div>
  );
}
export function CTA() {
  return (
    <section className="wrap block">
      <div className="cta">
        <div>
          <div className="eyebrow">Your next step starts here</div>
          <h2>
            Let’s make room
            <br />
            for <em>more clarity.</em>
          </h2>
          <p>Bring your questions. We’ll start with a conversation.</p>
        </div>
        <Link className="btn" href="/booking">
          Book an Appointment <ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  );
}
