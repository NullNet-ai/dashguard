export interface CoreUsage {
  core: string;
  usage: number;
}

// Parses the composite-array text Postgres returns for cpu_usage/temperature,
// e.g. `[("cpu 0", 0.78), ("cpu 1", 17.6)]`. Falls back to [] on already-parsed
// arrays or malformed input.
export function parseCoreUsage(raw: unknown): CoreUsage[] {
  if (Array.isArray(raw)) {
    return raw
      .map((entry: any) =>
        Array.isArray(entry)
          ? { core: String(entry[0]), usage: Number(entry[1]) }
          : {
              core: String(entry?.core ?? ''),
              usage: Number(entry?.usage ?? 0),
            },
      )
      .filter((entry) => entry.core && Number.isFinite(entry.usage));
  }

  if (typeof raw !== 'string' || !raw.trim()) return [];

  const matches = raw.matchAll(/\(\s*"?([^",)]+)"?\s*,\s*([\d.]+)\s*\)/g);
  return Array.from(matches, (m) => ({
    core: m[1]!.trim(),
    usage: Number(m[2]),
  })).filter((entry) => Number.isFinite(entry.usage));
}

function demo() {
  const sample =
    '[("cpu 10", 0.80645156), ("cpu 8", 0.7692308), ("cpu 9", 0.78740156), ("cpu 11", 0.7692308), ("cpu 13", 6.2015505), ("cpu 0", 0.78125), ("cpu 14", 14.516129), ("cpu 1", 17.6), ("cpu 2", 0.78740156), ("cpu 6", 5.555556), ("cpu 15", 3.1007752), ("cpu 3", 0.0), ("cpu 7", 0.80645156), ("cpu 4", 0.0), ("cpu 5", 0.0), ("cpu 12", 0.0)]';
  const parsed = parseCoreUsage(sample);
  console.assert(
    parsed.length === 16,
    `expected 16 cores, got ${parsed.length}`,
  );
  console.assert(
    parsed.some((c) => c.core === 'cpu 1' && c.usage === 17.6),
    'cpu 1 usage mismatch',
  );
  console.assert(
    parsed.some((c) => c.core === 'cpu 3' && c.usage === 0),
    'cpu 3 usage mismatch',
  );
  console.assert(
    parseCoreUsage('[]').length === 0,
    'empty array should parse to []',
  );
  console.assert(
    parseCoreUsage(undefined).length === 0,
    'undefined should parse to []',
  );
}

if (process.env.NODE_ENV === 'test') demo();
