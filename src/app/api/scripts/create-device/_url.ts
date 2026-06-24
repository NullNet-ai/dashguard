import { type NextRequest } from 'next/server';

/**
 * Build the install base URL (`<proto>://<host>`) from the incoming request.
 *
 * The resulting URL is interpolated into shell scripts that run as root on the
 * target device, so the host/proto — both attacker-controllable request headers —
 * are strictly validated to contain only RFC-legal host characters. Anything that
 * could carry a shell metacharacter (quote, space, `;`, `$`, backtick, …) is
 * rejected, so the value can never break out of the single-quoted shell string.
 *
 * Returns the base URL, or `null` if the host/proto fail validation (caller
 * should respond 400).
 */
export function buildInstallBase(req: NextRequest): string | null {
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('host') ?? '';

  if (proto !== 'http' && proto !== 'https') return null;

  // reg-name / IPv4 with optional port, or bracketed IPv6 with optional port.
  const regName = /^[A-Za-z0-9.-]+(:\d{1,5})?$/;
  const ipv6 = /^\[[0-9A-Fa-f:]+\](:\d{1,5})?$/;
  if (!regName.test(host) && !ipv6.test(host)) return null;

  const base = `${proto}://${host}`;

  // Final guard: must parse as a URL whose protocol/host round-trip unchanged.
  try {
    const parsed = new URL(base);
    if (parsed.protocol !== `${proto}:` || parsed.host !== host) return null;
  } catch {
    return null;
  }

  return base;
}
