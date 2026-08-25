import { EOperator, type IAdvanceFilters } from '@dna-platform/common-orm';

import { flattenDeviceGroupNames } from '~/server/utils/deviceGroupNames';

// WP-824: contacts have no direct link to device groups — the hops are
// contact -> device_contacts -> device_groups -> device_group_settings.
// The Store has no IN operator, so the page's contact ids become an OR chain
// of EQUAL criteria. The chain must never start or end with an operator
// element, otherwise the whole filter is rejected.
export const buildContactIdFilters = (
  contactIds: string[],
): IAdvanceFilters[] =>
  contactIds.flatMap((contact_id, index) => [
    ...(index === 0
      ? []
      : [{ type: 'operator', operator: EOperator.OR }]),
    {
      type: 'criteria',
      field: 'contact_id',
      operator: EOperator.EQUAL,
      values: [contact_id],
      entity: 'device_contacts',
    },
  ]) as IAdvanceFilters[];

// One extra query for the whole grid page (never one per row) mapping
// contact id -> device group names. Deliberately fail-safe: any error or empty
// result yields an empty map so the column just renders blank and the contact
// list itself is never affected.
export const fetchContactDeviceGroupNames = async (
  dnaClient: any,
  token: string,
  contactIds: (string | undefined | null)[],
): Promise<Map<string, string[]>> => {
  const names_by_contact = new Map<string, string[]>();
  const ids = [...new Set(contactIds.filter(Boolean) as string[])];

  if (!ids.length) return names_by_contact;

  try {
    const query = dnaClient.findAll({
      entity: 'device_contacts',
      token,
      query: {
        pluck: ['id', 'contact_id', 'device_id'],
        pluck_object: {
          device_groups: ['id', 'device_id', 'device_group_setting_id'],
          device_group_settings: ['id', 'name'],
        },
        advance_filters: buildContactIdFilters(ids),
        order: { limit: 1000 },
      },
    });

    query
      .join({
        type: 'left',
        field_relation: {
          from: { entity: 'device_contacts', field: 'device_id' },
          to: { entity: 'device_groups', field: 'device_id' },
        },
      })
      .nestedJoin({
        type: 'left',
        field_relation: {
          from: {
            entity: 'device_groups',
            field: 'device_group_setting_id',
          },
          to: { entity: 'device_group_settings', field: 'id' },
        },
      });

    const { data: rows } = await query.execute();

    (rows ?? []).forEach((row: any) => {
      const contact_id = row?.contact_id ?? row?.device_contacts?.contact_id;
      if (!contact_id) return;

      const names = flattenDeviceGroupNames(row);
      if (!names.length) return;

      names_by_contact.set(
        contact_id,
        [...new Set([...(names_by_contact.get(contact_id) ?? []), ...names])].sort(),
      );
    });

    return names_by_contact;
  } catch {
    return new Map();
  }
};
