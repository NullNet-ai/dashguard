// WP-760: Device > Main Grid > Group By - User needs to refresh after grouping to see the data.
//
// Root cause: device/grid/page.tsx is a 'use client' component. When group by is applied
// via the filter side drawer (saveUpdatedFilter in Grid/Tabs/SideDrawer/Provider.tsx),
// it calls config.onFetchRecords({grouping: [field]}) which updates the tRPC query args
// but does NOT update the Grid Provider's `grouping` state. The grid then receives
// nested grouped data from the backend but renders with grouping=[] → "No record."
//
// Fix: wrap onFetchRecords in device/grid/page.tsx so that when grouping changes,
// gridCacheData is re-fetched, propagating the new groups to gridProps.grouping
// → Grid Provider grouping state updates → formatGroupByResult runs correctly.

import { expect, test } from '@playwright/test';

import { DeviceGridPage } from '../device/grid/DeviceGridPage';
import { loginAsAdmin } from '../utils/auth';

test.describe('WP-760: Device Grid Group By shows data without page refresh', () => {
  let deviceGridPage: DeviceGridPage;

  test.beforeEach(async ({ page }) => {
    deviceGridPage = new DeviceGridPage(page);
    await loginAsAdmin(page);
    await deviceGridPage.goto();
    await deviceGridPage.rows
      .first()
      .waitFor({ state: 'visible', timeout: 15000 });
    await deviceGridPage.resetGrouping();
  });

  test('after applying group by via column header, grouped rows appear without refresh', async ({
    page,
  }) => {
    await deviceGridPage.groupColumn('status', 'Status');

    // Without refreshing, grouped rows and badge should appear immediately.
    await expect(deviceGridPage.groupBadge('Status')).toBeVisible({
      timeout: 10000,
    });
    await expect(deviceGridPage.groupRows.first()).toBeVisible({
      timeout: 15000,
    });

    const count = await deviceGridPage.groupRows.count();
    expect(
      count,
      'Expected at least one group row without refresh',
    ).toBeGreaterThan(0);
  });

  test('after applying group by via filter side drawer, grouped rows appear without refresh', async ({
    page,
  }) => {
    // Open filter side drawer via the "All" tab's manage/edit button
    const allTabEditBtn = page
      .locator('[data-test-id^="device-apptab"]')
      .filter({ hasText: 'All' })
      .locator('button')
      .first();

    await allTabEditBtn.hover();
    await allTabEditBtn.click();

    const sideDrawer = page
      .locator('[data-test-id="side-drawer"], [role="dialog"]')
      .first();
    await expect(sideDrawer).toBeVisible({ timeout: 10000 });

    // Add a "Group By Status" in the Groups section
    const addGroupBtn = page
      .getByRole('button', { name: /add group/i })
      .first();
    const groupBtnVisible = await addGroupBtn
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (groupBtnVisible) {
      await addGroupBtn.click();
      const groupFieldSelect = page.getByRole('combobox').last();
      await groupFieldSelect.selectOption({ label: 'Status' });
    }

    const saveBtn = page
      .getByRole('button', { name: /save/i })
      .filter({ hasNot: page.locator('[disabled]') })
      .first();
    await saveBtn.click();

    // Without page refresh, grouped rows must appear.
    // BEFORE the fix: grid shows "No record" because the Grid Provider's grouping
    // state is not updated when onFetchRecords is called from the filter side drawer.
    await expect(deviceGridPage.groupRows.first()).toBeVisible({
      timeout: 15000,
    });
    const count = await deviceGridPage.groupRows.count();
    expect(
      count,
      'Expected grouped rows after filter drawer save — no page refresh required',
    ).toBeGreaterThan(0);
  });
});
