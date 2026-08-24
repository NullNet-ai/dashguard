import { randomBytes } from 'node:crypto';

import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter';

/**
 * WP-841 — reissue a device's join (installation) code.
 *
 * This lives outside the router purely so the ordering below can be asserted in
 * a unit test. The ordering is the whole point of the function:
 *
 *   1. archive every installation_codes row currently issued to the device;
 *   2. only then mint the replacement.
 *
 * Doing it the other way round, or skipping step 1, is what makes a
 * "regenerate" a duplicate instead: `createInstallationCode` only ever inserts,
 * and `fetchInstallationCodeByDeviceId` returns `data[0]`, so several Active
 * rows would leave the record displaying an arbitrary one of them. Archiving
 * first also fails closed — if minting the replacement throws, the device is
 * left with no valid code rather than with one the operator believes they
 * revoked.
 *
 * Scope note: marking the old row Archived is the strongest revocation
 * dashguard can perform. Whether an archived code is actually *rejected* at
 * enrolment is enforced by wallguard-server, in a separate repository.
 */

/** The ORM surface this needs; the real client satisfies it structurally. */
interface OrmLike {
  findAll: (args: unknown) => { execute: () => Promise<any> };
  update: (id: string, args: unknown) => { execute: () => Promise<any> };
  create: (args: unknown) => { execute: () => Promise<any> };
}

interface RegenerateArgs {
  orm: OrmLike;
  token: string;
  device_id: string;
  device_code: string;
}

/** 16 hex characters — same shape as the existing codes, but from a CSPRNG. */
export const mintInstallationToken = () => randomBytes(8).toString('hex');

export const regenerateInstallationCodeForDevice = async ({
  orm,
  token,
  device_id,
  device_code,
}: RegenerateArgs) => {
  const existing = await orm
    .findAll({
      entity: 'installation_codes',
      token,
      query: {
        pluck: ['id'],
        advance_filters: createAdvancedFilter({ device_id }),
      },
    })
    .execute();

  for (const row of (existing?.data ?? []) as Array<{ id?: string }>) {
    if (!row?.id) continue;
    await orm
      .update(row.id, {
        entity: 'installation_codes',
        token,
        mutation: {
          params: {
            tombstone: 1,
            status: 'Archived',
          },
        },
      })
      .execute();
  }

  const response = await orm
    .create({
      entity: 'installation_codes',
      token,
      mutation: {
        params: {
          status: 'Active',
          device_id,
          device_code,
          token: mintInstallationToken(),
        },
        pluck: ['id', 'token'],
      },
    })
    .execute();

  if (!response?.success) {
    throw new Error(
      `Failed to regenerate installation key: ${response?.errors
        ?.map((errMap: { message: string }) => errMap.message)
        .join(' ')}`,
    );
  }

  return response.data?.[0];
};
