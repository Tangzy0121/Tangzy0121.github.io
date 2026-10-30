// Typo tolerance for command names, like zsh's `correct` / fish's suggestions.
// Used only after exact, prefix and substring matching have all failed.

/** Optimal-string-alignment distance: insert, delete, substitute, swap adjacent. */
export function editDistance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  return d[a.length][b.length];
}

const isSubsequence = (q: string, w: string) => { let i = 0; for (const c of w) if (c === q[i]) i++; return i === q.length; };
const sorted = (s: string) => [...s].sort().join('');

/**
 * Score how plausibly `q` is a mistyped `w` (lower is better), or null if unrelated.
 *  - 1-letter input never matches (too random).
 *  - same letters in another order ("tixe" → exit)
 *  - small edit distance, scaled to length (≤1 for 3–5 chars, ≤2 for 6+)
 *  - dropped letters ("xi" → exit): q is an in-order subsequence covering ≥ half of w
 */
export function typoScore(q: string, w: string): number | null {
  if (q.length < 2 || q === w) return null;
  if (q.length === w.length && sorted(q) === sorted(w)) return 1;
  const d = editDistance(q, w);
  const limit = q.length <= 2 ? 0 : q.length <= 5 ? 1 : 2;
  if (d <= limit) return d;
  if (isSubsequence(q, w) && q.length * 2 >= w.length) return 1.5 + (w.length - q.length) * 0.1;
  return null;
}

/** Best typo candidates for q among words, best first (max 3). */
export function didYouMean(q: string, words: string[]): string[] {
  const s = q.toLowerCase();
  return words
    .map((w) => ({ w, s: typoScore(s, w) }))
    .filter((x): x is { w: string; s: number } => x.s !== null)
    .sort((a, b) => a.s - b.s || a.w.length - b.w.length || a.w.localeCompare(b.w))
    .slice(0, 3)
    .map((x) => x.w);
}
