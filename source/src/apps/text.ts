import type { Command, Context, Part } from '../shell/types';
import { readText, resolve } from '../shell/vfs';

/** Input for a text tool: a file argument, else stdin. */
function input(ctx: Context, path: string | undefined, tool: string, usage: string): string | undefined {
  if (path) return readText(ctx.fs, ctx.cwd, path, tool, (m) => ctx.print(m, 'error'));
  if (ctx.stdin === undefined) ctx.print(usage, 'muted');
  return ctx.stdin;
}

export const grep: Command = {
  name: 'grep', desc: 'Search lines', group: 'Text',
  run(args, ctx) {
    const a = [...args];
    const i = a[0] === '-i' ? (a.shift(), true) : false;
    const pat = a[0];
    if (!pat) return ctx.print('Usage: grep [-i] <pattern> [file]', 'muted');
    const text = input(ctx, a[1], 'grep', 'grep: no input (pipe something or pass a file)');
    if (text === undefined) return;
    const needle = i ? pat.toLowerCase() : pat;
    for (const line of text.split('\n')) {
      const hay = i ? line.toLowerCase() : line;
      if (!hay.includes(needle)) continue;
      const parts: Part[] = [];
      let at = 0;
      for (let k = hay.indexOf(needle); k !== -1; k = hay.indexOf(needle, at)) {
        if (k > at) parts.push({ text: line.slice(at, k) });
        parts.push({ text: line.slice(k, k + needle.length), kind: 'link' });
        at = k + needle.length;
      }
      parts.push({ text: line.slice(at) });
      ctx.printParts(parts);
    }
  },
};

export const find: Command = {
  name: 'find', desc: 'List files recursively', group: 'Text',
  run(args, ctx) {
    const a = [...args];
    let name: string | undefined;
    const ni = a.indexOf('-name');
    if (ni >= 0) { name = a[ni + 1]?.toLowerCase(); a.splice(ni, 2); }
    const r = resolve(ctx.fs, ctx.cwd, a[0]);
    if (!r) return ctx.print(`find: ${a[0]}: No such file or directory`, 'error');
    const out = (p: string, isDir: boolean, leaf: string) => {
      if (!name || leaf.toLowerCase().includes(name)) ctx.print(isDir ? `${p}/` : p, isDir ? 'dir' : 'output');
    };
    const walk = (n: typeof r.node, pre: string) => {
      if (n.type !== 'dir') return;
      for (const k of Object.values(n.children)) {
        out(pre + k.name, k.type === 'dir', k.name);
        walk(k, `${pre}${k.name}/`);
      }
    };
    if (r.node.type === 'file') return out(r.segments.join('/'), false, r.node.name);
    walk(r.node, r.segments.length ? `${r.segments.join('/')}/` : '');
  },
};

export const wc: Command = {
  name: 'wc', desc: 'Count lines/words/chars', group: 'Text',
  run(args, ctx) {
    const a = [...args];
    const mode = a[0] === '-l' ? 'l' : a[0] === '-w' ? 'w' : '';
    if (mode) a.shift();
    const f = a[0];
    const t = input(ctx, f, 'wc', 'Usage: wc [-l|-w] [file]');
    if (t === undefined) return;
    const l = t === '' ? 0 : t.split('\n').length, w = t.split(/\s+/).filter(Boolean).length, c = t.length;
    const sfx = f ? ` ${f}` : '';
    if (mode === 'l') return ctx.print(`${l}${sfx}`);
    if (mode === 'w') return ctx.print(`${w}${sfx}`);
    const p = (n: number) => String(n).padStart(7);
    ctx.print(`${p(l)} ${p(w)} ${p(c)}${sfx}`);
  },
};

function slice(name: 'head' | 'tail'): Command {
  return {
    name, desc: name === 'head' ? 'First lines' : 'Last lines', group: 'Text',
    run(args, ctx) {
      const a = [...args];
      let n = 10;
      if (a[0] === '-n') {
        n = parseInt(a[1] ?? '', 10);
        if (Number.isNaN(n) || n < 0) return ctx.print(`${name}: invalid number of lines: ${a[1]}`, 'error');
        a.splice(0, 2);
      } else if (a[0] && /^-\d+$/.test(a[0])) n = parseInt(a.shift()!.slice(1), 10);
      const t = input(ctx, a[0], name, `Usage: ${name} [-n N] [file]`);
      if (t === undefined) return;
      const lines = t.split('\n');
      ctx.print((name === 'head' ? lines.slice(0, n) : lines.slice(-n || lines.length)).join('\n'));
    },
  };
}
export const head = slice('head');
export const tail = slice('tail');

function pager(name: 'more' | 'less', desc: string): Command {
  return {
    name, desc, group: 'Text',
    run([f], ctx) {
      const t = input(ctx, f, name, `Usage: ${name} <file>  or  <cmd> | ${name}`);
      if (t === undefined) return;
      const lines = t.split('\n');
      if (!ctx.tty || lines.length <= ctx.rows - 1) return ctx.print(t);
      ctx.page(lines);
    },
  };
}
export const more = pager('more', 'Page through output (space/b/q)');
export const less = pager('less', 'Pager with j/k, PageUp/PageDown');
