import { EOperator, type IAdvanceFilters } from '@dna-platform/common-orm';

import { EStatus } from '~/server/api/types';

/**
 * WP-826 — keep `device_contacts` in sync when a device joins or leaves a
 * device group.
 *
 * There is no stored contact<->group relationship and no provenance column on
 * `device_contacts`, so "the contacts of group G" is reconstructed the same way
 * the contact record reconstructs it: a contact is tied to G when it holds a
 * `device_contacts` row for some device in G.
 *
 * Owner decision (Jira WP-826 comment 14346): AGGRESSIVE on the remove half —
 * when the group being left has no other device to prove the tie, the link is
 * deleted anyway rather than kept. The ADD half stays conservative: the device
 * being added never counts as evidence of membership, otherwise a single direct
 * device assignment would silently promote a contact into the whole group.
 */

export interface GroupMembership {
  device_id: string;
  device_group_setting_id: string;
}

export interface ContactLink {
  id: string;
  contact_id: string;
  device_id: string;
}

const QUERY_LIMIT = 1000;

// The Store has no IN operator: a list of ids becomes an OR chain of EQUAL
// criteria, which must never start or end with an operator element or the whole
// filter is rejected. Same shape as contactDeviceGroups.ts buildContactIdFilters.
const orChain = (
  entity: string,
  field: string,
  values: string[],
): IAdvanceFilters[] =>
  [...new Set(values.filter(Boolean))].flatMap((value, index) => [
    ...(index === 0 ? [] : [{ type: 'operator', operator: EOperator.OR }]),
    {
      type: 'criteria',
      field,
      operator: EOperator.EQUAL,
      values: [value],
      entity,
    },
  ]) as IAdvanceFilters[];

/** OR chain of `device_id = x` criteria against device_contacts. */
export const buildDeviceIdFilters = (deviceIds: string[]): IAdvanceFilters[] =>
  orChain('device_contacts', 'device_id', deviceIds);

const devicesOfGroup = (
  memberships: GroupMembership[],
  group: string,
  except: string | Set<string>,
): string[] => {
  const excluded = typeof except === 'string' ? new Set([except]) : except;

  return [
    ...new Set(
      memberships
        .filter(
          (m) =>
            m.device_group_setting_id === group && !excluded.has(m.device_id),
        )
        .map((m) => m.device_id),
    ),
  ];
};

const mergeMemberships = (...lists: GroupMembership[][]): GroupMembership[] => {
  const merged = new Map<string, GroupMembership>();
  lists.flat().forEach((m) =>
    merged.set(`${m.device_id}::${m.device_group_setting_id}`, m),
  );

  return [...merged.values()];
};

const contactsHolding = (links: ContactLink[], deviceIds: string[]): string[] => [
  ...new Set(
    links.filter((l) => deviceIds.includes(l.device_id)).map((l) => l.contact_id),
  ),
];

/** device ADDED to a group -> (contact_id, device_id) rows to create. */
export const planContactLinksToCreate = (input: {
  additions: GroupMembership[];
  memberships: GroupMembership[];
  links: ContactLink[];
}): Array<{ contact_id: string; device_id: string }> => {
  const { additions, memberships, links } = input;
  const planned: Array<{ contact_id: string; device_id: string }> = [];
  const seen = new Set<string>();

  // Every device arriving in THIS call is excluded from the group's evidence,
  // not just the one being processed. A batch assign of [D1, D2] to an empty
  // group would otherwise let D1 justify D2 and vice versa, granting contacts
  // devices nobody assigned them off a device that itself only just arrived.
  const addedByGroup = new Map<string, Set<string>>();
  additions.forEach((a) => {
    const set = addedByGroup.get(a.device_group_setting_id) ?? new Set<string>();
    set.add(a.device_id);
    addedByGroup.set(a.device_group_setting_id, set);
  });

  additions.forEach((addition) => {
    const evidence = devicesOfGroup(
      memberships,
      addition.device_group_setting_id,
      addedByGroup.get(addition.device_group_setting_id) ??
        new Set([addition.device_id]),
    );

    contactsHolding(links, evidence).forEach((contact_id) => {
      const key = `${contact_id}::${addition.device_id}`;
      const exists = links.some(
        (l) => l.contact_id === contact_id && l.device_id === addition.device_id,
      );
      if (exists || seen.has(key)) return;
      seen.add(key);
      planned.push({ contact_id, device_id: addition.device_id });
    });
  });

  return planned;
};

