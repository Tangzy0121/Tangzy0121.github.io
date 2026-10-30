import type { Context } from './types';
import type { Registry } from './registry';
import { splitPipe, tokenize } from './parser';
import { didYouMean } from './fuzzy';
import { resolve } from './vfs';

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
    // zsh-style AUTO_CD: a bare directory (`..`, `~`, `projects/`, `-`) changes into it.
    if (!cmd && args.length === 0 && stages.length === 1 && (name === '-' || resolve(ctx.fs, ctx.cwd, name)?.node.type === 'dir')) {
      return reg.get('cd')!.run([name], { ...ctx, stdin });
    }
    if (!cmd) {
      ctx.print(`command not found: ${name}`, 'error');
      const fix = didYouMean(name, [...reg.names(), ...Object.keys(phrases)]);
      if (!fix.length) return ctx.print('type `help` to see what this shell can do · 输入 help 查看全部命令', 'muted');
      const fixed = [...stages.slice(0, i), [fix[0], ...args].join(' '), ...stages.slice(i + 1)].join(' | ');
      ctx.suggest?.(fixed);
      return ctx.print(
        fix.length === 1
          ? `OK, you could try: \`${fix[0]}\` — press Tab or → to accept · 你是不是想输入 ${fix[0]}？`
          : `Maybe you want: ${fix.map((f) => `\`${f}\``).join(', ')} — Tab or → takes \`${fix[0]}\``,
        'warning',
      );
    }
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
