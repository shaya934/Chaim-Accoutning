"use client";
import { useState } from "react";
import type { Settings } from "@/lib/content";
import { services, faqs } from "@/lib/content";
import drafts from "@/lib/articles.json";
import { taxRules } from "@/lib/tax-rules";
type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  addressed: boolean;
  createdAt: string;
};
export default function Admin({
  initial,
  inquiries,
}: {
  initial: Settings;
  inquiries: Inquiry[];
}) {
  const [s, setS] = useState(initial);
  const [tab, setTab] = useState("Business");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(0);
  const set = (key: string, value: unknown) =>
    setS((old) => ({ ...old, [key]: value }));
  async function action(payload: object) {
    setBusy(true);
    setStatus("");
    try {
      const r = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      setStatus(r.ok ? "Changes saved." : d.error);
      if (r.ok && !("settings" in payload)) location.reload();
    } catch {
      setStatus("Unable to save. Check your connection.");
    } finally {
      setBusy(false);
    }
  }
  const field = (key: keyof Settings, label: string, area = false) => (
    <label key={key}>
      {label}
      {area ? (
        <textarea
          value={String(s[key])}
          onChange={(e) => set(key, e.target.value)}
        />
      ) : (
        <input
          value={String(s[key])}
          onChange={(e) => set(key, e.target.value)}
        />
      )}
    </label>
  );
  const article = s.articles[selected];
  const updateArticle = (key: string, value: unknown) =>
    set(
      "articles",
      s.articles.map((a, i) => (i === selected ? { ...a, [key]: value } : a)),
    );
  async function upload(
    file: File | undefined,
    callback: (url: string) => void,
  ) {
    if (!file) return;
    const form = new FormData();
    form.append("image", file);
    try {
      const r = await fetch("/api/admin/images", {
        method: "POST",
        body: form,
      });
      const d = await r.json();
      if (r.ok) callback(d.url);
      else setStatus(d.error);
    } catch {
      setStatus("Image upload failed.");
    }
  }
  return (
    <div className="wrap">
      <div className="pagehero">
        <div className="eyebrow">Your website, thoughtfully managed</div>
        <h1>Welcome to your workspace.</h1>
        <p>Manage content, review inquiries, and keep things up to date.</p>
      </div>
      <div className="actions">
        <button
          className="btn"
          disabled={busy}
          onClick={() => action({ action: "save", settings: s })}
        >
          {busy ? "Saving…" : "Save website changes"}
        </button>
        <button
          className="btn light"
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            location.reload();
          }}
        >
          Sign out
        </button>
      </div>
      <p role="status">{status}</p>
      <nav className="adminnav" aria-label="Dashboard sections">
        {[
          "Business",
          "Services",
          "Articles",
          "Appointments",
          "Inquiries",
          "Testimonials",
          "Pricing",
          "Calculators",
          "FAQs",
          "Retention",
        ].map((t) => (
          <button
            className={`btn ${tab === t ? "" : "light"}`}
            onClick={() => setTab(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </nav>
      <div className="card form">
        {tab === "Business" && (
          <>
            <h2 style={{ fontSize: 28 }}>The essentials</h2>
            {field("businessName", "Business name")}
            {field("phone", "Phone")}
            {field("email", "Public email")}
            {field("address", "Address (leave blank until confirmed)")}
            {field("serviceArea", "Actual service area")}
            {field("hours", "Office hours")}
            {field(
              "bio",
              "Professional background, experience, and specialties — verified facts only",
              true,
            )}
            {field("photo", "Chaim’s photograph URL")}
            <label>
              Upload a professional photograph
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) =>
                  upload(e.target.files?.[0], (url) => set("photo", url))
                }
              />
            </label>
            {field("logo", "Logo image URL")}
            {field(
              "socialLinks",
              "Social links (one HTTPS URL per line)",
              true,
            )}
            {field(
              "newsletterUrl",
              "Newsletter consent signup page (leave blank to hide)",
            )}
            <label>
              <input
                type="checkbox"
                style={{ width: "auto" }}
                checked={s.consultationFree}
                onChange={(e) => set("consultationFree", e.target.checked)}
              />{" "}
              Owner confirms consultations are free
            </label>
          </>
        )}
        {tab === "Services" && (
          <>
            <h2 style={{ fontSize: 28 }}>Your services</h2>
            <p>Confirm only the services you actually offer.</p>
            {services.map(([id, title, , desc]) => (
              <div className="card form" key={id}>
                <h3>{title}</h3>
                <label>
                  <input
                    style={{ width: "auto" }}
                    type="checkbox"
                    checked={s.confirmedServices.includes(id)}
                    onChange={(e) =>
                      set(
                        "confirmedServices",
                        e.target.checked
                          ? [...s.confirmedServices, id]
                          : s.confirmedServices.filter((a) => a !== id),
                      )
                    }
                  />{" "}
                  Confirmed offering
                </label>
                <label>
                  <input
                    style={{ width: "auto" }}
                    type="checkbox"
                    checked={s.hiddenServices.includes(id)}
                    onChange={(e) =>
                      set(
                        "hiddenServices",
                        e.target.checked
                          ? [...s.hiddenServices, id]
                          : s.hiddenServices.filter((a) => a !== id),
                      )
                    }
                  />{" "}
                  Hide service
                </label>
                <label>
                  Description
                  <textarea
                    value={s.serviceOverrides[id]?.description || desc}
                    onChange={(e) =>
                      set("serviceOverrides", {
                        ...s.serviceOverrides,
                        [id]: {
                          ...s.serviceOverrides[id],
                          description: e.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Image URL
                  <input
                    value={s.serviceOverrides[id]?.image || ""}
                    onChange={(e) =>
                      set("serviceOverrides", {
                        ...s.serviceOverrides,
                        [id]: {
                          ...s.serviceOverrides[id],
                          image: e.target.value,
                        },
                      })
                    }
                  />
                </label>
              </div>
            ))}
            <h3>Additional services</h3>
            {s.customServices.map((item, i) => (
              <div className="form card" key={i}>
                {(["slug", "title", "description"] as const).map((k) => (
                  <label key={k}>
                    {k}
                    <input
                      value={item[k]}
                      onChange={(e) =>
                        set(
                          "customServices",
                          s.customServices.map((a, j) =>
                            j === i ? { ...a, [k]: e.target.value } : a,
                          ),
                        )
                      }
                    />
                  </label>
                ))}
                <button
                  className="btn light"
                  onClick={() =>
                    set(
                      "customServices",
                      s.customServices.filter((_, j) => i !== j),
                    )
                  }
                >
                  Remove service
                </button>
              </div>
            ))}
            <button
              className="btn light"
              onClick={() =>
                set("customServices", [
                  ...s.customServices,
                  {
                    slug: "new-service",
                    title: "New service",
                    description: "",
                  },
                ])
              }
            >
              Add a service
            </button>
          </>
        )}
        {tab === "Articles" && (
          <>
            <h2 style={{ fontSize: 28 }}>Resource center</h2>
            <div className="notice">
              Twelve complete starter drafts are included. Verify factual
              statements and applicable law before publication. Review date is
              required; saving a draft never publishes it automatically.
            </div>
            <div className="actions">
              <button
                className="btn light"
                onClick={() => {
                  const imported = drafts
                    .filter((d) => !s.articles.some((a) => a.slug === d.slug))
                    .map((d) => ({
                      slug: d.slug,
                      title: d.title,
                      category: d.category,
                      image: d.image,
                      body: d.sections
                        .map(([t, p]) => `## ${t}\n\n${p}`)
                        .join("\n\n"),
                      published: false,
                      reviewedAt: "",
                    }));
                  set("articles", [...s.articles, ...imported]);
                }}
              >
                Import starter drafts
              </button>
              <button
                className="btn light"
                onClick={() => {
                  set("articles", [
                    ...s.articles,
                    {
                      slug: "new-article-" + Date.now(),
                      title: "New article",
                      category: "Business",
                      image: "",
                      body: "",
                      published: false,
                      reviewedAt: "",
                    },
                  ]);
                  setSelected(s.articles.length);
                }}
              >
                New article
              </button>
            </div>
            <label>
              Choose an article
              <select
                value={selected}
                onChange={(e) => setSelected(Number(e.target.value))}
              >
                {s.articles.map((a, i) => (
                  <option value={i} key={i}>
                    {a.published ? "Published" : "Draft"} · {a.title}
                  </option>
                ))}
              </select>
            </label>
            {article && (
              <>
                {(["title", "slug", "category", "image"] as const).map((k) => (
                  <label key={k}>
                    {k}
                    <input
                      value={article[k]}
                      onChange={(e) => updateArticle(k, e.target.value)}
                    />
                  </label>
                ))}
                <label>
                  Upload cover image
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) =>
                      upload(e.target.files?.[0], (url) =>
                        updateArticle("image", url),
                      )
                    }
                  />
                </label>
                <label>
                  Article body (use ## followed by a space for headings; blank
                  lines separate paragraphs)
                  <textarea
                    style={{ minHeight: 400 }}
                    value={article.body}
                    onChange={(e) => updateArticle("body", e.target.value)}
                  />
                </label>
                <p>
                  {article.body.split(/\s+/).filter(Boolean).length} words ·{" "}
                  {Math.ceil(article.body.split(/\s+/).length / 200)} minute
                  read
                </p>
                <label>
                  Last factually reviewed
                  <input
                    type="date"
                    value={article.reviewedAt}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) =>
                      updateArticle("reviewedAt", e.target.value)
                    }
                  />
                </label>
                <label>
                  <input
                    type="checkbox"
                    style={{ width: "auto" }}
                    checked={article.published}
                    onChange={(e) =>
                      updateArticle("published", e.target.checked)
                    }
                  />{" "}
                  Publish this reviewed article
                </label>
                <button
                  className="btn light"
                  onClick={() => {
                    set(
                      "articles",
                      s.articles.filter((_, i) => i !== selected),
                    );
                    setSelected(0);
                  }}
                >
                  Remove article
                </button>
              </>
            )}
          </>
        )}
        {tab === "Appointments" && (
          <>
            <h2 style={{ fontSize: 28 }}>Connected scheduling</h2>
            {field("bookingUrl", "Calendly or Cal.com event URL")}
            {field("bookingNotes", "Notes for visitors", true)}
            <label>
              Appointment duration (minutes)
              <input
                type="number"
                min={5}
                max={240}
                value={s.appointmentDuration}
                onChange={(e) =>
                  set("appointmentDuration", Number(e.target.value))
                }
              />
            </label>
            {["Phone", "Video", "In Person"].map((format) => (
              <label key={format}>
                <input
                  style={{ width: "auto" }}
                  type="checkbox"
                  checked={s.meetingFormats.includes(format)}
                  onChange={(e) =>
                    set(
                      "meetingFormats",
                      e.target.checked
                        ? [...s.meetingFormats, format]
                        : s.meetingFormats.filter((f) => f !== format),
                    )
                  }
                />
                {format}
              </label>
            ))}
            <div className="notice">
              Set the same duration and meeting formats in the scheduling
              provider. Business hours, connected calendars, timezone
              availability, double-booking protection, notifications, and
              appointment records are managed there. This dashboard does not
              sync provider records. Configure and test the provider before
              enabling booking.
            </div>
          </>
        )}
        {tab === "Inquiries" && (
          <>
            <h2 style={{ fontSize: 28 }}>Latest inquiries</h2>
            <p>
              Showing up to 200 newest records. Messages may contain personal
              information; handle them with care.
            </p>
            {!inquiries.length && <p>No inquiries yet.</p>}
            {inquiries.map((i) => (
              <div className="card" key={i.id}>
                <b>
                  {i.name} · {i.addressed ? "Addressed" : "New"}
                </b>
                <p>
                  {i.email} · {i.phone}
                  <br />
                  {i.service} · {new Date(i.createdAt).toLocaleDateString()}
                </p>
                <p style={{ whiteSpace: "pre-line" }}>{i.message}</p>
                <div className="actions">
                  <button
                    disabled={busy || i.addressed}
                    className="btn light"
                    onClick={() => action({ action: "address", id: i.id })}
                  >
                    Mark addressed
                  </button>
                  <button
                    disabled={busy}
                    className="btn light"
                    onClick={() => {
                      if (confirm("Permanently delete this inquiry?"))
                        action({ action: "delete", id: i.id });
                    }}
                  >
                    Delete inquiry
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
        {tab === "Testimonials" && (
          <>
            <h2 style={{ fontSize: 28 }}>Real voices, with permission.</h2>
            {s.testimonials.map((t, i) => (
              <div className="card form" key={i}>
                {(["name", "text", "businessType"] as const).map((k) => (
                  <label key={k}>
                    {k}
                    <input
                      value={t[k] || ""}
                      onChange={(e) =>
                        set(
                          "testimonials",
                          s.testimonials.map((a, j) =>
                            i === j ? { ...a, [k]: e.target.value } : a,
                          ),
                        )
                      }
                    />
                  </label>
                ))}
                <label>
                  Rating (optional, 1–5)
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={t.rating || ""}
                    onChange={(e) =>
                      set(
                        "testimonials",
                        s.testimonials.map((a, j) =>
                          i === j
                            ? {
                                ...a,
                                rating: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              }
                            : a,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  <input
                    style={{ width: "auto" }}
                    type="checkbox"
                    checked={t.permission}
                    onChange={(e) =>
                      set(
                        "testimonials",
                        s.testimonials.map((a, j) =>
                          i === j ? { ...a, permission: e.target.checked } : a,
                        ),
                      )
                    }
                  />{" "}
                  Client permission obtained — show testimonial
                </label>
                <button
                  className="btn light"
                  onClick={() =>
                    set(
                      "testimonials",
                      s.testimonials.filter((_, j) => i !== j),
                    )
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              className="btn light"
              onClick={() =>
                set("testimonials", [
                  ...s.testimonials,
                  { name: "", text: "", permission: false },
                ])
              }
            >
              Add a genuine testimonial
            </button>
          </>
        )}
        {tab === "Pricing" && (
          <>
            <h2 style={{ fontSize: 28 }}>Transparent pricing</h2>
            <p>
              Leave blank to show “Contact Us for a Personalized Quote.” Enter
              only approved fixed, starting, or range prices.
            </p>
            {services.map(([id, title]) => (
              <label key={id}>
                {title}
                <input
                  value={s.prices[id] || ""}
                  onChange={(e) =>
                    set("prices", { ...s.prices, [id]: e.target.value })
                  }
                />
              </label>
            ))}
          </>
        )}
        {tab === "Calculators" && (
          <>
            <h2 style={{ fontSize: 28 }}>Accuracy before estimates</h2>
            <div className="notice">
              All six planning calculators are active. Federal ordinary income
              and self-employment estimates support 2025 and 2026. Source data
              cross-check: {taxRules.verifiedAt}, against the versioned
              Tax-Calculator model. Quarterly payments use a 100% current-year
              planning budget, not a prior-year safe-harbor calculation. These
              simplified tools do not constitute professional tax review.
            </div>
            {field(
              "calculatorDisclaimer",
              "Calculator explanation and disclaimer",
              true,
            )}
            <p>
              Business profit, hourly rate, and savings formulas are active and
              have automated tests.
            </p>
          </>
        )}
        {tab === "FAQs" && (
          <>
            <h2 style={{ fontSize: 28 }}>Helpful answers</h2>
            <p>
              Default answers remain active until you save custom questions.
            </p>
            <button
              className="btn light"
              onClick={() =>
                set(
                  "customFaqs",
                  faqs.map(([question, answer]) => ({ question, answer })),
                )
              }
            >
              Start with default answers
            </button>
            {s.customFaqs.map((f, i) => (
              <div className="card form" key={i}>
                <label>
                  Question
                  <input
                    value={f.question}
                    onChange={(e) =>
                      set(
                        "customFaqs",
                        s.customFaqs.map((a, j) =>
                          i === j ? { ...a, question: e.target.value } : a,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Answer
                  <textarea
                    value={f.answer}
                    onChange={(e) =>
                      set(
                        "customFaqs",
                        s.customFaqs.map((a, j) =>
                          i === j ? { ...a, answer: e.target.value } : a,
                        ),
                      )
                    }
                  />
                </label>
                <button
                  className="btn light"
                  onClick={() =>
                    set(
                      "customFaqs",
                      s.customFaqs.filter((_, j) => i !== j),
                    )
                  }
                >
                  Remove question
                </button>
              </div>
            ))}
            <button
              className="btn light"
              onClick={() =>
                set("customFaqs", [
                  ...s.customFaqs,
                  { question: "New question", answer: "Add your answer." },
                ])
              }
            >
              Add a question
            </button>
          </>
        )}
        {tab === "Retention" && (
          <>
            <h2 style={{ fontSize: 28 }}>Keep only what you need.</h2>
            <label>
              Inquiry retention (days)
              <input
                type="number"
                min={1}
                max={3650}
                value={s.retentionDays}
                onChange={(e) => set("retentionDays", Number(e.target.value))}
              />
            </label>
            <p>
              Save changes first. Purge uses the saved policy. Run regularly or
              schedule a database maintenance job. Images are retained until
              separately removed from the Content table.
            </p>
            <button
              className="btn light"
              disabled={busy}
              onClick={() => {
                if (
                  confirm(
                    "Delete all inquiries older than the saved retention period?",
                  )
                )
                  action({ action: "purge" });
              }}
            >
              Delete expired inquiries and rate-limit records
            </button>
          </>
        )}
      </div>
      <div className="actions">
        <button
          className="btn"
          disabled={busy}
          onClick={() => action({ action: "save", settings: s })}
        >
          Save website changes
        </button>
      </div>
    </div>
  );
}
