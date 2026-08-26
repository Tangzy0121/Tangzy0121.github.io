import Link from "next/link";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-frame">
      <header className="site-header">
        <Link className="brand" href="/">Tangzy<span>.</span></Link>
        <nav className="site-nav" aria-label="Primary navigation">
          <Link href="/blog">Notebook</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/about">About</Link>
        </nav>
      </header>
      <main className="page-main">{children}</main>
      <footer className="site-footer">
        <span>Documenting the path, not decorating the result.</span>
        <span>© 2026 Tangzy</span>
      </footer>
    </div>
  );
}
