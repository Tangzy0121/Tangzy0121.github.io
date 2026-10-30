// Pure line-editing helpers (readline/emacs semantics), kept out of the view so they are testable.

/** Previous history index (< from) whose entry starts with prefix (case-insensitive); -1 if none. */
export function histPrev(hist: string[], prefix: string, from: number): number {
  const p = prefix.toLowerCase();
  for (let i = Math.min(from, hist.length) - 1; i >= 0; i--) if (hist[i].toLowerCase().startsWith(p) && hist[i] !== prefix) return i;
  return -1;
}
/** Next history index (> from) matching prefix; -1 means "back to the typed prefix". */
export function histNext(hist: string[], prefix: string, from: number): number {
  const p = prefix.toLowerCase();
  for (let i = from + 1; i < hist.length; i++) if (hist[i].toLowerCase().startsWith(p) && hist[i] !== prefix) return i;
  return -1;
}

/** Ctrl-R: newest entry at index < from that contains q (case-insensitive). */
export function reverseSearch(hist: string[], q: string, from: number): number {
  if (!q) return -1;
  const s = q.toLowerCase();
  for (let i = Math.min(from, hist.length) - 1; i >= 0; i--) if (hist[i].toLowerCase().includes(s)) return i;
  return -1;
}

const isWord = (c: string | undefined) => !!c && /[\p{L}\p{N}_]/u.test(c);
/** Alt-B: start of the previous word. */
export function wordLeft(s: string, pos: number): number {
  let i = pos;
  while (i > 0 && !isWord(s[i - 1])) i--;
  while (i > 0 && isWord(s[i - 1])) i--;
  return i;
}
/** Alt-F: end of the next word. */
export function wordRight(s: string, pos: number): number {
  let i = pos;
  while (i < s.length && !isWord(s[i])) i++;
  while (i < s.length && isWord(s[i])) i++;
  return i;
}

/** Ctrl-T: transpose the two characters around the caret. */
export function transpose(s: string, pos: number): { s: string; pos: number } {
  if (s.length < 2 || pos === 0) return { s, pos };
  const p = pos >= s.length ? s.length - 1 : pos;
  return { s: s.slice(0, p - 1) + s[p] + s[p - 1] + s.slice(p + 1), pos: p + 1 };
}

/** Pasted text: collapse newlines/tabs so a multi-line paste never runs as several commands. */
export const sanitizePaste = (t: string) => t.replace(/[\r\n\t]+/g, ' ').replace(/[\x00-\x1f\x7f]/g, '');