/** device REMOVED from a group -> device_contacts row ids safe to delete. */
export const planContactLinkIdsToRemove = (input: {
  removals: GroupMembership[];
  memberships: GroupMembership[];
  links: ContactLink[];
}): string[] => {
  const { removals, memberships, links } = input;
  const ids: string[] = [];
  const seen = new Set<string>();

  const isBeingRemoved = (device_id: string, group: string) =>
    removals.some(
      (r) => r.device_id === device_id && r.device_group_setting_id === group,
    );

  removals.forEach((removal) => {
    const evidence = devicesOfGroup(
      memberships,
      removal.device_group_setting_id,
      removal.device_id,
    );

    // Groups OTHER than the one being left that still hold this device.
    const survivingGroups = [
      ...new Set(
        memberships
          .filter(
            (m) =>
              m.device_id === removal.device_id &&
              m.device_group_setting_id !== removal.device_group_setting_id &&
              !isBeingRemoved(removal.device_id, m.device_group_setting_id),
          )
          .map((m) => m.device_group_setting_id),
      ),
    ];

    links
      .filter((l) => l.device_id === removal.device_id)
      .forEach((link) => {
        // AGGRESSIVE: when the group has no other device, there is no evidence
        // either way and the link is removed anyway (owner decision). When the
        // group DOES have other devices and the contact holds none of them, the
        // contact was never a member of this group — leave it alone.
        const tied =
          evidence.length === 0 ||
          contactsHolding(links, evidence).includes(link.contact_id);
        if (!tied) return;

        const stillReaches = survivingGroups.some((group) =>
          contactsHolding(
            links,
            devicesOfGroup(memberships, group, removal.device_id),
          ).includes(link.contact_id),
        );
        if (stillReaches || seen.has(link.id)) return;

        seen.add(link.id);
        ids.push(link.id);
      });
  });

  return ids;
};

/** Silent-rejection canary: the membership read must contain every removal. */
export const removalsAreCovered = (
  removals: GroupMembership[],
  memberships: GroupMembership[],
): boolean =>
  removals.every((r) =>
    memberships.some(
      (m) =>
        m.device_id === r.device_id &&
        m.device_group_setting_id === r.device_group_setting_id,
    ),
  );

const rowsToMemberships = (rows: any[]): GroupMembership[] =>
  (rows ?? [])
    .map((row: any) => ({
      device_id: row?.device_id ?? '',
      device_group_setting_id: row?.device_group_setting_id ?? '',
    }))
    .filter((m) => m.device_id && m.device_group_setting_id);

/**
 * Snapshot of every `device_groups` row reachable from the touched groups AND
 * from the touched devices. Two ADDITIVE SEPARATE queries merged in code — a
 * join the Store rejects comes back as HTTP 200 + an empty array for the whole
 * query, which on the delete path is indistinguishable from "nothing else
 * grants this device". Must be read BEFORE the caller mutates `device_groups`.
 */
export const readMembershipSnapshot = async (
  dnaClient: any,
  token: string,
  as_root: boolean | undefined,
  opts: { groupIds: string[]; deviceIds: string[] },
): Promise<GroupMembership[]> => {
  const read = async (field: string, values: string[]) => {
    const advance_filters = orChain('device_groups', field, values);
    if (!advance_filters.length) return [] as GroupMembership[];

    // Fail-safe: an empty snapshot makes the delete canary fail closed and the
    // create plan a no-op, i.e. it degrades to today's behaviour.
    const { data } = await dnaClient
      .findAll({
        entity: 'device_groups',
        token,
        as_root,
        query: {
          pluck: ['id', 'device_id', 'device_group_setting_id'],
          advance_filters,
          order: { limit: QUERY_LIMIT },
        },
      })
      .execute();

    return rowsToMemberships(data ?? []);
  };

  const [byGroup, byDevice] = await Promise.all([
    read('device_group_setting_id', opts.groupIds).catch(
      () => [] as GroupMembership[],
    ),
    read('device_id', opts.deviceIds).catch(() => [] as GroupMembership[]),
  ]);

  const merged = new Map<string, GroupMembership>();
  [...byGroup, ...byDevice].forEach((m) =>
    merged.set(`${m.device_id}::${m.device_group_setting_id}`, m),
  );

  return [...merged.values()];
};

/**
 * BLOCKER 2 fix: `readMembershipSnapshot` reads by TOUCHED group id and by
 * TOUCHED device id, so a group the device merely REMAINS in comes back
 * holding nothing but the device itself — making `stillReaches` in
 * `planContactLinkIdsToRemove` permanently false and deleting links a
 * surviving group still legitimately grants.
 *
 * This issues one more ADDITIVE SEPARATE query for those surviving groups and
 * merges it in code (never a join — a Store-rejected join is HTTP 200 + an
 * empty array, indistinguishable from "nothing else grants this device").
 *
 * `ok` is the canary: every surviving group provably contains the removal
 * device, so a read that does not come back with those pairs was rejected.
 * The caller must then skip the deletes — fail closed.
 */
