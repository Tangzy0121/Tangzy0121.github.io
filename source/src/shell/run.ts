import type { Context } from './types';
import type { Registry } from './registry';
import { splitPipe, tokenize } from './parser';

/** Execute a pipeline. Non-final stages write into a buffer that becomes the next stage's stdin. */
export function runLine(line: string, reg: Registry, ctx: Context, phrases: Record<string, string> = {}): void {
  const norm = line.trim().toLowerCase().replace(/\s+/g, ' ');
  if (phrases[norm]) line = phrases[norm];
  const stages = splitPipe(line);
  let stdin: string | undefined;
  for (let i = 0; i < stages.length; i++) {
    const argv = tokenize(stages[i]);
    if (argv.length === 0) return ctx.print('syntax error: empty command in pipeline', 'error');
    const [name, ...args] = argv;
    const cmd = reg.get(name) ?? reg.get(name.replace(/^(\/|~\/)?bin\//, ''));
    if (!cmd) return ctx.print(`command not found: ${name} — try help`, 'error');
    if (i === stages.length - 1) return cmd.run(args, { ...ctx, stdin });
    const buf: string[] = [];
    cmd.run(args, {
      ...ctx,
      stdin,
      tty: false,
      print: (t) => void buf.push(...t.split('\n')),
      printParts: (p) => void buf.push(p.map((x) => x.text).join('')),
      clear: () => {},
      welcome: () => {},
      switchPage: () => {},
      page: (l) => void buf.push(...l),
    });
    stdin = buf.join('\n');
  }
}
