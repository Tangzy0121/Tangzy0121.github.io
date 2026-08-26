import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <SiteShell>
      <header className="page-header">
        <p className="eyebrow">Projects</p>
        <h1 className="page-title">Only when they are ready.</h1>
        <p className="page-intro">I would rather leave this page quiet than fill it with work I do not yet believe represents me.</p>
      </header>
      <section className="empty-card">
        <h2>Work in progress.</h2>
        <p>Projects worth showing will gradually appear here—with context, decisions, and honest documentation.</p>
      </section>
    </SiteShell>
  );
}
