import { describe, it, expect } from 'vitest';
import { flattenDeviceGroupNames } from '~/server/utils/deviceGroupNames';

describe('flattenDeviceGroupNames', () => {
  it('returns an empty array for a device in zero groups', () => {
    expect(flattenDeviceGroupNames({ id: 'd1', device_groups: [] })).toEqual([]);
    expect(flattenDeviceGroupNames({ id: 'd1' })).toEqual([]);
    expect(flattenDeviceGroupNames(undefined)).toEqual([]);
  });

  it('returns the single group name when nested under device_groups', () => {
    expect(
      flattenDeviceGroupNames({
        id: 'd1',
        device_groups: [
          {
            id: 'dg1',
            device_group_setting_id: 's1',
            device_group_settings: [{ id: 's1', name: 'Retail' }],
          },
        ],
      }),
    ).toEqual(['Retail']);
  });

  it('reads settings merged at the row root', () => {
    expect(
      flattenDeviceGroupNames({
        id: 'd1',
        device_group_settings: { id: 's1', name: 'Retail' },
      }),
    ).toEqual(['Retail']);
  });

  it('returns every group name, sorted and de-duplicated', () => {
    expect(
      flattenDeviceGroupNames({
        id: 'd1',
        device_group_settings: [{ id: 's2', name: 'Warehouse' }],
        device_groups: [
          {
            id: 'dg1',
            device_group_settings: { id: 's1', name: 'Retail' },
          },
          {
            id: 'dg2',
            device_group_settings: [{ id: 's2', name: 'Warehouse' }],
          },
          {
            id: 'dg3',
            device_group_settings: [{ id: 's3', name: 'Branch' }],
          },
        ],
      }),
    ).toEqual(['Branch', 'Retail', 'Warehouse']);
  });

  it('ignores group rows with no resolved setting', () => {
    expect(
      flattenDeviceGroupNames({
        id: 'd1',
        device_groups: [
          { id: 'dg1', device_group_settings: null },
          { id: 'dg2', device_group_settings: [{ id: 's1', name: 'Retail' }] },
          { id: 'dg3', device_group_settings: [{ id: 's2' }] },
        ],
      }),
    ).toEqual(['Retail']);
  });
});
