import type { DirNode, VNode } from './types';

export const file = (name: string, content: string, pdf = false): VNode => ({ type: 'file', name, content, pdf });
export const dir = (name: string, children: Record<string, VNode>): DirNode => ({ type: 'dir', name, children });

/** Resolve `path` against cwd. `~` and `/` are both the home root. */
export function resolve(root: DirNode, cwd: string[], path?: string): { node: VNode; segments: string[] } | null {
  const abs = !!path && (path.startsWith('/') || path.startsWith('~'));
  const seg = abs ? [] : [...cwd];
  for (const s of (abs ? path!.replace(/^[~/]+/, '') : path ?? '').split('/')) {
    if (s === '' || s === '.') continue;
    if (s === '..') seg.pop();
    else seg.push(s);
  }
  let cur: VNode = root;
  for (const s of seg) {
    if (cur.type !== 'dir') return null;
    const next: VNode | undefined =
      cur.children[s] ?? Object.values(cur.children).find((c) => c.name.toLowerCase() === s.toLowerCase());
    if (!next) return null;
    cur = next;
  }
  return { node: cur, segments: seg };
}

export const pathString = (seg: string[]) => (seg.length === 0 ? '~' : `~/${seg.join('/')}`);

/** Read a text file for text tools; returns an error string via onErr. */
export function readText(root: DirNode, cwd: string[], path: string, tool: string, onErr: (m: string) => void): string | undefined {
  const r = resolve(root, cwd, path);
  if (!r) return void onErr(`${tool}: ${path}: No such file or directory`);
  if (r.node.type === 'dir') return void onErr(`${tool}: ${path}: Is a directory`);
  if (r.node.pdf) return void onErr(`${tool}: ${path}: binary file (PDF) — try cv`);
  return r.node.content;
}
