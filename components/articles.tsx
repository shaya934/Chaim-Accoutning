"use client";
import { useState } from "react";
import Link from "next/link";
export type ArticleCard = {
  slug: string;
  title: string;
  category: string;
  image: string;
  minutes: number;
};
export default function Articles({ articles }: { articles: ArticleCard[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All topics");
  const shown = articles.filter(
    (a) =>
      (category === "All topics" || a.category === category) &&
      a.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="searchrow">
        <input
          aria-label="Search articles"
          placeholder="Find a little clarity…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Article category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {["All topics", ...new Set(articles.map((a) => a.category))].map(
            (c) => (
              <option key={c}>{c}</option>
            ),
          )}
        </select>
      </div>
      {!shown.length ? (
        <div className="empty">
          No published articles match your search. Professionally reviewed
          resources are coming soon.
        </div>
      ) : (
        <div className="grid">
          {shown.map((a) => (
            <Link className="card" href={`/articles/${a.slug}`} key={a.slug}>
              <img
                className="articlecover"
                alt="Financial planning illustration"
                src={a.image || "/article-0.svg"}
              />
              <div className="articlemeta">
                {a.category} · {a.minutes} min read
              </div>
              <h3>{a.title}</h3>
              <span className="btn text">Read the guide ↗</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
