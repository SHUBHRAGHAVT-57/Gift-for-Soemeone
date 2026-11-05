import { test } from "node:test";
import assert from "node:assert/strict";
import { createShape } from "../src/shapes.ts";

for (const theme of ["rose", "ring"] as const) {
  test(`${theme} geometry is deterministic, finite and bounded`, () => {
    const data = createShape(theme, 6000);
    assert.equal(data.positions.length, 18000);
    assert.equal(data.colors.length, 18000);
    assert.deepEqual(data.positions, createShape(theme, 6000).positions);
    assert.ok(
      data.positions.every((n) => Number.isFinite(n) && Math.abs(n) < 4),
    );
    assert.ok(data.colors.every((n) => Number.isFinite(n) && n >= 0 && n <= 1));
  });
}

test("rose includes a long stem and leaves below its bloom", () => {
  const { positions } = createShape("rose", 6000);
  let stem = 0,
    leaves = 0,
    petals = 0;
  for (let i = 0; i < positions.length; i += 3) {
    const [x, y] = positions.slice(i, i + 2);
    if (y < -0.4 && Math.abs(x) < 0.2) stem++;
    if (y < -0.4 && Math.abs(x) > 0.3) leaves++;
    if (y > 0.4) petals++;
  }
  assert.ok(stem > 100 && leaves > 100 && petals > 1000);
});

test("ring has a hollow band and a diamond above it", () => {
  const { positions } = createShape("ring", 6000);
  let center = 0,
    diamond = 0;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i],
      y = positions[i + 1];
    if (Math.hypot(x, y + 0.3) < 0.6) center++;
    if (y > 1.1) diamond++;
  }
  assert.equal(center, 0);
  assert.ok(diamond > 500);
});
