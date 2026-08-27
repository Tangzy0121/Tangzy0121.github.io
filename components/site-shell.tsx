import Link from "next/link";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-frame">
      <header className="site-header">
        <Link className="brand" href="/">Tangzy<span>.</span></Link>
        <nav className="site-nav" aria-label="Primary navigation">
          <Link href="/blog">Notes</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/tags">Tags</Link>
          <Link href="/archive">Archive</Link>
          <Link href="/about">About</Link>
        </nav>
      </header>
      <main className="page-main">{children}</main>
      <footer className="site-footer">
        <div>
          <span>Documenting the path, not decorating the result.</span>
          <Link href="/projects">Projects</Link>
          <a href="https://github.com/Tangzy0121">GitHub</a>
        </div>
        <span>Built from notes worth keeping · © 2026 Tangzy</span>
      </footer>
    </div>
  );
}
