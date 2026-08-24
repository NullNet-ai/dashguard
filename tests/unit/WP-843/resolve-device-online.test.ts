import { describe, expect, it } from 'vitest';

import {
  fetchLiveOnlineStatuses,
  resolveDeviceOnline,
} from '~/server/utils/deviceOnlineStatus';

// WP-843 — Device Grid showed Online for agents that were actually offline.
//
// What these tests actually protect is the BLAST RADIUS. The device_online_statuses
// view could not be probed against the production Store before merge, and an
// entity the Store rejects fails silently with HTTP 200 + an empty result. So
// the contract is:
//
//   view answered for this device -> use it, including `false`
//   view said nothing             -> use the stored devices.is_device_online
//   view query blew up entirely   -> same as "said nothing", for every device
//
// The last two lines are what guarantee the worst case is "unchanged from
// today" rather than "every device in production reads Offline".

const makeOrm = (result: unknown, onCall?: (args: any) => void) => ({
  findAll: (args: any) => {
    onCall?.(args);
    return {
      execute: async () => {
        if (result instanceof Error) throw result;
        return result;
      },
    };
  },
});

describe('fetchLiveOnlineStatuses', () => {
  it('maps device_id to the derived flag', async () => {
    const orm = makeOrm({
      data: [
        { device_id: 'd1', is_device_online: true },
        { device_id: 'd2', is_device_online: false },
      ],
    });
    const map = await fetchLiveOnlineStatuses(orm, 't', ['d1', 'd2']);

    expect(map.get('d1')).toBe(true);
    // `false` must be recorded, not discarded as "no answer".
    expect(map.get('d2')).toBe(false);
  });

  it('returns an empty map — never throws — when the query fails', async () => {
    // The silent-Store-rejection case, and the reason the view is queried
    // separately from the grid instead of joined into it.
    const orm = makeOrm(new Error('entity not accepted'));
    await expect(fetchLiveOnlineStatuses(orm, 't', ['d1'])).resolves.toEqual(
      new Map(),
    );
  });

  it('returns an empty map when the view yields no rows', async () => {
    const orm = makeOrm({ data: [] });
    expect((await fetchLiveOnlineStatuses(orm, 't', ['d1'])).size).toBe(0);
  });

  it('skips rows whose flag is null rather than recording a false', async () => {
    const orm = makeOrm({ data: [{ device_id: 'd1', is_device_online: null }] });
    expect((await fetchLiveOnlineStatuses(orm, 't', ['d1'])).has('d1')).toBe(
      false,
    );
  });

  it('does not query at all when there are no devices on the page', async () => {
    let called = false;
    const orm = makeOrm({ data: [] }, () => {
      called = true;
    });
    expect((await fetchLiveOnlineStatuses(orm, 't', [])).size).toBe(0);
    expect(called).toBe(false);
  });

  it('builds an OR chain over the page\'s device ids, de-duplicated', async () => {
    let filters: any[] = [];
    const orm = makeOrm({ data: [] }, (args) => {
      filters = args?.query?.advance_filters ?? [];
    });
    await fetchLiveOnlineStatuses(orm, 't', ['d1', 'd2', 'd1']);

    const criteria = filters.filter((f) => f.type === 'criteria');
    const operators = filters.filter((f) => f.type === 'operator');
    expect(criteria.map((c) => c.values[0])).toEqual(['d1', 'd2']);
    // n criteria need n-1 joining operators, and must not start with one —
    // a leading/trailing operator is what broke the WP-838 filter list.
    expect(operators).toHaveLength(1);
    expect(filters[0]?.type).toBe('criteria');
    expect(filters[filters.length - 1]?.type).toBe('criteria');
  });
});

describe('resolveDeviceOnline', () => {
  it('prefers the derived value over the stored one', () => {
    const live = new Map([['d1', false]]);
    expect(resolveDeviceOnline({ id: 'd1', is_device_online: true }, live)).toBe(
      false,
    );
  });

  it('reports online when the view says so and the stored flag is stale', () => {
    const live = new Map([['d1', true]]);
    expect(
      resolveDeviceOnline({ id: 'd1', is_device_online: false }, live),
    ).toBe(true);
  });

  it('falls back to the stored true when the view has no row for the device', () => {
    // Reporting Offline here is the production outage this fallback prevents.
    expect(resolveDeviceOnline({ id: 'd9', is_device_online: true }, new Map())).toBe(
      true,
    );
  });

  it('falls back to the stored false', () => {
    expect(
      resolveDeviceOnline({ id: 'd9', is_device_online: false }, new Map()),
    ).toBe(false);
  });

  it('falls back when no map is supplied at all', () => {
    expect(resolveDeviceOnline({ id: 'd1', is_device_online: true })).toBe(true);
  });

  it('returns false when neither source says anything', () => {
    expect(resolveDeviceOnline({})).toBe(false);
  });
});