export const readSurvivingGroupMemberships = async (
  dnaClient: any,
  token: string,
  as_root: boolean | undefined,
  opts: { snapshot: GroupMembership[]; removals: GroupMembership[] },
): Promise<{ memberships: GroupMembership[]; ok: boolean }> => {
  const { snapshot, removals } = opts;
  if (!removals.length) return { memberships: snapshot, ok: true };

  const removedPairs = new Set(
    removals.map((r) => `${r.device_id}::${r.device_group_setting_id}`),
  );
  const removedDevices = new Set(removals.map((r) => r.device_id));

  const survivingPairs = snapshot.filter(
    (m) =>
      removedDevices.has(m.device_id) &&
      !removedPairs.has(`${m.device_id}::${m.device_group_setting_id}`),
  );
  const survivingGroupIds = [
    ...new Set(survivingPairs.map((m) => m.device_group_setting_id)),
  ];
  if (!survivingGroupIds.length) return { memberships: snapshot, ok: true };

  const extra = await readMembershipSnapshot(dnaClient, token, as_root, {
    groupIds: survivingGroupIds,
    deviceIds: [],
  });

  const covered = survivingPairs.every((p) =>
    extra.some(
      (m) =>
        m.device_id === p.device_id &&
        m.device_group_setting_id === p.device_group_setting_id,
    ),
  );
  if (!covered) return { memberships: snapshot, ok: false };

  return { memberships: mergeMemberships(snapshot, extra), ok: true };
};

/**
 * Applies the plan. Never throws into the caller: a failed reconcile leaves the
 * `device_groups` write committed and the links stale, which is today's
 * behaviour and strictly better than failing the user's group edit. Idempotent
 * — a second run finds the creates already present and the deletes already gone.
 */
export const reconcileContactLinks = async (opts: {
  dnaClient: any;
  token: string;
  as_root?: boolean;
  meta_header?: Record<string, unknown>;
  memberships: GroupMembership[];
  additions?: GroupMembership[];
  removals?: GroupMembership[];
  /** false when the surviving-group read was rejected — deletes are skipped. */
  survivingGroupsRead?: boolean;
}): Promise<void> => {
  const {
    dnaClient,
    token,
    as_root,
    meta_header = {},
    memberships,
    additions = [],
    removals = [],
    survivingGroupsRead = true,
  } = opts;

  if (!additions.length && !removals.length) return;

  try {
    // The canary gates every delete. The removed rows were read from the Store
    // moments ago, so a snapshot missing them is a silent rejection, not proof.
    const safeToRemove =
      removals.length > 0 &&
      survivingGroupsRead &&
      removalsAreCovered(removals, memberships);

    const deviceIds = [
      ...new Set([
        ...memberships.map((m) => m.device_id),
        ...additions.map((a) => a.device_id),
        ...removals.map((r) => r.device_id),
      ]),
    ];

    const advance_filters = buildDeviceIdFilters(deviceIds);
    if (!advance_filters.length) return;

    const { data } = await dnaClient
      .findAll({
        entity: 'device_contacts',
        token,
        as_root,
        query: {
          pluck: ['id', 'contact_id', 'device_id'],
          advance_filters,
          order: { limit: QUERY_LIMIT },
        },
      })
      .execute();

    const links: ContactLink[] = ((data ?? []) as any[])
      .map((row: any) => ({
        id: row?.id ?? '',
        contact_id: row?.contact_id ?? '',
        device_id: row?.device_id ?? '',
      }))
      .filter((l) => l.id && l.contact_id && l.device_id);

    const toCreate = additions.length
      ? planContactLinksToCreate({ additions, memberships, links })
      : [];
    const toRemove = safeToRemove
      ? planContactLinkIdsToRemove({ removals, memberships, links })
      : [];

    await Promise.all([
      ...toCreate.map((params) =>
        dnaClient
          .create({
            entity: 'device_contacts',
            token,
            as_root,
            ...meta_header,
            mutation: {
              pluck: ['id'],
              params: { ...params, status: EStatus.ACTIVE },
            },
          })
          .execute(),
      ),
      ...toRemove.map((id) =>
        dnaClient
          .delete(id, { entity: 'device_contacts', token, as_root })
          .execute(),
      ),
    ]);
  } catch (error) {
    // Still swallowed by design — see the doc comment above — but a partial
    // batch must not vanish without a trace an operator can find.
    console.error('[WP-826] device_contacts reconcile failed', error);
  }
};

/** Reads `device_groups` junction rows by id, BEFORE the caller deletes them. */
export const readMembershipsByRowId = async (
  dnaClient: any,
  token: string,
  as_root: boolean | undefined,
  rowIds: string[],
): Promise<GroupMembership[]> => {
  const advance_filters = orChain('device_groups', 'id', rowIds);
  if (!advance_filters.length) return [];

  try {
    const { data } = await dnaClient
      .findAll({
        entity: 'device_groups',
        token,
        as_root,
        query: {
          pluck: ['id', 'device_id', 'device_group_setting_id'],
          advance_filters,
          order: { limit: QUERY_LIMIT },
        },
      })
      .execute();

    return rowsToMemberships(data ?? []);
  } catch {
    // No pairs read -> nothing to reconcile; the unassign itself still runs.
    return [];
  }
};
