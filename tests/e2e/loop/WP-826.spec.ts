import { expect, test, type Page } from '@playwright/test';

import { LoginPage } from '../auth/LoginPage';

// WP-826 — "Device Record > Device Group > Device Group - Sync assign / unassign
// in Contact Device". Owner: "Keep device_contacts synchronized on this
// triggers (assign / unassign)".
//
// WHY THIS IS DRIVEN THROUGH tRPC AND NOT THE UI
// The defect is a data invariant, not a rendering bug: device<->group membership
// changes must reconcile the device_contacts junction. Driving it through the UI
// would assert on the contact record's Device Groups tab, which reconstructs
// membership through a two-hop join (contact_device.ts:255-268) and so hides
// exactly the staleness under test. The same in-page fetch helpers are used by
// tests/e2e/loop/WP-838.spec.ts.
//
// TOUCHES REAL DATA. Everything this spec creates - one device group, its
// junction rows, and the device_contacts rows produced by assigning that group
// to a contact - is removed in afterAll. It never deletes a device_contacts row
// that existed before the run for a device outside this run's group; those are
// snapshotted and asserted intact, which bounds the blast radius of the
// aggressive-unassign rule the owner chose (WP-826 comment 14346).

const email = process.env.QA_E2E_EMAIL;
const password = process.env.QA_E2E_PASSWORD;
const runId = process.env.QA_RUN_ID ?? `${process.pid}`;
const GROUP_NAME = `WP826 Sync ${runId}`;

async function trpcQuery(page: Page, path: string, input: unknown) {
  const encoded = encodeURIComponent(JSON.stringify({ '0': { json: input } }));
  return page.evaluate(
    async ({ path, encoded }) => {
      const res = await fetch(`/api/trpc/${path}?batch=1&input=${encoded}`);
      return res.json();
    },
    { path, encoded },
  );
}

async function trpcMutate(page: Page, path: string, input: unknown) {
  return page.evaluate(
    async ({ path, input }) => {
      const res = await fetch(`/api/trpc/${path}?batch=1`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ '0': { json: input } }),
      });
      return res.json();
    },
    { path, input },
  );
}

const unwrap = (res: any) => res?.[0]?.result?.data?.json;

async function listRows(page: Page, entity: string, pluck: string[], limit = 5) {
  const data = unwrap(
    await trpcQuery(page, 'grid.items', {
      current: 1,
      limit,
      pluck,
      sorting: [],
      advance_filters: [],
      group_advance_filters: [],
      grouping: [],
      entity,
    }),
  );
  return (data?.items ?? []) as Array<Record<string, any>>;
}

/** device_contacts rows for one contact: device_id -> junction row id. */
async function contactDeviceMap(page: Page, contact_id: string) {
  const data = unwrap(
    await trpcQuery(page, 'contactDevice.mainGrid', {
      current: 1,
      limit: 200,
      pluck: ['id', 'contact_id', 'device_id'],
      sorting: [],
      advance_filters: [
        {
          type: 'criteria',
          field: 'contact_id',
          operator: 'equal',
          values: [contact_id],
          entity: 'device_contacts',
        },
      ],
      group_advance_filters: [],
      grouping: [],
      entity: 'device_contacts',
    }),
  );
  const map = new Map<string, string>();
  ((data?.items ?? []) as any[]).forEach((row) => {
    if (row?.device_id) map.set(row.device_id, row.id);
  });
  return map;
}

/** device_groups junction rows for a group: device_id -> junction row id. */
async function groupMemberMap(page: Page, device_group_setting_id: string) {
  const data = unwrap(
    await trpcQuery(page, 'deviceGroup.members', {
      current: 1,
      limit: 200,
      pluck: ['id', 'device_id'],
      sorting: [],
      advance_filters: [],
      group_advance_filters: [],
      grouping: [],
      entity: 'device_groups',
      device_group_setting_id,
    }),
  );
  const map = new Map<string, string>();
  ((data?.items ?? []) as any[]).forEach((row) => {
    if (row?.device_id) map.set(row.device_id, row.id);
  });
  return map;
}

// Read-after-write lag against the Store is a real 1-5s (see
// tests/e2e/loop/cleanup-rehearsal.spec.ts), so every read that follows a write
// polls instead of asserting once.
async function waitFor<T>(
  read: () => Promise<T>,
  done: (value: T) => boolean,
  attempts = 8,
  delayMs = 1000,
  page?: Page,
): Promise<T> {
  let value = await read();
  for (let i = 0; i < attempts && !done(value); i++) {
    await page?.waitForTimeout(delayMs);
    value = await read();
  }
  return value;
}

