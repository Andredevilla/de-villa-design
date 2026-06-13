// js/blob-physics.mjs
// Pure, deterministic helpers for the blob background. No DOM access — unit-testable.

export const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);

export const lerp = (a, b, t) => a + (b - a) * t;
