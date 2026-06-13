// tests/blob-physics.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clamp, lerp } from '../js/blob-physics.mjs';

test('clamp keeps value within bounds', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-3, 0, 10), 0);
  assert.equal(clamp(99, 0, 10), 10);
});

test('lerp interpolates linearly', () => {
  assert.equal(lerp(0, 10, 0), 0);
  assert.equal(lerp(0, 10, 1), 10);
  assert.equal(lerp(0, 10, 0.5), 5);
});
