import { createRegistry, type Registry } from '../shell/registry';
import type { DirNode } from '../shell/types';
import { profile } from '../generated/content';
import { buildFs, docCommands } from '../content/store';
import * as fs from './fs';
import * as text from './text';
import * as sh from './shell';
import * as site from './site';

/** Wire everything: documents + site actions + /bin tools + aliases. */
export function createShell(): { reg: Registry; fs: DirNode; phrases: Record<string, string> } {
  const reg = createRegistry();
  let root: DirNode | null = null;
  for (const c of docCommands(() => root!)) reg.register(c);
  for (const c of [site.cv, site.email, site.github, site.scholar, site.share]) reg.register(c);
  for (const c of [fs.ls, fs.ll, fs.cd, fs.pwd, fs.tree, fs.cat]) reg.register(c);
  for (const c of [text.grep, text.find, text.wc, text.head, text.tail, text.more, text.less]) reg.register(c);
  for (const c of [sh.whoami, sh.history, sh.clear, sh.home, sh.exit, sh.echo, sh.theme, sh.neofetch, sh.help(reg)]) reg.register(c);
  for (const [a, t] of Object.entries(profile.aliases)) reg.alias(a, t);
  root = buildFs(reg);
  return { reg, fs: root, phrases: { ...profile.phrases } };
}
