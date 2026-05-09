import { expect, test } from '@playwright/test';

import { DeviceGridPage } from './DeviceGridPage';
import { loginAsAdmin } from '../../utils/auth';
import { expectModalSearchResults } from '../../utils/search';

test.describe('Device Grid', () => {
  let deviceGridPage: DeviceGridPage;

  async function waitForGridRows(): Promise<void> {
    await deviceGridPage.rows.first().waitFor({ state: 'visible', timeout: 15000 });
  }

  async function resetGridState(): Promise<void> {
    await deviceGridPage.resetSort();
    await deviceGridPage.resetGrouping();
  }

  async function prepareGridState(): Promise<void> {
    await waitForGridRows();
    await resetGridState();
  }

  test.beforeEach(async ({ page }) => {
    deviceGridPage = new DeviceGridPage(page);
    await loginAsAdmin(page);
    await deviceGridPage.goto();
  });

  test.describe('Default state', () => {
    test.beforeEach(async () => {
      await prepareGridState();
    });

    test('should display the create button', async () => {
      await expect(deviceGridPage.createButton).toBeVisible();
    });

    test('should display at least one row', async () => {
      await waitForGridRows();
      const count = await deviceGridPage.getRowCount();
      expect(count).toBeGreaterThan(0);
    });

    // TODO: Row Action Buttons Lifecycle - Edit, Archive, Remote Access Session
  });

  test.describe('Search', () => {
    const searchCases: { term: string; column: string }[] = [
      { term: 'Active', column: 'Status' },
      { term: 'active', column: 'Status' },
      { term: 'Draft', column: 'Status' },
      { term: 'draft', column: 'Status' },
      { term: 'Authorized', column: 'Authorized' },
      { term: 'authorized', column: 'Authorized' },
      { term: 'Unauthorized', column: 'Authorized' },
      { term: 'unauthorized', column: 'Authorized' },
      { term: 'PFsense', column: 'Name' },
      { term: 'pfsense', column: 'Name' },
      { term: 'PFsense', column: 'Type' },
      { term: 'pfsense', column: 'Type' },
      { term: 'Firewall', column: 'Category' },
      { term: 'firewall', column: 'Category' },
      { term: 'Online', column: 'Connection Status' },
      { term: 'Offline', column: 'Connection Status' },
    ];

    test.beforeEach(async () => {
      await deviceGridPage.openSearch();
      await expect(deviceGridPage.searchModalInput).toBeVisible();
      await resetGridState();
    });

    for (const { term, column } of searchCases) {
      test(`should return ${column} results for "${term}"`, async ({ page }) => {
        await deviceGridPage.searchModalInput.fill(term);
        await expectModalSearchResults(page, term, column);
      });
    }
  });

  test.describe.serial('Sorting', () => {
    const sortCases: {
      columnId: string;
      label: string;
      direction: 'Asc' | 'Desc';
      firstRow?: { testId: string; attr: string; value: string };
    }[] = [
      { columnId: 'code', label: 'ID', direction: 'Asc' },
      { columnId: 'code', label: 'ID', direction: 'Desc' },
      {
        columnId: 'is-device-authorized',
        label: 'Authorized',
        direction: 'Asc',
        firstRow: {
          testId: 'device-auth-cell',
          attr: 'data-authorized',
          value: 'true',
        },
      },
      {
        columnId: 'is-device-authorized',
        label: 'Authorized',
        direction: 'Desc',
        firstRow: {
          testId: 'device-auth-cell',
          attr: 'data-authorized',
          value: 'false',
        },
      },
      {
        columnId: 'is-device-online',
        label: 'Connection Status',
        direction: 'Asc',
        firstRow: {
          testId: 'device-online-badge',
          attr: 'data-online',
          value: 'true',
        },
      },
      {
        columnId: 'is-device-online',
        label: 'Connection Status',
        direction: 'Desc',
        firstRow: {
          testId: 'device-online-badge',
          attr: 'data-online',
          value: 'false',
        },
      },
      {
        columnId: 'updated-date-time',
        label: 'Updated Date',
        direction: 'Asc',
      },
      {
        columnId: 'updated-date-time',
        label: 'Updated Date',
        direction: 'Desc',
      },
      { columnId: 'updated-by', label: 'Updated By', direction: 'Asc' },
      { columnId: 'updated-by', label: 'Updated By', direction: 'Desc' },
      {
        columnId: 'created-date-time',
        label: 'Created Date',
        direction: 'Asc',
      },
      {
        columnId: 'created-date-time',
        label: 'Created Date',
        direction: 'Desc',
      },
      { columnId: 'created-by', label: 'Created By', direction: 'Asc' },
      { columnId: 'created-by', label: 'Created By', direction: 'Desc' },
    ];

    test.beforeEach(async () => {
      await prepareGridState();
    });

    for (const { columnId, label, direction, firstRow } of sortCases) {
      test(`should sort by "${label}" in ${direction} order`, async () => {
        await deviceGridPage.resetSort();
        await deviceGridPage.sortColumn(columnId, direction);
        await expect(deviceGridPage.sortBadge(label, direction)).toBeVisible({
          timeout: 10000,
        });
        await expect(
          deviceGridPage.columnSortIndicator(columnId, direction),
        ).toBeVisible({ timeout: 5000 });
        await expect(deviceGridPage.rows.first()).toBeVisible({
          timeout: 15000,
        });
        if (firstRow) {
          const values = await deviceGridPage.getCellAttributeValues(
            firstRow.testId,
            firstRow.attr,
          );
          expect(values.length, 'Expected at least one cell').toBeGreaterThan(
            0,
          );
          expect(values[0], 'Expected first row to match sort value').toBe(
            firstRow.value,
          );
          const otherValue = firstRow.value === 'true' ? 'false' : 'true';
          const transitionIndex = values.indexOf(otherValue);
          if (transitionIndex !== -1) {
            const afterTransition = values.slice(transitionIndex);
            expect(
              afterTransition.every((v) => v === otherValue),
              `Sort order violated after index ${transitionIndex}: [${afterTransition.join(', ')}]`,
            ).toBe(true);
          }
        }
      });
    }
  });

  test.describe.serial('Grouping', () => {
    const groupCases: { columnId: string; label: string }[] = [
      { columnId: 'code', label: 'ID' },
      { columnId: 'status', label: 'Status' },
      { columnId: 'is-device-authorized', label: 'Authorized' },
      { columnId: 'device-name', label: 'Name' },
      { columnId: 'device-category', label: 'Category' },
      { columnId: 'device-type', label: 'Type' },
      { columnId: 'is-device-online', label: 'Connection Status' },
      { columnId: 'device-uuid', label: 'UUID' },
      { columnId: 'updated-date-time', label: 'Updated Date' },
      { columnId: 'updated-by', label: 'Updated By' },
      { columnId: 'created-date-time', label: 'Created Date' },
      { columnId: 'created-by', label: 'Created By' },
    ];

    test.beforeEach(async () => {
      await prepareGridState();
    });

    for (const { columnId, label } of groupCases) {
      test(`should group rows by "${label}"`, async () => {
        await deviceGridPage.groupColumn(columnId, label);
        await expect(deviceGridPage.groupBadge(label)).toBeVisible({
          timeout: 10000,
        });
        await expect(deviceGridPage.groupRows.first()).toBeVisible({
          timeout: 10000,
        });
        const count = await deviceGridPage.groupRows.count();
        expect(
          count,
          'Expected at least one group row to be rendered',
        ).toBeGreaterThan(0);

        await deviceGridPage.expandFirstGroupRow();
        await expect(deviceGridPage.expandedDataRowCells.first()).toBeVisible({
          timeout: 15000,
        });
        const childCount = await deviceGridPage.expandedDataRowCells.count();
        expect(
          childCount,
          'Expected expanded group to contain at least one child result',
        ).toBeGreaterThan(0);
      });
    }
  });
});
