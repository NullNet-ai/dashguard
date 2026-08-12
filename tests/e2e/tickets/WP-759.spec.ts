// WP-759: Device Grid "Created Date" and "Updated Date" display UTC instead of local timezone.
// ORM returns "MM/DD/YYYY HH:mm" strings in UTC (pre-formatted by addCommonGridConcatenates).
// Without a cell renderer, TanStack Table renders the raw UTC string.
// Fix: moment.utc(raw, 'MM/DD/YYYY HH:mm').local().format('MM/DD/YYYY HH:mm') in columns.tsx

import { expect, test } from '@playwright/test';

import { DeviceGridPage } from '../device/grid/DeviceGridPage';
import { loginAsAdmin } from '../utils/auth';

test.describe('WP-759: Device Grid Datetime Timezone', () => {
  test.use({ timezoneId: 'Asia/Manila' });

  let deviceGridPage: DeviceGridPage;

  const fetchRawUtcValues = async (
    page: import('@playwright/test').Page,
    column: 'created_date_time' | 'updated_date_time',
  ): Promise<string[]> => {
    return page.evaluate(async (col) => {
      const input = encodeURIComponent(
        JSON.stringify({
          '0': {
            json: {
              current: 1,
              limit: 100,
              pluck: ['id'],
              sorting: [],
              advance_filters: [],
              entity: 'device',
              group_advance_filters: [],
              grouping: [],
            },
          },
        }),
      );
      const res = await fetch(`/api/trpc/grid.items?batch=1&input=${input}`);
      const data = (await res.json()) as any;
      const items: any[] = data?.[0]?.result?.data?.json?.items ?? [];
      return items.map((item: any) => item[col]).filter(Boolean);
    }, column);
  };

  test.beforeEach(async ({ page }) => {
    deviceGridPage = new DeviceGridPage(page);
    await loginAsAdmin(page);
    await deviceGridPage.goto();
    await deviceGridPage.rows
      .first()
      .waitFor({ state: 'visible', timeout: 15000 });
  });

  test('Created Date cells should display local timezone (PH+8), not raw UTC', async ({
    page,
  }) => {
    const rawUtcValues = new Set(
      await fetchRawUtcValues(page, 'created_date_time'),
    );
    expect(
      rawUtcValues.size,
      'API returned no created_date_time values — check data setup',
    ).toBeGreaterThan(0);

    const cells = page.locator(
      '[data-test-id^="device-grid-table-body-row-cell-created-date-time"]',
    );
    const count = await cells.count();
    expect(count, 'Expected at least one Created Date cell').toBeGreaterThan(0);

    let checkedCount = 0;
    for (let i = 0; i < count; i++) {
      const text = (await cells.nth(i).innerText()).trim();
      if (!text) continue;
      checkedCount++;
      expect(
        rawUtcValues.has(text),
        `Created Date cell ${i} shows raw UTC "${text}" — local timezone conversion missing`,
      ).toBe(false);
    }
    expect(
      checkedCount,
      'All Created Date cells were empty — no timezone check performed',
    ).toBeGreaterThan(0);
  });

  test('Updated Date cells should display local timezone (PH+8), not raw UTC', async ({
    page,
  }) => {
    const rawUtcValues = new Set(
      await fetchRawUtcValues(page, 'updated_date_time'),
    );
    expect(
      rawUtcValues.size,
      'API returned no updated_date_time values — check data setup',
    ).toBeGreaterThan(0);

    const cells = page.locator(
      '[data-test-id^="device-grid-table-body-row-cell-updated-date-time"]',
    );
    const count = await cells.count();
    expect(count, 'Expected at least one Updated Date cell').toBeGreaterThan(0);

    let checkedCount = 0;
    for (let i = 0; i < count; i++) {
      const text = (await cells.nth(i).innerText()).trim();
      if (!text) continue;
      checkedCount++;
      expect(
        rawUtcValues.has(text),
        `Updated Date cell ${i} shows raw UTC "${text}" — local timezone conversion missing`,
      ).toBe(false);
    }
    expect(
      checkedCount,
      'All Updated Date cells were empty — no timezone check performed',
    ).toBeGreaterThan(0);
  });
});
