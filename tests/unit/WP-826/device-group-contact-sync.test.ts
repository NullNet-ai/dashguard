import { describe, expect, it } from 'vitest';

import {
  buildDeviceIdFilters,
  planContactLinkIdsToRemove,
  planContactLinksToCreate,
  removalsAreCovered,
  type ContactLink,
  type GroupMembership,
} from '~/server/utils/deviceGroupContactSync';

// WP-826 — "Device Record > Device Group > Sync assign / unassign in Contact Device".
//
// Assigning a contact to a "device group" is NOT a stored relationship: it is a
// one-time fan-out that writes one device_contacts row per device that was in
// the group AT THAT MOMENT (contact_device.ts:303 setDeviceGroups,
// contact_device.ts:496 assignGroups). The contact record then reconstructs
// apparent group membership with a two-hop join
// device_contacts.device_id -> device_groups.device_id -> device_group_settings
// (contact_device.ts:255-268). So the snapshot goes stale: change a group's
// device list later and every contact "assigned" that group is wrong.
//
// The fix reconciles device_contacts whenever device<->group membership
// changes. These specs pin the PURE set logic, which is deliberately extracted
// from the ORM (same pattern as src/server/utils/deviceOnlineStatus.ts and
// src/server/utils/contactDeviceGroups.ts).
//
// THE UNASSIGN RULE (the whole reason this is a separate module):
// device_contacts has NO provenance column, so a row never says whether the
// contact got that device through a group or by direct assignment. Owner
// decision on WP-826 (comment 14346) is AGGRESSIVE: a link is removed when
//   (i)  the contact is tied to the removed group through some OTHER device,
//        OR the group held no other device at all (no evidence either way -
//        delete anyway, downside explicitly accepted by the owner), and
//   (ii) the contact has no remaining path to the device through any other
//        group it is likewise tied to.
// A contact that holds none of the group's OTHER devices was never a member of
// that group, so its link is left alone.

const m = (
  device_id: string,
  device_group_setting_id: string,
): GroupMembership => ({ device_id, device_group_setting_id });

const l = (id: string, contact_id: string, device_id: string): ContactLink => ({
  id,
  contact_id,
  device_id,
});

describe('planContactLinksToCreate — device ADDED to a group', () => {
  it('links the new device to every contact tied to that group', () => {
    // Group G already holds device E. Contacts c1 and c2 are tied to G because
    // they hold a device_contacts row for E. Device D is now added to G.
    const result = planContactLinksToCreate({
      additions: [m('D', 'G')],
      memberships: [m('E', 'G'), m('D', 'G')],
      links: [l('l1', 'c1', 'E'), l('l2', 'c2', 'E')],
    });

    expect(result).toEqual([
      { contact_id: 'c1', device_id: 'D' },
      { contact_id: 'c2', device_id: 'D' },
    ]);
  });

  it('never creates a duplicate when the link already exists', () => {
    const result = planContactLinksToCreate({
      additions: [m('D', 'G')],
      memberships: [m('E', 'G'), m('D', 'G')],
      links: [l('l1', 'c1', 'E'), l('l2', 'c1', 'D')],
    });

    expect(result).toEqual([]);
  });

  it('does not bootstrap a contact into a group off the added device alone', () => {
    // c1's ONLY tie to G would be device D itself - the device being added.
    // Treating that as "c1 is a member of G" would let a direct device
    // assignment silently promote the contact into the whole group.
    const result = planContactLinksToCreate({
      additions: [m('D', 'G')],
      memberships: [m('D', 'G')],
      links: [l('l1', 'c1', 'D')],
    });

    expect(result).toEqual([]);
  });

  it('dedupes when the same device is added to two groups sharing a contact', () => {
    const result = planContactLinksToCreate({
      additions: [m('D', 'G1'), m('D', 'G2')],
      memberships: [m('E', 'G1'), m('F', 'G2'), m('D', 'G1'), m('D', 'G2')],
      links: [l('l1', 'c1', 'E'), l('l2', 'c1', 'F')],
    });

    expect(result).toEqual([{ contact_id: 'c1', device_id: 'D' }]);
  });

  it('returns nothing for empty input', () => {
    expect(
      planContactLinksToCreate({ additions: [], memberships: [], links: [] }),
    ).toEqual([]);
  });
});

