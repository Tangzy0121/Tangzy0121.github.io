/** Split on unquoted `|`. Quotes are kept for the tokenizer. */
export function splitPipe(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let q: string | null = null;
  for (const c of line) {
    if (q) { if (c === q) q = null; cur += c; }
    else if (c === '"' || c === "'") { q = c; cur += c; }
    else if (c === '|') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/** Whitespace tokenizer honoring single/double quotes. */
export function tokenize(seg: string): string[] {
  const out: string[] = [];
  let cur = '';
  let q: string | null = null;
  let has = false;
  for (const c of seg) {
    if (q) { if (c === q) q = null; else cur += c; }
    else if (c === '"' || c === "'") { q = c; has = true; }
    else if (/\s/.test(c)) { if (cur !== '' || has) out.push(cur); cur = ''; has = false; }
    else cur += c;
  }
  if (cur !== '' || has) out.push(cur);
  return out;
}
