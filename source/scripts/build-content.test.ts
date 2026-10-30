import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate } from './build-content';

test('validate flags dead and broken cmd links', () => {
  const tree = { 'a.md': '[x](#) [y](cmd:cat ~/nope.md) [z](https://ok)', 'b.md': 'hi' };
  const errs = validate(tree, { pages: { a: 'a.md', c: 'c.md' } });
  assert.equal(errs.length, 3);
});
test('validate passes good content', () => {
  assert.deepEqual(validate({ 'a.md': '[b](cmd:cat ~/b.md)', 'b.md': '' }, { pages: { a: 'a.md' } }), []);
});

import { lastUpdate } from './build-content.ts';
test('lastUpdate is a YYYY-MM-DD git commit date', () => {
  assert.match(lastUpdate(process.cwd()), /^\d{4}-\d{2}-\d{2}$/);
});
