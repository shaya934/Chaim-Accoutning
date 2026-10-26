"use client";
import { useState } from "react";
export default function ContactForm({ available }: { available: boolean }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="form card"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setBusy(true);
        setStatus("");
        try {
          const data = Object.fromEntries(new FormData(form));
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const result = await res.json();
          setStatus(result.message);
          if (res.ok) form.reset();
        } catch {
          setStatus("Unable to send. Please call Chaim instead.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3>Tell us how we can help.</h3>
      {!available && (
        <div className="notice">
          Online messages are not configured yet. Please call Chaim to get in
          touch.
        </div>
      )}
      <label>
        Name
        <input name="name" required maxLength={100} autoComplete="name" />
      </label>
      <label>
        Email
        <input
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
        />
      </label>
      <label>
        Phone
        <input name="phone" type="tel" maxLength={30} autoComplete="tel" />
      </label>
      <label>
        Service needed
        <select name="service">
          <option>General accounting questions</option>
          <option>Personal taxes</option>
          <option>Business taxes</option>
          <option>Bookkeeping</option>
        </select>
      </label>
      <label>
        Message
        <textarea name="message" required minLength={10} maxLength={3000} />
      </label>
      <div className="hiddenfield" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p style={{ fontSize: 12 }}>
        Please don’t include Social Security numbers, tax documents, banking
        details, or other sensitive financial information. By submitting, you
        agree to our{" "}
        <a href="/privacy" style={{ textDecoration: "underline" }}>
          Privacy Policy
        </a>
        .
      </p>
      <button disabled={busy || !available} className="btn">
        {busy ? "Sending…" : "Send your message ↗"}
      </button>
      <p role="status">{status}</p>
    </form>
  );
}
