import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { getPost, posts } from "@/lib/posts";

export function generateStaticParams() { return posts.map((post) => ({ slug: post.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  return post ? { title: post.title, description: post.description } : {};
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <SiteShell>
      <article className="article">
        <header className="article-header">
          <p className="eyebrow">{post.category} · {post.date} · {post.readingTime}</p>
          <h1>{post.title}</h1>
          <p className="article-description">{post.description}</p>
          <div className="tag-row" aria-label="Tags">
            {post.tags.map((tag) => <Link href={`/tags#${tag.toLowerCase()}`} key={tag}>#{tag}</Link>)}
          </div>
        </header>
        <div className="article-layout">
          <div className="article-content">
            {post.sections.map((section, index) => (
              <section id={section.id} key={index}>
                {section.heading && <h2>{section.heading}</h2>}
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.quote && <blockquote>{section.quote}</blockquote>}
              </section>
            ))}
          </div>
          {post.sections.some((section) => section.heading) && (
            <aside className="article-toc" aria-label="Table of contents">
              <p>ON THIS PAGE</p>
              {post.sections.filter((section) => section.heading).map((section) => (
                <a href={`#${section.id}`} key={section.id}>{section.heading}</a>
              ))}
            </aside>
          )}
        </div>
        <Link className="back-link" href="/blog">← Back to notebook</Link>
      </article>
    </SiteShell>
  );
}