test.describe('WP-826 — device group assign/unassign keeps device_contacts in sync', () => {
  // Login plus Turbopack cold compile plus the fixture build-up.
  test.describe.configure({ mode: 'serial', timeout: 300_000 });

  let page: Page;
  let groupId: string | undefined;
  let contactId: string;
  let seedDeviceId: string;
  let addedDeviceId: string;
  /** device_contacts rows that existed BEFORE this run - never touched. */
  let preExisting: Map<string, string>;

  test.beforeAll(async ({ browser }) => {
    // Deliberately NOT test.skip: a silently skipped suite reads as a pass.
    expect(
      email,
      'QA_E2E_EMAIL must be set (set -a; . ./.env.local; set +a)',
    ).toBeTruthy();
    expect(
      password,
      'QA_E2E_PASSWORD must be set (set -a; . ./.env.local; set +a)',
    ).toBeTruthy();

    page = await browser.newPage();
    const login = new LoginPage(page);
    await login.goto();
    await login.login(email!, password!);
    await page.waitForURL(/\/portal\//, { timeout: 120_000 });

    const devices = await listRows(page, 'devices', ['id', 'device_name'], 5);
    expect(
      devices.length,
      'need at least 2 devices in the environment',
    ).toBeGreaterThanOrEqual(2);
    seedDeviceId = devices[0]!.id;
    addedDeviceId = devices[1]!.id;

    // ! entity must be 'contact' (singular). src/auto-generated/entities.ts
    // registers "contact" but NOT "contacts", and an unregistered entity is
    // rejected by the Store as HTTP 200 + empty array for the WHOLE query -
    // measured here: entity 'contacts' returns zero rows, not an error.
    const contacts = unwrap(
      await trpcQuery(page, 'contact.mainGrid', {
        current: 1,
        limit: 1,
        pluck: ['id', 'code'],
        sorting: [],
        advance_filters: [],
        group_advance_filters: [],
        grouping: [],
        entity: 'contact',
      }),
    )?.items ?? [];
    expect(contacts.length, 'need at least 1 contact').toBeGreaterThanOrEqual(1);
    contactId = contacts[0]!.id;

    preExisting = await contactDeviceMap(page, contactId);

    // Fixture: a fresh group holding only the seed device.
    const created = unwrap(
      await trpcMutate(page, 'deviceGroup.saveDeviceGroup', {
        name: GROUP_NAME,
      }),
    );
    groupId = created?.data?.[0]?.id ?? created?.data?.id;
    expect(groupId, 'device group fixture was not created').toBeTruthy();

    await trpcMutate(page, 'deviceGroup.assignDevices', {
      device_group_setting_id: groupId,
      device_ids: [seedDeviceId],
    });

    // Assign the group to the contact. Today this fans the group out into one
    // device_contacts row per CURRENT member - i.e. the seed device only.
    await trpcMutate(page, 'contactDevice.assignGroups', {
      contact_id: contactId,
      group_ids: [groupId],
    });

    const afterSeed = await waitFor(
      () => contactDeviceMap(page, contactId),
      (map) => map.has(seedDeviceId),
      8,
      1000,
      page,
    );
    expect(
      afterSeed.has(seedDeviceId),
      'fixture failed: assigning the group did not link the seed device',
    ).toBe(true);
  });

  test.afterAll(async () => {
    if (!page) return;
    try {
      // 1. device_contacts rows this run created (never the pre-existing ones).
      const links = await contactDeviceMap(page, contactId);
      const created: string[] = [];
      links.forEach((rowId, deviceId) => {
        if (!preExisting.has(deviceId)) created.push(rowId);
      });
      if (created.length) {
        await trpcMutate(page, 'contactDevice.unassign', {
          device_contact_ids: created,
        });
      }

      // 2. the group's junction rows, then the group itself.
      if (groupId) {
        const members = await groupMemberMap(page, groupId);
        const memberIds = Array.from(members.values());
        if (memberIds.length) {
          await trpcMutate(page, 'deviceGroup.unassignDevices', {
            device_group_ids: memberIds,
          });
        }
        // Soft-archive (status 'Archived' + tombstone), the same call
        // tests/e2e/loop/WP-838.spec.ts uses. deviceGroup.update is NOT a
        // delete - its input is {id, name} only and it cannot change status.
        await trpcMutate(page, 'deviceGroup.delete', { id: groupId });
      }
    } finally {
      await page.close();
    }
  });

  test('AC1 — adding a device to the group links it to that group\'s contacts', async () => {
    await trpcMutate(page, 'deviceGroup.assignDevices', {
      device_group_setting_id: groupId,
      device_ids: [addedDeviceId],
    });

    const links = await waitFor(
      () => contactDeviceMap(page, contactId),
      (map) => map.has(addedDeviceId),
      8,
      1000,
      page,
    );

    expect(
      links.has(addedDeviceId),
      'device added to the group was not linked to the contact assigned that group',
    ).toBe(true);
  });

  test('AC2 — removing a device from the group drops the derived contact link', async () => {
    const members = await groupMemberMap(page, groupId!);
    const junctionId = members.get(addedDeviceId);
    expect(junctionId, 'AC1 fixture missing: device is not in the group').toBeTruthy();

    await trpcMutate(page, 'deviceGroup.unassignDevices', {
      device_group_ids: [junctionId],
    });

    const links = await waitFor(
      () => contactDeviceMap(page, contactId),
      (map) => !map.has(addedDeviceId),
      8,
      1000,
      page,
    );

    expect(
      links.has(addedDeviceId),
      'device removed from the group kept its stale contact link',
    ).toBe(false);
  });

  test('AC3 — the reconcile never touches links outside the group it changed', async () => {
    // Regression guard for the one genuinely dangerous failure mode: a
    // reconcile that over-deletes silently revokes a real person's access to a
    // device.
    //
    // The owner chose the AGGRESSIVE unassign rule (WP-826 comment 14346), so a
    // pre-existing link to a device that LEAVES this run's group is expected to
    // be deleted — that is the accepted downside, not a regression. What must
    // never happen is collateral damage to any other device, so the blast
    // radius asserted here is exactly "every pre-existing link except the ones
    // for devices this run put in the group".
    const links = await contactDeviceMap(page, contactId);
    const groupDevices = new Set([seedDeviceId, addedDeviceId]);

    const missing: string[] = [];
    preExisting.forEach((_rowId, deviceId) => {
      if (groupDevices.has(deviceId)) return;
      if (!links.has(deviceId)) missing.push(deviceId);
    });

    expect(
      missing,
      'the reconcile deleted contact/device links it did not create',
    ).toEqual([]);
  });

  test('AC4 — the seed device link survives, it is still a group member', async () => {
    const links = await contactDeviceMap(page, contactId);
    expect(
      links.has(seedDeviceId),
      'the seed device is still in the group, so its contact link must remain',
    ).toBe(true);
  });
});
