import { describe, expect, it } from 'vitest';

import {
  buildContactIdFilters,
  fetchContactDeviceGroupNames,
} from '~/server/utils/contactDeviceGroups';

// Minimal stand-in for the ORM query builder: join/nestedJoin are chainable
// no-ops and execute() returns whatever rows the test hands it.
const makeClient = (rows: any[] | (() => never)) => {
  const captured: { advance_filters?: any[] } = {};
  const query: any = {
    join: () => query,
    nestedJoin: () => query,
    execute: async () =>
      typeof rows === 'function' ? rows() : { data: rows },
  };
  return {
    captured,
    dnaClient: {
      findAll: (options: any) => {
        captured.advance_filters = options?.query?.advance_filters;
        return query;
      },
    },
  };
};

const row = (contact_id: string, ...names: string[]) => ({
  contact_id,
  device_groups: names.map((name) => ({
    device_group_settings: [{ id: name, name }],
  })),
});

describe('buildContactIdFilters', () => {
  it('never starts or ends with an operator element', () => {
    const filters = buildContactIdFilters(['c1', 'c2', 'c3']);

    expect(filters[0]).toMatchObject({ type: 'criteria' });
    expect(filters[filters.length - 1]).toMatchObject({ type: 'criteria' });
    expect(filters).toHaveLength(5);
  });

  it('emits one criteria for a single id, with no operator at all', () => {
    expect(buildContactIdFilters(['c1'])).toEqual([
      {
        type: 'criteria',
        field: 'contact_id',
        operator: 'equal',
        values: ['c1'],
        entity: 'device_contacts',
      },
    ]);
  });
});

describe('fetchContactDeviceGroupNames', () => {
  it('returns an empty map without querying when there are no contact ids', async () => {
    const { dnaClient, captured } = makeClient([]);

    const map = await fetchContactDeviceGroupNames(dnaClient, 'token', [
      undefined,
      null,
    ]);

    expect(map.size).toBe(0);
    expect(captured.advance_filters).toBeUndefined();
  });

  it('leaves a contact with no groups out of the map', async () => {
    const { dnaClient } = makeClient([{ contact_id: 'c1' }]);

    const map = await fetchContactDeviceGroupNames(dnaClient, 'token', ['c1']);

    expect(map.get('c1')).toBeUndefined();
  });

  it('maps a contact with one group', async () => {
    const { dnaClient } = makeClient([row('c1', 'Alpha')]);

    const map = await fetchContactDeviceGroupNames(dnaClient, 'token', ['c1']);

    expect(map.get('c1')).toEqual(['Alpha']);
  });

  it('merges several groups across rows and de-duplicates them', async () => {
    const { dnaClient } = makeClient([
      row('c1', 'Beta', 'Alpha'),
      row('c1', 'Alpha', 'Gamma'),
      row('c2', 'Delta'),
    ]);

    const map = await fetchContactDeviceGroupNames(dnaClient, 'token', [
      'c1',
      'c2',
    ]);

    expect(map.get('c1')).toEqual(['Alpha', 'Beta', 'Gamma']);
    expect(map.get('c2')).toEqual(['Delta']);
  });

  it('yields an empty map instead of propagating a thrown query', async () => {
    const { dnaClient } = makeClient(() => {
      throw new Error('store unreachable');
    });

    await expect(
      fetchContactDeviceGroupNames(dnaClient, 'token', ['c1']),
    ).resolves.toEqual(new Map());
  });
});
