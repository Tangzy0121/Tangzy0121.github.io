import type { Command } from '../shell/types';
import type { Registry } from '../shell/registry';
import { profile } from '../generated/content';

const GROUPS = ['Navigation', 'Filesystem', 'Text', 'Shell'] as const;

export function helpText(reg: Registry): string {
  const out = ['Tang Shell', 'Documents are commands (bio ≡ cat about.md); tools live in /bin.', ''];
  for (const g of GROUPS) {
    out.push(g);
    for (const c of reg.list().filter((c) => c.group === g)) {
      const al = reg.aliasesOf(c.name);
      out.push(`  ${c.name.padEnd(13)}${c.desc}${al.length ? ` (alias: ${al.join(', ')})` : ''}`);
    }
    out.push('');
  }
  out.push('Tips', '  Tab completes commands, links and paths (case-insensitive); → accepts the grey hint.',
    '  Pipes: cat bio | grep -i safety · History: ↑/↓ · Ctrl-L clear · Ctrl-C cancel · home / exit / Ctrl-D (empty) back to home');
  return out.join('\n');
}

export const help = (reg: Registry): Command => ({
  name: 'help', desc: 'Show this message', group: 'Shell',
  run(_a, ctx) { if (ctx.tty) ctx.switchPage('help'); ctx.print(helpText(reg)); },
});

export const whoami: Command = {
  name: 'whoami', desc: 'Print my summary', group: 'Shell',
  run: (_a, ctx) => ctx.print([profile.name, '', profile.role, profile.affiliation, '', 'Research',
    ...profile.interests.map((i) => `  ${i}`), '', 'Current focus', `  ${profile.focus}`].join('\n')),
};

export const history: Command = {
  name: 'history', desc: 'Command history', group: 'Shell',
  run: (_a, ctx) => ctx.history.forEach((h, i) => ctx.print(`${String(i + 1).padStart(4)}  ${h}`)),
};

export const clear: Command = { name: 'clear', desc: 'Clear terminal', group: 'Shell', run: (_a, ctx) => ctx.clear() };

const goHome: Command['run'] = (_a, ctx) => {
  if (ctx.home) return ctx.home();
  ctx.clear(); ctx.setCwd([]); ctx.welcome();
};
/** `home` and `exit` are the same action: back to the welcome screen at ~ (Ctrl-D on an empty line too). */
export const home: Command = { name: 'home', desc: 'Back to the home screen', group: 'Shell', run: goHome };
export const exit: Command = { name: 'exit', desc: 'Back to the home screen (same as home, Ctrl-D)', group: 'Shell', run: goHome };

export const echo: Command = { name: 'echo', desc: 'Print arguments', group: 'Shell', run: (a, ctx) => ctx.print(a.join(' ')) };

export const theme: Command = {
  name: 'theme', desc: 'Change theme (light|dark)', group: 'Shell',
  run([t], ctx) {
    if (!t) { ctx.print(`Current theme: ${ctx.theme}`, 'muted'); return ctx.print('Usage: theme light|dark', 'muted'); }
    if (t !== 'light' && t !== 'dark') return ctx.print(`theme: unknown theme '${t}' (expected light|dark)`, 'error');
    ctx.setTheme(t);
    ctx.print(`Theme set to ${t}.`, 'success');
  },
};

const LOGO = ['       _______', '      /_  __/', '       / /', '      / /', '     /_/'];
export const neofetch: Command = {
  name: 'neofetch', desc: 'System info', group: 'Shell',
  run(_a, ctx) {
    for (const l of LOGO) ctx.print(l, 'dir');
    ctx.print('');
    ctx.print([profile.name, '------------------------', `School    ${profile.affiliationShort}`,
      'Focus     DB / ML4CO / AI Safety', 'Editor    VS Code', 'Shell     Tang Shell'].join('\n'));
  },
};
