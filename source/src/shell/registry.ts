import type { Command } from './types';

export interface Registry {
  register(c: Command): void;
  alias(name: string, target: string): void;
  /** Case-insensitive lookup through aliases. */
  get(name: string): Command | undefined;
  /** Primary (non-hidden) commands. */
  list(): Command[];
  /** Discoverable commands and aliases; hidden commands remain typed-only. */
  names(): string[];
  aliasesOf(name: string): string[];
}

export function createRegistry(): Registry {
  const cmds = new Map<string, Command>();
  const aliases = new Map<string, string>();
  return {
    register(c) { cmds.set(c.name.toLowerCase(), c); },
    alias(name, target) { aliases.set(name.toLowerCase(), target.toLowerCase()); },
    get(name) {
      const n = name.toLowerCase();
      return cmds.get(n) ?? cmds.get(aliases.get(n) ?? '');
    },
    list() { return [...cmds.values()].filter((c) => !c.hidden); },
    names() {
      const visible = [...cmds].filter(([, c]) => !c.hidden).map(([name]) => name);
      const visibleAliases = [...aliases].filter(([, target]) => !cmds.get(target)?.hidden).map(([name]) => name);
      return [...new Set([...visible, ...visibleAliases])].sort();
    },
    aliasesOf(name) { return [...aliases].filter(([, t]) => t === name).map(([a]) => a); },
  };
}
