"use client";
import { useState } from "react";
export default function Login({ configured }: { configured: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="wrap">
      <div className="pagehero">
        <div className="eyebrow">Private workspace</div>
        <h1>A little behind the scenes.</h1>
        <p>Administrator sign in</p>
      </div>
      <form
        className="form card"
        style={{ maxWidth: 500 }}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const res = await fetch("/api/admin/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(
                Object.fromEntries(new FormData(e.currentTarget)),
              ),
            });
            const data = await res.json();
            if (res.ok) location.reload();
            else setError(data.error);
          } catch {
            setError("Unable to sign in. Try again later.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {!configured && (
          <div className="notice">
            Admin setup required. Configure PostgreSQL, administrator
            credentials, and the session signing secret. See README.
          </div>
        )}
        <label>
          Email
          <input type="email" name="email" required autoComplete="username" />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            required
            maxLength={256}
            autoComplete="current-password"
          />
        </label>
        <button className="btn" disabled={busy || !configured}>
          {busy ? "Signing in…" : "Sign in securely"}
        </button>
        <p role="alert">{error}</p>
      </form>
    </div>
  );
}
