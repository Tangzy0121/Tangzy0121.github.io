import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { posts } from "@/lib/posts";

export const metadata: Metadata = { title: "Notebook" };

export default function BlogPage() {
  return (
    <SiteShell>
      <header className="page-header">
        <p className="eyebrow">Notes</p>
        <h1 className="page-title">Things worth writing down.</h1>
        <p className="page-intro">
          Programming contests, course notes, and occasional reflections—kept
          here after I have formed my own understanding.
        </p>
      </header>
      <section className="index-list notebook-index" aria-label="Blog posts">
        {posts.map((post, index) => (
          <Link className="index-row" href={`/blog/${post.slug}`} key={post.slug}>
            <time>{post.date}</time>
            <div><h3>{post.title}</h3><p>{post.description}</p></div>
            <span>{String(index + 1).padStart(3, "0")}</span>
          </Link>
        ))}
      </section>
    </SiteShell>
  );
}
