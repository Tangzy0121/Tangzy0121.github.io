import Link from "next/link";
import { ArrowRight, Braces, BookOpen, MapPin } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { posts } from "@/lib/posts";

export default function Home() {
  const latest = posts[0];

  return (
    <SiteShell>
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Good day — welcome to my corner of the web.</p>
          <h1>
            I&apos;m Tangzy.
            <span>I solve problems and write down what I learn.</span>
          </h1>
          <p className="hero-description">
            An undergraduate at HIT, majoring in Big Data Management &amp;
            Application. Most of my coding time goes to programming contests
            and C++.
          </p>
          <div className="hero-actions">
            <Link className="primary-link" href="/blog">
              Read the notebook <ArrowRight size={17} />
            </Link>
            <a className="quiet-link" href="https://github.com/Tangzy0121">GitHub</a>
          </div>
        </div>

        <aside className="identity-card" aria-label="About Tangzy">
          <div className="orbit-mark" aria-hidden="true"><span>01</span></div>
          <p className="card-kicker">FIELD NOTES</p>
          <h2>Learning in public, one problem at a time.</h2>
          <ul>
            <li><MapPin size={16} /> Harbin Institute of Technology</li>
            <li><Braces size={16} /> Mainly C++</li>
            <li><BookOpen size={16} /> Algorithms · Data · CS</li>
          </ul>
          <p className="personal-note">
            And yes, I have a soft spot for <em>Mushoku Tensei</em> :)
          </p>
        </aside>
      </section>

      <section className="latest-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Latest entry</p>
            <h2>From the notebook</h2>
          </div>
          <Link href="/blog">All entries <ArrowRight size={15} /></Link>
        </div>

        <Link className="post-card featured-post" href={`/blog/${latest.slug}`}>
          <div>
            <p className="post-meta">{latest.date} · {latest.readingTime}</p>
            <h3>{latest.title}</h3>
            <p>{latest.description}</p>
          </div>
          <span className="post-index">001</span>
        </Link>
      </section>
    </SiteShell>
  );
}
