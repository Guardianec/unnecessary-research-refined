/** Synthetic parody data only. No network, private inputs or real observations. */
export function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
export function dataset(seed = 42) {
  const r = random(seed);
  return Array.from({ length: 120 }, (_, i) => ({
    x: (i / 119) * 100,
    y: Math.max(4, Math.min(96, 94 - (i / 119) * 80 + (r() - 0.5) * 34)),
  }));
}
export function simulate(seed: number, count = 10000, win = 0.937) {
  const r = random(seed);
  return Array.from({ length: count }, () => r() < win);
}
export function evaluate(v: Record<string, number>) {
  const compromised = v.evidence === 0 && v.sense === 0 && v.confidence === 100;
  const probability = compromised
    ? 0
    : Math.max(
        51,
        Math.min(
          99.9,
          55 +
            v.evidence * 0.18 +
            v.sense * 0.12 +
            v.confidence * 0.05 +
            v.stubbornness * 0.06 +
            v.coffee * 0.015 -
            v.sleep * 0.025 +
            v.agreement * 0.015 +
            v.pressure * 0.025 +
            v.vibe * 0.015 +
            v.persistence * 0.035,
        ),
      );
  return { probability, compromised };
}
export function weighted(rows: [string, number, number, number][]) {
  return [2, 3].map((column) =>
    rows.reduce((sum, row) => sum + row[1] * Number(row[column]), 0),
  );
}
