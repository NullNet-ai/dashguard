import { expect, test } from '@playwright/test';

import { RemoteAccessGridPage } from './RemoteAccessGridPage';
import { loginAsAdmin } from '../../utils/auth';
import { expectModalSearchResults } from '../../utils/search';

test.describe('Remote Access Grid', () => {
  let gridPage: RemoteAccessGridPage;

  async function waitForGridRows(): Promise<void> {
    await gridPage.rows.first().waitFor({ state: 'visible', timeout: 15000 });
  }

  async function resetGridState(): Promise<void> {
    await gridPage.resetSort();
    await gridPage.resetGrouping();
  }

  async function prepareGridState(): Promise<void> {
    await waitForGridRows();
    await resetGridState();
  }

  test.beforeEach(async ({ page }) => {
    gridPage = new RemoteAccessGridPage(page);
    await loginAsAdmin(page);
    await gridPage.goto();
  });

  test.describe('Default state', () => {
    test.beforeEach(async () => {
      await prepareGridState();
    });

    test('should display the create button', async () => {
      await expect(gridPage.createButton).toBeVisible();
    });

    test('should display at least one row', async () => {
      await waitForGridRows();
      const count = await gridPage.getRowCount();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Search', () => {
    const searchCases: { term: string; column: string }[] = [
      { term: 'HTTPS', column: 'Type' },
      { term: 'https', column: 'Type' },
      { term: '0.0.0.0', column: 'Address' },
      { term: '443', column: 'Port' },
      { term: 'pfsense', column: 'Device' },
      { term: 'Terminated', column: 'Status' },
    ];

    test.beforeEach(async () => {
      await gridPage.openSearch();
      await expect(gridPage.searchModalInput).toBeVisible();
      await resetGridState();
    });

    for (const { term, column } of searchCases) {
      test(`should return ${column} results for "${term}"`, async ({ page }) => {
        await gridPage.searchModalInput.fill(term);
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
      { columnId: 'tunnel-type', label: 'Type', direction: 'Asc' },
      { columnId: 'tunnel-type', label: 'Type', direction: 'Desc' },
      { columnId: 'address', label: 'Address', direction: 'Asc' },
      { columnId: 'address', label: 'Address', direction: 'Desc' },
      { columnId: 'port', label: 'Port', direction: 'Asc' },
      { columnId: 'port', label: 'Port', direction: 'Desc' },
      { columnId: 'device-name', label: 'Device', direction: 'Asc' },
      { columnId: 'device-name', label: 'Device', direction: 'Desc' },
      { columnId: 'tunnel-status', label: 'Status', direction: 'Asc' },
      { columnId: 'tunnel-status', label: 'Status', direction: 'Desc' },
      {
        columnId: 'last-access-date-time',
        label: 'Last Accessed Date',
        direction: 'Asc',
      },
      {
        columnId: 'last-access-date-time',
        label: 'Last Accessed Date',
        direction: 'Desc',
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
        await gridPage.resetSort();
        await gridPage.sortColumn(columnId, direction);
        await expect(gridPage.sortBadge(label, direction)).toBeVisible({
          timeout: 10000,
        });
        await expect(
          gridPage.columnSortIndicator(columnId, direction),
        ).toBeVisible({ timeout: 5000 });
        await expect(gridPage.rows.first()).toBeVisible({ timeout: 15000 });
        if (firstRow) {
          const values = await gridPage.getCellAttributeValues(
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
      { columnId: 'tunnel-type', label: 'Type' },
      { columnId: 'address', label: 'Address' },
      { columnId: 'port', label: 'Port' },
      { columnId: 'device-name', label: 'Device' },
      { columnId: 'tunnel-status', label: 'Status' },
      { columnId: 'last-access-date-time', label: 'Last Accessed Date' },
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
        await gridPage.groupColumn(columnId, label);
        await expect(gridPage.groupBadge(label)).toBeVisible({
          timeout: 10000,
        });
        await expect(gridPage.groupRows.first()).toBeVisible({
          timeout: 10000,
        });
        const count = await gridPage.groupRows.count();
        expect(
          count,
          'Expected at least one group row to be rendered',
        ).toBeGreaterThan(0);

        await gridPage.expandFirstGroupRow();
        await expect(gridPage.expandedDataRowCells.first()).toBeVisible({
          timeout: 10000,
        });
        const childCount = await gridPage.expandedDataRowCells.count();
        expect(
          childCount,
          'Expected expanded group to contain at least one child result',
        ).toBeGreaterThan(0);
      });
    }
  });

});
