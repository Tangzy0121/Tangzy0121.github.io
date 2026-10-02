import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { categories, posts } from "@/lib/posts";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <SiteShell>
      <header className="page-header">
        <p className="eyebrow">Categories</p>
        <h1 className="page-title">A map of the notebook.</h1>
        <p className="page-intro">Broad shelves for the subjects that keep returning.</p>
      </header>
      <div className="taxonomy-grid">
        {categories.map((category) => {
          const categoryPosts = posts.filter((post) => post.category === category);
          return (
            <section className="taxonomy-card" key={category}>
              <div><span>{String(categoryPosts.length).padStart(2, "0")}</span><h2>{category}</h2></div>
              {categoryPosts.map((post) => <Link href={`/blog/${post.slug}`} key={post.slug}>{post.title} →</Link>)}
            </section>
          );
        })}
      </div>
    </SiteShell>
  );
}
