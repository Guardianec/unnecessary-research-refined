import test from "node:test";
import assert from "node:assert/strict";
import {
  random,
  dataset,
  simulate,
  evaluate,
  weighted,
} from "../src/lib/fakeData";
import { report } from "../src/content/report";
test("seeded data reproduces and changes with the seed", () => {
  assert.deepEqual(dataset(42), dataset(42));
  assert.notDeepEqual(dataset(42), dataset(43));
  const r = random(1);
  for (let i = 0; i < 10000; i++) {
    const n = r();
    assert.ok(n >= 0 && n < 1);
  }
  for (const point of dataset()) assert.ok(point.y >= 0 && point.y <= 100);
});
test("simulation counts every scenario exactly once", () => {
  const data = simulate(42);
  assert.equal(data.length, 10000);
  assert.deepEqual(data, simulate(42));
  const wins = data.filter(Boolean).length;
  assert.ok(wins > 9200 && wins < 9500);
  assert.equal(wins + data.filter((v) => !v).length, 10000);
});
test("weighted matrix agrees with published totals", () => {
  assert.ok(
    Math.abs(report.criteria.reduce((s, r) => s + r[1], 0) - 1) < 1e-10,
  );
  const [mine, theirs] = weighted(report.criteria);
  assert.equal(Number(mine.toFixed(2)), report.statistics.mine);
  assert.equal(Number(theirs.toFixed(2)), report.statistics.theirs);
});
test("live model responds, stays bounded and has explicit compromised state", () => {
  const values = Object.fromEntries(report.sliders.map(([k, , v]) => [k, v]));
  assert.notEqual(
    evaluate(values).probability,
    evaluate({ ...values, evidence: 0 }).probability,
  );
  assert.deepEqual(
    evaluate({ ...values, evidence: 0, sense: 0, confidence: 100 }),
    { probability: 0, compromised: true },
  );
  for (let i = 0; i <= 100; i++) {
    const v = Object.fromEntries(report.sliders.map(([k]) => [k, i]));
    const result = evaluate(v);
    assert.ok(result.probability >= 51 && result.probability <= 99.9);
  }
});
test("report contains forty unique fictional exhibits", () => {
  assert.equal(report.exhibits.length, 40);
  assert.equal(new Set(report.exhibits.map((e) => e[0])).size, 40);
  assert.match(report.friendName, /\[/);
  assert.equal(report.chapters.length, 10);
});
