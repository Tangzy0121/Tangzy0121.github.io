import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <SiteShell>
      <header className="page-header">
        <p className="eyebrow">About</p>
        <h1 className="page-title">Hi, I&apos;m Tangzy.</h1>
        <p className="page-intro">
          An undergraduate at Harbin Institute of Technology, majoring in Big Data
          Management &amp; Application. I am exploring algorithms, data science,
          databases, systems, and their practical applications.
        </p>
      </header>
      <div className="about-grid">
        <section className="about-card"><h2>What I do</h2><p>I study Big Data Management &amp; Application, solve algorithmic problems, and turn scattered learning into notes, code, and small experiments.</p></section>
        <section className="about-card"><h2>Why this site exists</h2><p>To turn real learning into notes I can revisit—and, when useful, share with someone else.</p></section>
      </div>
    </SiteShell>
  );
}
