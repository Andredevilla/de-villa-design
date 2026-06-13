// js/blob-physics.mjs
// Pure, deterministic helpers for the blob background. No DOM access — unit-testable.

export const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);

export const lerp = (a, b, t) => a + (b - a) * t;

// Radius at a given angle for the jellyfish morph. Two sine terms weighted 0.6/0.4
// sum to amplitude 1.0, so the result stays within base * (1 ± amp).
export function wobbleRadius(baseR, angle, t, amp) {
  const w = Math.sin(3 * angle + t) * 0.6 + Math.sin(2 * angle - 0.7 * t) * 0.4;
  return baseR * (1 + amp * w);
}

// Push a blob centre (bx,by) away from the cursor (cx,cy) if within `radius`.
// Falloff is linear: full strength at the cursor, zero at the radius edge.
export function repulsionForce(bx, by, cx, cy, radius, strength) {
  const dx = bx - cx, dy = by - cy;
  const dist = Math.hypot(dx, dy);
  if (dist >= radius || dist === 0) return { fx: 0, fy: 0 };
  const falloff = (radius - dist) / radius;
  const f = strength * falloff;
  return { fx: (dx / dist) * f, fy: (dy / dist) * f };
}
