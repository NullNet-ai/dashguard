import { EOrderDirection } from '@dna-platform/common-orm';
import { TRPCError } from '@trpc/server';

const entity = 'versions';

// The platform keeps a single `versions` row. The read (device.fetchLatestVersion)
// and the write (device.updateLatestVersion) must resolve it the same way, so the
// ordering lives here and is shared by both.
const latestVersionOrder = {
  limit: 1,
  by_field: 'created_date',
  by_direction: EOrderDirection.DESC,
};

export const findLatestVersionRow = async (dnaClient: any, token: string) => {
  const response = await dnaClient
    .findAll({
      entity,
      token,
      query: {
        pluck: ['id', 'latest_version'],
        order: latestVersionOrder,
      },
    })
    .execute();

  return response?.data?.[0] ?? null;
};

export const saveLatestVersion = async (
  dnaClient: any,
  token: string,
  latest_version: string,
  meta_header?: Record<string, any>,
) => {
  const row = await findLatestVersionRow(dnaClient, token);

  if (!row?.id) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'No version record found to update.',
    });
  }

  return dnaClient
    .update(row.id, {
      entity,
      token,
      ...meta_header,
      mutation: {
        params: { latest_version },
        pluck: ['id', 'latest_version'],
      },
    })
    .execute();
};
