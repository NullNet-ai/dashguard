import { describe, expect, it } from 'vitest';

import {
  mintInstallationToken,
  regenerateInstallationCodeForDevice,
} from '~/server/utils/installationCode';

// WP-841 — "Device Record > Device - Can regenerate code" (the join code).
//
// The behaviour worth pinning down is ORDERING, not plumbing. createInstallationCode
// only ever inserts and fetchInstallationCodeByDeviceId returns data[0], so a
// regenerate that forgets to retire the old rows silently leaves a device with
// several valid join codes and shows an arbitrary one. These tests fail if that
// ordering is ever lost.

interface Call {
  op: 'findAll' | 'update' | 'create';
  id?: string;
  params?: Record<string, any>;
}

/** Minimal ORM double that records the sequence of operations. */
const makeOrm = (
  existingIds: Array<string | undefined>,
  createResult: any = { success: true, data: [{ id: 'new', token: 'abc' }] },
) => {
  const calls: Call[] = [];
  const orm = {
    findAll: () => {
      calls.push({ op: 'findAll' });
      return {
        execute: async () => ({ data: existingIds.map((id) => ({ id })) }),
      };
    },
    update: (id: string, args: any) => {
      calls.push({ op: 'update', id, params: args?.mutation?.params });
      return { execute: async () => ({ success: true }) };
    },
    create: (args: any) => {
      calls.push({ op: 'create', params: args?.mutation?.params });
      return { execute: async () => createResult };
    },
  };
  return { orm, calls };
};

const run = (orm: any) =>
  regenerateInstallationCodeForDevice({
    orm,
    token: 'session-token',
    device_id: 'dev-1',
    device_code: 'DEV0001',
  });

describe('regenerateInstallationCodeForDevice', () => {
  it('archives every existing code before creating the replacement', async () => {
    const { orm, calls } = makeOrm(['code-1', 'code-2']);
    await run(orm);

    expect(calls.map((c) => c.op)).toEqual([
      'findAll',
      'update',
      'update',
      'create',
    ]);
    // Every prior code retired, not just the first one the grid happened to show.
    expect(calls.filter((c) => c.op === 'update').map((c) => c.id)).toEqual([
      'code-1',
      'code-2',
    ]);
  });

  it('archives with tombstone and Archived status', async () => {
    const { orm, calls } = makeOrm(['code-1']);
    await run(orm);

    const update = calls.find((c) => c.op === 'update');
    expect(update?.params).toMatchObject({ tombstone: 1, status: 'Archived' });
  });

  it('creates exactly one Active replacement bound to the device', async () => {
    const { orm, calls } = makeOrm(['code-1']);
    await run(orm);

    const creates = calls.filter((c) => c.op === 'create');
    expect(creates).toHaveLength(1);
    expect(creates[0]?.params).toMatchObject({
      status: 'Active',
      device_id: 'dev-1',
      device_code: 'DEV0001',
    });
  });

  it('still issues a code when the device has none yet', async () => {
    const { orm, calls } = makeOrm([]);
    await run(orm);

    expect(calls.map((c) => c.op)).toEqual(['findAll', 'create']);
  });

  it('skips rows with no id rather than calling update(undefined)', async () => {
    const { orm, calls } = makeOrm([undefined, 'code-2']);
    await run(orm);

    expect(calls.filter((c) => c.op === 'update').map((c) => c.id)).toEqual([
      'code-2',
    ]);
  });

  it('throws when the replacement could not be created', async () => {
    // Fails closed: the old codes are already archived, so the device is left
    // with no working code rather than a supposedly-revoked one.
    const { orm } = makeOrm(['code-1'], {
      success: false,
      errors: [{ message: 'boom' }],
    });
    await expect(run(orm)).rejects.toThrow(/Failed to regenerate/);
  });

  it('mints a 16-character hex token', async () => {
    const { orm, calls } = makeOrm([]);
    await run(orm);
    expect(calls.find((c) => c.op === 'create')?.params?.token).toMatch(
      /^[0-9a-f]{16}$/,
    );
  });

  it('does not repeat tokens across calls', async () => {
    const tokens = new Set(
      Array.from({ length: 50 }, () => mintInstallationToken()),
    );
    expect(tokens.size).toBe(50);
  });
});
