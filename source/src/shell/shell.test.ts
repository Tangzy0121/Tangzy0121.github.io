import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitPipe, tokenize } from './parser';
import { complete, ghost } from './complete';
import { resolve } from './vfs';
import { runLine } from './run';
import { createShell } from '../apps';
import type { Context } from './types';

const { reg, fs, phrases } = createShell();
const words = reg.names();
const ph = Object.keys(phrases);
const c = (line: string, cwd: string[] = []) => complete(line, words, ph, fs, cwd);

function fakeCtx(out: string[], extra: Partial<Context> = {}): Context {
  return {
    fs, cwd: [], setCwd() {}, print: (t) => void out.push(...t.split('\n')), printParts: (p) => void out.push(p.map((x) => x.text).join('')),
    clear() {}, welcome() {}, switchPage() {}, page: (l) => void out.push(...l), history: [], theme: 'light', setTheme() {},
    cols: 80, rows: 24, tty: false, openUrl: (u) => void out.push(`OPEN ${u}`), copy: async () => true, openCV: () => void out.push('CV'), ...extra,
  };
}

test('parser: pipes and quotes', () => {
  assert.deepEqual(splitPipe('cat a | grep "x|y"'), ['cat a', 'grep "x|y"']);
  assert.deepEqual(tokenize(`grep -i 'two words' f`), ['grep', '-i', 'two words', 'f']);
});

test('completion: case-insensitive, aliases, phrases, substring', () => {
  assert.equal(c('Google').next, 'google scholar ');
  assert.equal(c('goo').next, 'google scholar ');
  assert.equal(c('google s').next, 'google scholar ');
  assert.equal(c('Scholar').next, 'scholar ');
  assert.equal(c('GitHub').next, 'github ');
  assert.equal(c('hub').next, 'github ');
  assert.equal(c('lar').next, 'scholar ');
  assert.equal(c('Ema').next, 'email ');
  assert.equal(c('wh').next, 'whoami ');
  assert.ok(c('g').candidates!.includes('google scholar'));
});

test('completion: paths and cd dirs-only', () => {
  assert.equal(c('cat AB').next, 'cat about.md ');
  assert.equal(c('cd pro').next, 'cd projects/');
  assert.equal(c('cat research/sa').next, 'cat research/safece/');
  assert.equal(ghost('sch', words, ph, fs, []), 'olar');
});

test('vfs: docs at root, tools in /bin, case-insensitive', () => {
  assert.ok(resolve(fs, [], 'bin/less'));
  assert.ok(resolve(fs, [], 'bin/whoami'));
  assert.equal(resolve(fs, [], 'bin/bio'), null, 'documents are not in /bin');
  assert.ok(resolve(fs, [], '~/Research/SafeCE/README.md'));
});

test('docs-as-commands: bio ≡ cat about.md', () => {
  const a: string[] = [], b: string[] = [];
  runLine('bio', reg, fakeCtx(a));
  runLine('cat about.md', reg, fakeCtx(b));
  assert.deepEqual(a, b);
  assert.match(a[0], /# About/);
});

test('dispatch: case-insensitive, aliases, phrase, pipes, links', () => {
  const o: string[] = [];
  runLine('SCHOLAR', reg, fakeCtx(o));
  runLine('google scholar', reg, fakeCtx(o), phrases);
  runLine('gh', reg, fakeCtx(o));
  assert.equal(o.filter((x) => x === 'OPEN https://scholar.google.com/citations?user=SQIsoDwAAAAJ').length, 2);
  assert.ok(o.includes('OPEN https://github.com/tangzy0121'));
  const p: string[] = [];
  runLine('cat bio | grep -i safety | wc -l', reg, fakeCtx(p));
  assert.equal(p.at(-1), '3');
  const q: string[] = [];
  runLine('cat cv.pdf', reg, fakeCtx(q));
  assert.ok(q.includes('CV'));
});

test('content: no dead links in docs', () => {
  const all: string[] = [];
  const walk = (n: typeof fs) => Object.values(n.children).forEach((k) => (k.type === 'dir' ? walk(k) : all.push(k.content)));
  walk(fs);
  assert.ok(!all.some((t) => /\]\(#\)/.test(t)));
});

test('typo correction: dropped letters, swaps, anagrams; no noise', async () => {
  const { didYouMean } = await import('./fuzzy');
  const W = [...words, ...ph];
  assert.equal(didYouMean('xi', W)[0], 'exit');
  assert.equal(didYouMean('exti', W)[0], 'exit');
  assert.equal(didYouMean('tixe', W)[0], 'exit');
  assert.equal(didYouMean('scholr', W)[0], 'scholar');
  assert.equal(didYouMean('gtihub', W)[0], 'github');
  assert.equal(didYouMean('hlep', W)[0], 'help');
  assert.equal(didYouMean('projcets', W)[0], 'projects');
  assert.equal(didYouMean('googel scholar', W)[0], 'google scholar');
  assert.deepEqual(didYouMean('q', W), []);
  assert.deepEqual(didYouMean('zzzz', W), []);
  assert.equal(c('xi').next, 'exit ');
  assert.equal(c('tixe').fix, true);
  assert.equal(c('tixe').next, 'exit ');
  assert.equal(ghost('xi', words, ph, fs, []), '  → exit?');
  const o: string[] = []; let s = '';
  runLine('xi', reg, fakeCtx(o, { suggest: (l) => void (s = l) }), phrases);
  assert.equal(s, 'exit');
  assert.match(o[1], /you could try: `exit`/);
  runLine('cat bio | grpe -i safety', reg, fakeCtx(o, { suggest: (l) => void (s = l) }), phrases);
  assert.equal(s, 'cat bio | grep -i safety');
});
