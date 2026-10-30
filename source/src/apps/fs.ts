import type { Command } from '../shell/types';
import { resolve, pathString } from '../shell/vfs';
import { profile } from '../generated/content';

const PAGES: Record<string, string> = profile.pages;

function layout(names: string[], cols: number) {
  for (let n = Math.min(names.length, Math.max(1, Math.floor(cols / 4))); n >= 1; n--) {
    const rows = Math.ceil(names.length / n);
    const widths: number[] = [];
    for (let c = 0; c < n; c++) widths.push(Math.max(0, ...names.slice(c * rows, c * rows + rows).map((s) => s.length)) + 2);
    if (widths.reduce((a, b) => a + b, 0) - 2 <= cols) return { n, rows, widths };
  }
  return { n: 1, rows: names.length, widths: [0] };
}

export const ls: Command = {
  name: 'ls', desc: 'List files', group: 'Filesystem',
  run([p], ctx) {
    const r = resolve(ctx.fs, ctx.cwd, p);
    if (!r) return ctx.print(`ls: cannot access '${p}': No such file or directory`, 'error');
    if (r.node.type === 'file') return ctx.print(r.node.name);
    const items = Object.values(r.node.children).map((c) => ({ name: c.type === 'dir' ? `${c.name}/` : c.name, dir: c.type === 'dir' }));
    if (!items.length) return ctx.print('(empty)', 'muted');
    if (!ctx.tty) return ctx.print(items.map((i) => i.name).join('\n'));
    const L = layout(items.map((i) => i.name), ctx.cols);
    for (let row = 0; row < L.rows; row++) {
      const parts = [];
      for (let c = 0; c < L.n; c++) {
        const it = items[c * L.rows + row];
        if (!it) continue;
        parts.push({ text: it.name, kind: it.dir ? ('dir' as const) : undefined });
        if (c < L.n - 1 && items[(c + 1) * L.rows + row]) parts.push({ text: ' '.repeat(L.widths[c] - it.name.length) });
      }
      ctx.printParts(parts);
    }
  },
};

export const cd: Command = {
  name: 'cd', desc: 'Change directory', group: 'Filesystem',
  run([p = '~'], ctx) {
    const r = resolve(ctx.fs, ctx.cwd, p);
    if (!r) return ctx.print(`cd: no such file or directory: ${p}`, 'error');
    if (r.node.type !== 'dir') return ctx.print(`cd: not a directory: ${p}`, 'error');
    ctx.setCwd(r.segments);
  },
};

export const pwd: Command = { name: 'pwd', desc: 'Print working directory', group: 'Filesystem', run: (_a, ctx) => ctx.print(pathString(ctx.cwd)) };

export const cat: Command = {
  name: 'cat', desc: 'Display file contents', group: 'Filesystem',
  run(args, ctx) {
    if (!args.length) return ctx.print('Usage: cat <file>', 'muted');
    for (const p of args) {
      // `cat bio` works too: page names resolve to their document.
      const r = resolve(ctx.fs, ctx.cwd, p) ?? (PAGES[p.toLowerCase()] ? resolve(ctx.fs, [], PAGES[p.toLowerCase()]) : null);
      if (!r) { ctx.print(`cat: ${p}: No such file or directory`, 'error'); continue; }
      if (r.node.type === 'dir') {
        const readme = r.node.children['README.md'];
        if (readme?.type === 'file') ctx.print(readme.content);
        else ctx.print(`cat: ${p}: Is a directory`, 'error');
        continue;
      }
      if (r.node.pdf) { ctx.print(`Opening ${r.node.name} in viewer… (esc to close)`, 'muted'); ctx.openCV(); continue; }
      ctx.print(r.node.content);
    }
  },
};

export const tree: Command = {
  name: 'tree', desc: 'Show directory tree', group: 'Filesystem',
  run([p], ctx) {
    const r = resolve(ctx.fs, ctx.cwd, p);
    if (!r) return ctx.print(`tree: ${p}: No such file or directory`, 'error');
    if (r.node.type === 'file') return ctx.print(r.node.name);
    ctx.print(pathString(r.segments), 'dir');
    const walk = (n: typeof r.node, pre: string) => {
      if (n.type !== 'dir') return;
      const kids = Object.values(n.children);
      kids.forEach((k, i) => {
        const last = i === kids.length - 1;
        ctx.print(`${pre}${last ? '└── ' : '├── '}${k.name}`, k.type === 'dir' ? 'dir' : 'output');
        if (k.type === 'dir') walk(k, pre + (last ? '    ' : '│   '));
      });
    };
    walk(r.node, '');
  },
};
