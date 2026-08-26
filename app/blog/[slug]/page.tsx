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
          <p className="eyebrow">{post.category} · {post.date}</p>
          <h1>{post.title}</h1>
          <p className="article-description">{post.description}</p>
        </header>
        <div className="article-content">
          {post.sections.map((section, index) => (
            <section key={index}>
              {section.heading && <h2>{section.heading}</h2>}
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.quote && <blockquote>{section.quote}</blockquote>}
            </section>
          ))}
        </div>
        <Link className="back-link" href="/blog">← Back to notebook</Link>
      </article>
    </SiteShell>
  );
}
