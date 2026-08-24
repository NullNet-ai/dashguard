import { describe, expect, it, vi } from 'vitest';
import { EOrderDirection } from '@dna-platform/common-orm';

import {
  findLatestVersionRow,
  saveLatestVersion,
} from '~/server/utils/latestVersion';

// Minimal stand-in for dnaClient: records the options it was called with and
// replays the canned findAll response.
const makeClient = (rows: Record<string, unknown>[]) => {
  const findAll = vi.fn(() => ({
    execute: () => Promise.resolve({ data: rows }),
  }));
  const update = vi.fn(() => ({
    execute: () => Promise.resolve({ status_code: 200 }),
  }));

  return { findAll, update };
};

describe('WP-842 latest version helpers', () => {
  it('reads the newest versions row the same way device.fetchLatestVersion does', async () => {
    const client = makeClient([{ id: 'v1', latest_version: '1.3.12' }]);

    const row = await findLatestVersionRow(client, 'token-123');

    expect(row).toEqual({ id: 'v1', latest_version: '1.3.12' });
    expect(client.findAll).toHaveBeenCalledWith({
      entity: 'versions',
      token: 'token-123',
      query: {
        pluck: ['id', 'latest_version'],
        order: {
          limit: 1,
          by_field: 'created_date',
          by_direction: EOrderDirection.DESC,
        },
      },
    });
  });

  it('returns null when the versions table is empty', async () => {
    const client = makeClient([]);

    await expect(findLatestVersionRow(client, 'token-123')).resolves.toBeNull();
  });

  it('updates by the id of the row it just read, never blind-updates', async () => {
    const client = makeClient([{ id: 'v1', latest_version: '1.3.11' }]);

    const res = await saveLatestVersion(client, 'token-123', '1.3.12', {
      meta: { entity: 'versions' },
    });

    expect(res).toEqual({ status_code: 200 });
    expect(client.update).toHaveBeenCalledWith('v1', {
      entity: 'versions',
      token: 'token-123',
      meta: { entity: 'versions' },
      mutation: {
        params: { latest_version: '1.3.12' },
        pluck: ['id', 'latest_version'],
      },
    });
  });

  it('throws NOT_FOUND instead of creating a second row when none exists', async () => {
    const client = makeClient([]);

    await expect(
      saveLatestVersion(client, 'token-123', '1.3.12'),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(client.update).not.toHaveBeenCalled();
  });
});