describe('planContactLinkIdsToRemove — device REMOVED from a group', () => {
  it('KEEPS the link when the contact still reaches the device via another group', () => {
    // ! The load-bearing case. Device D is in BOTH G1 and G2. Contact c1 is
    // tied to G1 through device E and to G2 through device F. D is removed
    // from G1 only - c1 must KEEP its link to D, because G2 still grants it.
    const result = planContactLinkIdsToRemove({
      removals: [m('D', 'G1')],
      memberships: [
        m('D', 'G1'),
        m('E', 'G1'),
        m('D', 'G2'),
        m('F', 'G2'),
      ],
      links: [l('l1', 'c1', 'D'), l('l2', 'c1', 'E'), l('l3', 'c1', 'F')],
    });

    expect(result).toEqual([]);
  });

  it('removes the link when the removed group was the only path', () => {
    // c1 is tied to G1 through E, and D is in no other group. The (c1, D) row
    // is provably a leftover of G1's fan-out.
    const result = planContactLinkIdsToRemove({
      removals: [m('D', 'G1')],
      memberships: [m('D', 'G1'), m('E', 'G1')],
      links: [l('l1', 'c1', 'D'), l('l2', 'c1', 'E')],
    });

    expect(result).toEqual(['l1']);
  });

  it('REMOVES a link when the group holds no other device to prove provenance', () => {
    // c1 holds device D and has no other tie to G1 because G1 held nothing but
    // D. With no provenance column this is indistinguishable from a group
    // fan-out of a one-device group. Owner decision (WP-826 comment 14346):
    // AGGRESSIVE - "the same applies in reverse when a device is removed from
    // the group", downside explicitly accepted.
    const result = planContactLinkIdsToRemove({
      removals: [m('D', 'G1')],
      memberships: [m('D', 'G1')],
      links: [l('l1', 'c1', 'D')],
    });

    expect(result).toEqual(['l1']);
  });

  it('KEEPS other contacts and removes only the ones that lost their path', () => {
    // c1 is tied to G1 via E (group-derived, loses D). c2 holds D directly.
    const result = planContactLinkIdsToRemove({
      removals: [m('D', 'G1')],
      memberships: [m('D', 'G1'), m('E', 'G1')],
      links: [l('l1', 'c1', 'D'), l('l2', 'c1', 'E'), l('l3', 'c2', 'D')],
    });

    expect(result).toEqual(['l1']);
  });

  it('handles a device removed from two groups at once', () => {
    // D leaves G1 and G2 in the same operation; c1 was tied to both. No path
    // survives, so the link goes.
    const result = planContactLinkIdsToRemove({
      removals: [m('D', 'G1'), m('D', 'G2')],
      memberships: [m('D', 'G1'), m('E', 'G1'), m('D', 'G2'), m('F', 'G2')],
      links: [l('l1', 'c1', 'D'), l('l2', 'c1', 'E'), l('l3', 'c1', 'F')],
    });

    expect(result).toEqual(['l1']);
  });

  it('never returns the same link id twice', () => {
    const result = planContactLinkIdsToRemove({
      removals: [m('D', 'G1'), m('D', 'G2')],
      memberships: [m('D', 'G1'), m('E', 'G1'), m('D', 'G2'), m('E', 'G2')],
      links: [l('l1', 'c1', 'D'), l('l2', 'c1', 'E')],
    });

    expect(result).toEqual(['l1']);
  });

  it('returns nothing for empty input', () => {
    expect(
      planContactLinkIdsToRemove({ removals: [], memberships: [], links: [] }),
    ).toEqual([]);
  });
});

describe('removalsAreCovered — silent-rejection canary', () => {
  // A Store-rejected entity returns HTTP 200 with an EMPTY ARRAY for the whole
  // query (measured on WP-838/WP-843). On the unassign path that is the
  // dangerous direction: "I found no other groups for this device" and "the
  // Store refused to answer" look identical, and the first one deletes.
  //
  // The rows being removed were themselves just read, so a membership read
  // that does NOT contain them is provably a silent rejection - and the caller
  // must skip the reconcile rather than delete on no evidence.
  it('holds when every removal is present in the membership read', () => {
    expect(
      removalsAreCovered([m('D', 'G1')], [m('D', 'G1'), m('E', 'G1')]),
    ).toBe(true);
  });

  it('fails on an empty membership read (Store silently rejected it)', () => {
    expect(removalsAreCovered([m('D', 'G1')], [])).toBe(false);
  });

  it('fails when only some removals came back', () => {
    expect(
      removalsAreCovered([m('D', 'G1'), m('D', 'G2')], [m('D', 'G1')]),
    ).toBe(false);
  });

  it('is vacuously true when there is nothing to remove', () => {
    expect(removalsAreCovered([], [])).toBe(true);
  });
});

describe('buildDeviceIdFilters — OR chain for device_contacts', () => {
  // There is no IN operator in this codebase; the established shape is an OR
  // chain of EQUAL criteria (src/server/utils/deviceOnlineStatus.ts
  // buildDeviceIdFilter, src/server/utils/contactDeviceGroups.ts
  // buildContactIdFilters). The chain must never start or end with an operator
  // element or the whole filter is rejected.
  it('emits a single criterion with no operator for one id', () => {
    const filters = buildDeviceIdFilters(['a']);

    expect(filters).toHaveLength(1);
    expect(filters[0]).toMatchObject({
      type: 'criteria',
      field: 'device_id',
      values: ['a'],
      entity: 'device_contacts',
    });
  });

  it('interleaves OR operators and never starts or ends with one', () => {
    const filters = buildDeviceIdFilters(['a', 'b', 'c']);

    expect(filters).toHaveLength(5);
    expect(filters.map((f: any) => f.type)).toEqual([
      'criteria',
      'operator',
      'criteria',
      'operator',
      'criteria',
    ]);
  });

  it('dedupes ids and drops empty ones', () => {
    expect(buildDeviceIdFilters(['a', 'a', '', 'b'])).toHaveLength(3);
  });

  it('returns an empty chain for no ids', () => {
    expect(buildDeviceIdFilters([])).toEqual([]);
  });
});
