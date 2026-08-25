import { describe, expect, it } from 'vitest';

import { partitionDevicesForGroup } from '~/app/portal/device/grid/_utils/assign-device-group';

describe('partitionDevicesForGroup', () => {
  it('returns every selected device id when none are in the group', () => {
    const result = partitionDevicesForGroup(
      [
        { id: 'a', device_group_names: [] },
        { id: 'b', device_group_names: ['Other'] },
      ],
      'Target',
    );

    expect(result).toEqual({ device_ids: ['a', 'b'], skipped: 0 });
  });

  it('skips devices already in the chosen group', () => {
    const result = partitionDevicesForGroup(
      [
        { id: 'a', device_group_names: ['Target'] },
        { id: 'b', device_group_names: ['Other', 'Target'] },
        { id: 'c', device_group_names: ['Other'] },
      ],
      'Target',
    );

    expect(result).toEqual({ device_ids: ['c'], skipped: 2 });
  });

  it('dedupes repeated ids and ignores rows without an id', () => {
    const result = partitionDevicesForGroup(
      [{ id: 'a' }, { id: 'a' }, { id: '' }, null, undefined, {}],
      'Target',
    );

    expect(result).toEqual({ device_ids: ['a'], skipped: 0 });
  });

  it('treats a missing device_group_names as not assigned', () => {
    const result = partitionDevicesForGroup(
      [{ id: 'a', device_group_names: null }],
      'Target',
    );

    expect(result).toEqual({ device_ids: ['a'], skipped: 0 });
  });

  it('matches group names exactly', () => {
    const result = partitionDevicesForGroup(
      [{ id: 'a', device_group_names: ['target'] }],
      'Target',
    );

    expect(result).toEqual({ device_ids: ['a'], skipped: 0 });
  });
});
