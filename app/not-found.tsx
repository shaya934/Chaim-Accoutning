import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap pagehero">
      <div className="eyebrow">Let’s find your way</div>
      <h1>This page isn’t here.</h1>
      <p>The link may have changed, or this resource is not published yet.</p>
      <Link className="btn" href="/">
        Back to a fresh start ↗
      </Link>
    </div>
  );
}
