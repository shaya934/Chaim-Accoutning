"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
          No articles match that search. Try a different topic or a shorter
          search.
        </div>
      ) : (
        <div className="journal-index grid">
          {shown.map((a) => (
            <Link
              className="journal-story"
              href={`/articles/${a.slug}`}
              key={a.slug}
            >
              <div className="story-image">
                <img
                  className="articlecover"
                  alt="An illustrative financial planning workspace"
                  src={a.image || "/article-0.svg"}
                  loading="lazy"
                />
              </div>
              <div className="articlemeta">
                {a.category} · {a.minutes} min read
              </div>
              <h3>{a.title}</h3>
              <span className="underlined-link">
                Read the guide <ArrowUpRight size={17} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
