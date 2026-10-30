// Site actions that are not documents: CV viewer, email, external profiles.
import type { Command } from '../shell/types';
import { profile } from '../generated/content';

export const cv: Command = {
  name: 'cv', desc: 'Open CV', group: 'Navigation',
  run(_a, ctx) {
    if (ctx.tty) ctx.switchPage('cv');
    ctx.print('Opening ~/cv.pdf in viewer… (esc to close)', 'muted');
    ctx.openCV();
  },
};

export const email: Command = {
  name: 'email', desc: 'Show & copy email', group: 'Navigation',
  run(_a, ctx) {
    ctx.print(`Email: ${profile.email}`);
    void ctx.copy(profile.email).then((ok) => ok && ctx.print('copied to clipboard ✓', 'muted'));
  },
};

function external(name: 'github' | 'scholar', desc: string): Command {
  const link = profile.links[name];
  return {
    name, desc, group: 'Navigation',
    run(_a, ctx) { ctx.print(`Opening ${link.label} → ${link.url}`, 'muted'); ctx.openUrl(link.url); },
  };
}
export const github = external('github', 'Open GitHub profile');
export const scholar = external('scholar', 'Open Google Scholar');

/** Commands that must not auto-run from a shared link (popups, clipboard, state changes). */
export const NO_DEEPLINK = new Set(['github', 'scholar', 'email', 'exit', 'clear', 'theme', 'share', 'history', 'paper']);

export const share: Command = {
  name: 'share', desc: 'Copy a link to this page or a command', group: 'Navigation',
  run(args, ctx) {
    const what = args.join(' ') || ctx.route || '';
    const url = `${location.origin}${location.pathname}${what ? `#${encodeURIComponent(what)}` : ''}`;
    ctx.print(url, 'link');
    void ctx.copy(url).then((ok) => ok && ctx.print('link copied ✓', 'muted'));
  },
};

export const paper: Command = {
  name: 'paper', desc: 'Open a paper in the PDF viewer (paper 1)', group: 'Navigation',
  run([n = '1'], ctx) {
    const i = Number.parseInt(n, 10) - 1;
    if (!ctx.openPaper || Number.isNaN(i) || !ctx.openPaper(i)) return ctx.print(`paper: no paper ${n} · try papers`, 'error');
    ctx.print(`Opening paper ${i + 1} in viewer… (esc to close)`, 'muted');
  },
};
