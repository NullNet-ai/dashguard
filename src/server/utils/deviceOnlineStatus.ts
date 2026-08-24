import { EOperator } from '@dna-platform/common-orm';

/**
 * WP-843 — Device Grid showed "Online" for agents that were actually offline.
 *
 * The grid rendered `devices.is_device_online`, a stored boolean that is never
 * aged out, so a device whose agent stopped reporting kept reading Online. The
 * `device_online_statuses` database view derives the same flag from recent
 * heartbeats; this module reads it and the grid prefers it.
 *
 * TWO DELIBERATE SAFETY DECISIONS, both driven by the same measured fact: an
 * entity the Store does not accept fails *silently* — HTTP 200, `error: null`,
 * empty result, nothing in the logs (WP-838, where `device_groups` is a
 * registered entity that nonetheless returns zero rows). The view could not be
 * probed against the production Store before merge, because `.env.local` points
 * SERVER_URL at a local store.
 *
 *   1. The view is queried SEPARATELY rather than joined into the grid query.
 *      A silently-rejected join could empty the entire device grid; a
 *      silently-rejected separate query can only return nothing.
 *   2. A device with no derived value falls back to its stored boolean, never
 *      to `false`. Defaulting to `false` would report every device Offline in
 *      production — a worse bug than the one being fixed.
 *
 * Together these bound the worst case at "unchanged from today".
 */

type Row = Record<string, any>;

const ENTITY = 'device_online_statuses';

/**
 * Builds the `device_id = a OR device_id = b OR ...` filter chain.
 *
 * There is no IN operator in use anywhere in this codebase, so an OR chain is
 * the established way to express this (compare the advance_filters assembly in
 * device.mainGrid). The list is one page of grid rows, so it stays small.
 */
const buildDeviceIdFilter = (deviceIds: string[]) =>
  deviceIds.flatMap((id, index) => [
    ...(index === 0
      ? []
      : [{ type: 'operator' as const, operator: EOperator.OR }]),
    {
      type: 'criteria' as const,
      field: 'device_id',
      operator: EOperator.EQUAL,
      values: [id],
      entity: ENTITY,
    },
  ]);

/**
 * Returns device_id -> live online flag for the given devices.
 *
 * Never throws and never rejects: any failure yields an empty map, which the
 * caller reads as "the view said nothing" and falls back per device. A lookup
 * that decorates the grid must not be able to break the grid.
 */
export const fetchLiveOnlineStatuses = async (
  // Typed loosely for the same reason every other router helper here is: the
  // ORM client's generic Model<any> does not satisfy a hand-written structural
  // interface.
  orm: any,
  token: string,
  deviceIds: string[],
): Promise<Map<string, boolean>> => {
  const byDeviceId = new Map<string, boolean>();
  const ids = [...new Set(deviceIds.filter(Boolean))];
  if (!ids.length) return byDeviceId;

  try {
    const response = await orm
      .findAll({
        entity: ENTITY,
        token,
        query: {
          pluck: ['device_id', 'is_device_online'],
          advance_filters: buildDeviceIdFilter(ids),
        },
      })
      .execute();

    for (const row of (response?.data ?? []) as Row[]) {
      const deviceId = row?.device_id ?? row?.[ENTITY]?.device_id;
      const flag = row?.is_device_online ?? row?.[ENTITY]?.is_device_online;
      // An explicit null/undefined test, not truthiness: `false` is a real
      // answer from the view and must be recorded as such.
      if (deviceId && flag !== undefined && flag !== null) {
        byDeviceId.set(String(deviceId), Boolean(flag));
      }
    }
  } catch {
    // Swallowed on purpose — see the contract above. The grid degrades to the
    // stored flag rather than failing.
    return new Map<string, boolean>();
  }

  return byDeviceId;
};

/**
 * Resolves the online flag for one grid row: the heartbeat-derived value when
 * the view supplied one for this device, otherwise the stored
 * `devices.is_device_online` it replaces.
 */
export const resolveDeviceOnline = (
  row: Row,
  liveOnlineByDeviceId?: Map<string, boolean>,
): boolean => {
  const deviceId = row?.id;
  if (deviceId && liveOnlineByDeviceId?.has(String(deviceId))) {
    return liveOnlineByDeviceId.get(String(deviceId))!;
  }
  return Boolean(row?.is_device_online);
};

export default resolveDeviceOnline;
