// Turns the compiled content manifest into the virtual filesystem and
// registers one command per document page (docs-as-commands).
import type { Command, DirNode, VNode } from '../shell/types';
import type { Registry } from '../shell/registry';
import { dir, file, resolve } from '../shell/vfs';
import { profile, tree } from '../generated/content';

const DESCS: Record<string, string> = {
  bio: 'About me', research: 'Research interests', projects: 'Selected projects', papers: 'Publications',
  awards: 'Honors and awards', education: 'Education', contact: 'Contact information',
};

function toNode(name: string, v: unknown): VNode {
  return typeof v === 'string' ? file(name, v) : dir(name, Object.fromEntries(Object.entries(v as object).map(([k, c]) => [k, toNode(k, c)])));
}

export function buildFs(reg: Registry): DirNode {
  const root = toNode('~', tree) as DirNode;
  root.children['cv.pdf'] = file('cv.pdf', '', true);
  // /bin: real tools only (not documents), like a Unix PATH dir.
  const bin = Object.fromEntries(reg.list().filter((c) => !c.doc).map((c) => [c.name, file(c.name, c.desc)]));
  return dir('~', { bin: dir('bin', bin), ...root.children });
}

export const pageNames = Object.keys(profile.pages);

export function docCommands(getFs: () => DirNode): Command[] {
  return Object.entries(profile.pages).map(([name, path]) => ({
    name, desc: DESCS[name] ?? path, group: 'Navigation' as const, doc: true,
    run(_a, ctx) {
      if (ctx.tty) ctx.switchPage(name);
      const r = resolve(getFs(), [], path);
      if (r?.node.type === 'file') ctx.print(r.node.content);
      // Projects: the text list stays in the terminal and the visual showcase opens on top (esc returns to the list).
      if (name === 'projects' && ctx.tty) ctx.openShowcase?.();
    },
  }));
}
