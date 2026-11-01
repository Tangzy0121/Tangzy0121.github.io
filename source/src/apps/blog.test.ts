import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createShell } from './index';
import { NO_DEEPLINK } from './site';
import { complete } from '../shell/complete';
import { runLine } from '../shell/run';
import type { Context } from '../shell/types';

test('blog dispatch opens the published directory and is discoverable', () => {
  const { reg, fs, phrases } = createShell();
  const opened: string[] = [];
  const ctx: Context = { fs, cwd: [], setCwd() {}, print() {}, printParts() {}, clear() {}, welcome() {}, switchPage() {}, page() {},
    history: [], theme: 'dark', setTheme() {}, cols: 80, rows: 24, tty: true, openUrl(url) { opened.push(url); }, copy: async () => true, openCV() {} };
  runLine('BLOG', reg, ctx, phrases);
  assert.deepEqual(opened, ['https://tangzy0121.github.io/Tangzy0121/blog/']);
  assert(reg.list().some(command => command.name === 'blog'));
  assert.equal(complete('blo', reg.names(), Object.keys(phrases), fs, []).next, 'blog ');
  assert(NO_DEEPLINK.has('blog'), 'opening a shared #blog link must not trigger a popup');
});
