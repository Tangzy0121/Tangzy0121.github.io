import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { posts } from "@/lib/posts";

export const metadata: Metadata = { title: "Archive" };

export default function ArchivePage() {
  const years = Array.from(new Set(posts.map((post) => post.date.slice(-4))));
  return (
    <SiteShell>
      <header className="page-header">
        <p className="eyebrow">Archive</p>
        <h1 className="page-title">The record, over time.</h1>
        <p className="page-intro">Every published note, grouped by year.</p>
      </header>
      <div className="archive-list">
        {years.map((year) => (
          <section key={year}>
            <h2>{year}</h2>
            <div>
              {posts.filter((post) => post.date.endsWith(year)).map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.slug}>
                  <time>{post.date.replace(`, ${year}`, "")}</time><span>{post.title}</span><em>{post.category}</em>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </SiteShell>
  );
}
