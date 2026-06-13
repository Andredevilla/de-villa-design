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

import { wobbleRadius } from '../js/blob-physics.mjs';

test('wobbleRadius returns base radius when amplitude is zero', () => {
  assert.equal(wobbleRadius(100, 1.2, 3.4, 0), 100);
});

test('wobbleRadius stays within +/- amplitude of base radius', () => {
  const base = 100, amp = 0.2;
  for (let a = 0; a < Math.PI * 2; a += 0.3) {
    const r = wobbleRadius(base, a, 5, amp);
    assert.ok(r >= base * (1 - amp) - 1e-9 && r <= base * (1 + amp) + 1e-9,
      `radius ${r} out of range at angle ${a}`);
  }
});

import { repulsionForce } from '../js/blob-physics.mjs';

test('repulsionForce is zero outside the radius', () => {
  const f = repulsionForce(200, 0, 0, 0, 100, 50); // dist 200 > radius 100
  assert.deepEqual(f, { fx: 0, fy: 0 });
});

test('repulsionForce pushes away from cursor and is stronger when closer', () => {
  const near = repulsionForce(10, 0, 0, 0, 100, 50);  // blob right of cursor, close
  const far = repulsionForce(80, 0, 0, 0, 100, 50);   // blob right of cursor, far
  assert.ok(near.fx > 0, 'pushes in +x away from cursor');
  assert.equal(near.fy, 0);
  assert.ok(near.fx > far.fx, 'closer blob gets a stronger push');
});
