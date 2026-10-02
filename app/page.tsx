import Link from "next/link";
import { ArrowRight, Asterisk, Braces, BookOpen, MapPin } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { posts } from "@/lib/posts";

export default function Home() {
  return (
    <SiteShell>
      <section className="hero-grid compact-hero">
        <div className="hero-copy">
          <p className="eyebrow">FIELD NOTES · TANGZY</p>
          <h1>
            I&apos;m Tangzy.
            <span>Algorithms, data, systems—and things worth writing down.</span>
          </h1>
          <p className="hero-description">
            An undergraduate at HIT, majoring in Big Data Management &amp; Application.
            This is where scattered learning becomes clearer notes, code, and small experiments.
          </p>
          <div className="hero-actions">
            <Link className="primary-link" href="/blog">
              Browse the notes <ArrowRight size={17} />
            </Link>
            <a className="quiet-link" href="https://github.com/Tangzy0121">GitHub</a>
          </div>
        </div>

        <aside className="identity-card" aria-label="About Tangzy">
          <div className="orbit-mark" aria-hidden="true"><span>01</span></div>
          <p className="card-kicker">CURRENTLY EXPLORING</p>
          <h2>Understanding before naming a direction.</h2>
          <ul>
            <li><MapPin size={16} /> Harbin Institute of Technology</li>
            <li><Braces size={16} /> Algorithms · Data · Systems</li>
            <li><BookOpen size={16} /> Notes · Code · Experiments</li>
          </ul>
          <p className="personal-note">
            <Asterisk size={14} /> Somewhere between debugging and writing notes, you&apos;ll
            probably find me thinking about <em>Mushoku Tensei</em> ✨ 👀
          </p>
        </aside>
      </section>

      <section className="latest-section home-index">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recent writing</p>
            <h2>Notes, in reverse chronological order.</h2>
          </div>
          <Link href="/blog">All entries <ArrowRight size={15} /></Link>
        </div>

        <div className="index-list">
          {posts.slice(0, 5).map((post) => (
            <Link className="index-row" href={`/blog/${post.slug}`} key={post.slug}>
              <time>{post.date}</time>
              <div><h3>{post.title}</h3><p>{post.description}</p></div>
              <span>{post.category} <ArrowRight size={14} /></span>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
