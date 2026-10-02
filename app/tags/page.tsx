import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { posts, tags } from "@/lib/posts";

export const metadata: Metadata = { title: "Tags" };

export default function TagsPage() {
  return (
    <SiteShell>
      <header className="page-header">
        <p className="eyebrow">Tags</p>
        <h1 className="page-title">Smaller threads across the notes.</h1>
        <p className="page-intro">Specific ideas, tools, and themes—without forcing them into one shelf.</p>
      </header>
      <div className="tag-cloud" aria-label="All tags">
        {tags.map((tag) => <a href={`#${tag.toLowerCase()}`} key={tag}>#{tag}</a>)}
      </div>
      <div className="tag-groups">
        {tags.map((tag) => (
          <section id={tag.toLowerCase()} key={tag}>
            <h2>#{tag}</h2>
            {posts.filter((post) => post.tags.includes(tag)).map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.slug}><span>{post.date}</span>{post.title} →</Link>
            ))}
          </section>
        ))}
      </div>
    </SiteShell>
  );
}
