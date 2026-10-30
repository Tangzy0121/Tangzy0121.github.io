import { test } from 'node:test';
import assert from 'node:assert/strict';
import { histNext, histPrev, reverseSearch, sanitizePaste, transpose, wordLeft, wordRight } from './readline';
import { applyCandidate } from './complete';
import { runLine } from './run';
import { createShell } from '../apps';
import type { Context } from './types';

const H = ['ls', 'cat bio', 'cd projects', 'cat papers', 'help'];
test('history: prefix-filtered up/down', () => {
  assert.equal(histPrev(H, 'cat', H.length), 3);
  assert.equal(histPrev(H, 'cat', 3), 1);
  assert.equal(histPrev(H, 'cat', 1), -1);
  assert.equal(histNext(H, 'cat', 1), 3);
  assert.equal(histNext(H, 'cat', 3), -1);
  assert.equal(histPrev(H, '', H.length), 4);
});
test('ctrl-r reverse search', () => {
  assert.equal(reverseSearch(H, 'proj', H.length), 2);
  assert.equal(reverseSearch(H, 'CAT', H.length), 3);
  assert.equal(reverseSearch(H, 'cat', 3), 1);
  assert.equal(reverseSearch(H, 'zzz', H.length), -1);
});
test('word motion, transpose, paste', () => {
  const s = 'cat projects/safece';
  assert.equal(wordLeft(s, s.length), 13);
  assert.equal(wordLeft(s, 13), 4);
  assert.equal(wordRight(s, 0), 3);
  assert.equal(wordRight(s, 3), 12);
  assert.deepEqual(transpose('sl', 2), { s: 'ls', pos: 2 });
  assert.equal(sanitizePaste('ls\nrm -rf\r\n'), 'ls rm -rf ');
});
test('menu candidate replaces the current word', () => {
  assert.equal(applyCandidate('g', 'github'), 'github ');
  assert.equal(applyCandidate('cat projects/', 'safece/'), 'cat projects/safece/');
  assert.equal(applyCandidate('cat pro', 'projects/'), 'cat projects/');
  assert.equal(applyCandidate('goo', 'google scholar'), 'google scholar ');
});
test('autocd, cd -, ll', () => {
  const { reg, fs, phrases } = createShell();
  let cwd: string[] = [], old: string[] | undefined;
  const out: string[] = [];
  const ctx = (): Context => ({
    fs, cwd, oldCwd: old, setCwd: (s) => { old = cwd; cwd = s; }, print: (t) => void out.push(t), printParts: (p) => void out.push(p.map((x) => x.text).join('')),
    clear() {}, welcome() {}, switchPage() {}, page() {}, history: [], theme: 'light', setTheme() {}, cols: 80, rows: 24, tty: false,
    openUrl() {}, copy: async () => true, openCV() {},
  });
  runLine('projects/', reg, ctx(), phrases); assert.deepEqual(cwd, ['projects']);
  runLine('..', reg, ctx(), phrases); assert.deepEqual(cwd, []);
  runLine('cd -', reg, ctx(), phrases); assert.deepEqual(cwd, ['projects']);
  runLine('~', reg, ctx(), phrases); assert.deepEqual(cwd, []);
  out.length = 0; runLine('ll', reg, ctx(), phrases);
  assert.ok(out.some((l) => /^drwxr-xr-x .*projects\/$/.test(l)), out.join('\n'));
});
