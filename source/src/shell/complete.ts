// Tab completion. Smarter than a plain prefix match:
//  - case-insensitive
//  - commands, aliases and multi-word phrases ("google scholar") share one namespace
//  - exact prefix first, then substring fallback (>=2 chars)
//  - paths complete per-segment; `cd` completes directories only
import type { DirNode } from './types';
import { resolve } from './vfs';
import { didYouMean } from './fuzzy';

/** `fix` marks a typo correction rather than a completion of what was typed. */
export type Completion = { next?: string; candidates?: string[]; fix?: boolean };

export function commonPrefix(words: string[]): string {
  if (words.length === 0) return '';
  let p = words[0];
  for (const w of words.slice(1)) while (!w.toLowerCase().startsWith(p.toLowerCase())) p = p.slice(0, -1);
  return p;
}

function pick(pool: string[], q: string, allowSubstring: boolean): string[] {
  let m = pool.filter((z) => z.startsWith(q));
  if (!m.length && allowSubstring && q.length >= 2) {
    m = pool.filter((z) => z.includes(q));
    // prefer single words over phrases that merely contain the same word
    if (m.some((z) => !z.includes(' '))) m = m.filter((z) => !z.includes(' '));
  }
  return m;
}

export function complete(line: string, words: string[], phrases: string[], root: DirNode, cwd: string[]): Completion {
  const trimmed = line.trimStart();
  const endsSpace = /\s$/.test(line);
  const parts = trimmed === '' ? [''] : endsSpace ? [...trimmed.split(/\s+/), ''] : trimmed.split(/\s+/);
  const idx = parts.length - 1;
  const q = trimmed.toLowerCase().replace(/\s+/g, ' ');

  const phraseHits = idx > 0 && !endsSpace ? phrases.filter((p) => p.startsWith(q)) : [];
  if (idx === 0 || phraseHits.length) {
    // A word that is just the head of a phrase ("google" of "google scholar")
    // yields to the phrase, so Tab on "Goo" goes all the way.
    const heads = new Set(phrases.map((p) => p.split(' ')[0]));
    const pool = idx === 0 ? [...new Set([...words.filter((w) => !heads.has(w)), ...phrases])] : phraseHits;
    const m = pick(pool, q, idx === 0);
    if (m.length === 0) {
      // Nothing starts with or contains it: try typo correction ("xi" → exit, "tixe" → exit).
      const fix = idx === 0 ? didYouMean(q, pool) : [];
      if (fix.length === 0) return {};
      return { next: `${fix[0]} `, fix: true, candidates: fix.length > 1 ? fix : undefined };
    }
    if (m.length === 1) return { next: `${m[0]} ` };
    const lcp = commonPrefix(m);
    return lcp.length > q.length && lcp.startsWith(q) ? { next: lcp, candidates: m } : { candidates: m };
  }

  const dirsOnly = parts[0].toLowerCase() === 'cd';
  const word = parts[idx];
  const slash = word.lastIndexOf('/');
  const base = slash >= 0 ? word.slice(0, slash + 1) : '';
  const stem = (slash >= 0 ? word.slice(slash + 1) : word).toLowerCase();
  const r = resolve(root, cwd, base === '' ? '.' : base);
  if (!r || r.node.type !== 'dir') return {};
  const hits = Object.values(r.node.children).filter(
    (c) => c.name.toLowerCase().startsWith(stem) && (!dirsOnly || c.type === 'dir'),
  );
  if (hits.length === 0) return {};
  if (hits.length === 1) {
    parts[idx] = base + hits[0].name + (hits[0].type === 'dir' ? '/' : ' ');
    return { next: parts.join(' ') };
  }
  const out: Completion = { candidates: hits.map((c) => c.name + (c.type === 'dir' ? '/' : '')) };
  const lcp = commonPrefix(hits.map((c) => c.name));
  if (lcp.length > stem.length) { parts[idx] = base + lcp; out.next = parts.join(' '); }
  return out;
}

/** Inline "ghost" suggestion: the remainder a unique completion would add. */
export function ghost(line: string, words: string[], phrases: string[], root: DirNode, cwd: string[]): string {
  if (!line.trim() || /\s$/.test(line)) return '';
  const c = complete(line, words, phrases, root, cwd);
  if (!c.next) return '';
  // Extends what was typed: show the rest inline. Otherwise (substring or typo): "→ exit?".
  if (c.next.toLowerCase().startsWith(line.toLowerCase())) return c.next.slice(line.length).trimEnd();
  return `  → ${c.next.trim()}?`;
}

/** Put one candidate from a completion menu into the line (replaces the word being completed). */
export function applyCandidate(line: string, cand: string): string {
  if (cand.includes(' ')) return `${cand} `;
  const parts = line.trimStart().split(/\s+/);
  if (/\s$/.test(line)) parts.push('');
  const last = parts.pop() ?? '';
  const base = parts.length ? last.slice(0, last.lastIndexOf('/') + 1) : '';
  parts.push(base + cand + (cand.endsWith('/') ? '' : ' '));
  return parts.join(' ');
}
