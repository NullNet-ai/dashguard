import { expect, test, type Locator } from '@playwright/test';

import {
  DeviceRecordConfigurationPage,
  type DeviceRecordConfigurationTab,
} from './DeviceRecordConfigurationPage';
import { loginAsAdmin } from '../../../utils/auth';
import { expectModalSearchResults } from '../../../utils/search';

type SearchCase = {
  term: string;
  column: string;
};

type SortCase = {
  columnId: string;
  label: string;
  direction: 'Asc' | 'Desc';
};

type GroupCase = {
  columnId: string;
  label: string;
};

type GridSuite = {
  tab: DeviceRecordConfigurationTab;
  entity: string;
  rows: (configPage: DeviceRecordConfigurationPage) => Locator;
  searchCases: SearchCase[];
  sortCases: SortCase[];
  groupCases: GroupCase[];
};

const gridSuites: GridSuite[] = [
  {
    // TODO: Add search cases & clicking all default filters each
    tab: 'Rules',
    entity: 'device-filter-rules',
    rows: (configPage) => configPage.rulesRows,
    searchCases: [
    ],
    sortCases: [
      { columnId: 'status', label: 'State', direction: 'Asc' },
      { columnId: 'status', label: 'State', direction: 'Desc' },
      { columnId: 'device-rule-status', label: 'Status', direction: 'Asc' },
      { columnId: 'device-rule-status', label: 'Status', direction: 'Desc' },
      { columnId: 'updated-by', label: 'Updated By', direction: 'Asc' },
      { columnId: 'updated-by', label: 'Updated By', direction: 'Desc' },
      { columnId: 'created-by', label: 'Created By', direction: 'Asc' },
      { columnId: 'created-by', label: 'Created By', direction: 'Desc' },
    ],
    groupCases: [
      { columnId: 'status', label: 'State' },
      { columnId: 'device-rule-status', label: 'Status' },
      { columnId: 'disabled', label: 'Mode' },
      { columnId: 'policy', label: 'Action' },
      { columnId: 'order', label: 'Priority Order' },
      { columnId: 'interface', label: 'Interface' },
      { columnId: 'updated-by', label: 'Updated By' },
      { columnId: 'created-by', label: 'Created By' },
    ],
  },
  {
    tab: 'NAT',
    entity: 'device-nat-rules',
    rows: (configPage) => configPage.natRulesRows,
    searchCases: [
      { term: 'Active', column: 'State' },
      { term: 'Applied', column: 'Status' },
      { term: 'Enabled', column: 'Mode' },
      { term: '0', column: 'Priority' },
      { term: 'opt1', column: 'Interface' },
      { term: 'TCP/UDP', column: 'Protocol' },
      { term: '*', column: 'Source' },
      { term: '*', column: 'Src Port' },
      { term: '103.18.64.250', column: 'Destination' },
      { term: '9993', column: 'Dest Port' },
      { term: '10.1.255.101', column: 'NAT IP' },
      { term: '9993', column: 'NAT Port' },
      { term: 'ZT Root 1', column: 'Description' },
    ],
    sortCases: [
      { columnId: 'status', label: 'State', direction: 'Asc' },
      { columnId: 'status', label: 'State', direction: 'Desc' },
      { columnId: 'device-rule-status', label: 'Status', direction: 'Asc' },
      { columnId: 'device-rule-status', label: 'Status', direction: 'Desc' },
      { columnId: 'disabled', label: 'Mode', direction: 'Asc' },
      { columnId: 'disabled', label: 'Mode', direction: 'Desc' },
      { columnId: 'order', label: 'Priority Order', direction: 'Asc' },
      { columnId: 'order', label: 'Priority Order', direction: 'Desc' },
      { columnId: 'interface', label: 'Interface', direction: 'Asc' },
      { columnId: 'interface', label: 'Interface', direction: 'Desc' },
      { columnId: 'protocol', label: 'Protocol', direction: 'Asc' },
      { columnId: 'protocol', label: 'Protocol', direction: 'Desc' },
      { columnId: 'source-ip-value', label: 'Source', direction: 'Asc' },
      { columnId: 'source-ip-value', label: 'Source', direction: 'Desc' },
      { columnId: 'source-port-value', label: 'Src Port', direction: 'Asc' },
      { columnId: 'source-port-value', label: 'Src Port', direction: 'Desc' },
      { columnId: 'destination-ip-value', label: 'Destination', direction: 'Asc' },
      { columnId: 'destination-ip-value', label: 'Destination', direction: 'Desc' },
      { columnId: 'destination-port-value', label: 'Dest Port', direction: 'Asc' },
      { columnId: 'destination-port-value', label: 'Dest Port', direction: 'Desc' },
      { columnId: 'redirect-ip', label: 'NAT IP', direction: 'Asc' },
      { columnId: 'redirect-ip', label: 'NAT IP', direction: 'Desc' },
      { columnId: 'redirect-port', label: 'NAT Port', direction: 'Asc' },
      { columnId: 'redirect-port', label: 'NAT Port', direction: 'Desc' },
      { columnId: 'description', label: 'Description', direction: 'Asc' },
      { columnId: 'description', label: 'Description', direction: 'Desc' },
    ],
    groupCases: [
      { columnId: 'status', label: 'State' },
      { columnId: 'device-rule-status', label: 'Status' },
      { columnId: 'disabled', label: 'Mode' },
      { columnId: 'order', label: 'Priority Order' },
      { columnId: 'interface', label: 'Interface' },
      { columnId: 'redirect-ip', label: 'NAT IP' },
      { columnId: 'redirect-port', label: 'NAT Port' },
      { columnId: 'updated-by', label: 'Updated By' },
      { columnId: 'created-by', label: 'Created By' },
    ],
  },
  {
    tab: 'Aliases',
    entity: 'aliases',
    rows: (configPage) => configPage.aliasesRows,
    searchCases: [
      { term: 'Active', column: 'State' },
      { term: 'web_ports', column: 'Name' },
      { term: 'Port(s)', column: 'Type' },
      { term: '443, 80', column: 'Values' },
      { term: 'Web Ports for Development', column: 'Description' },
    ],
    sortCases: [
      { columnId: 'status', label: 'State', direction: 'Asc' },
      { columnId: 'status', label: 'State', direction: 'Desc' },
      { columnId: 'name', label: 'Name', direction: 'Asc' },
      { columnId: 'name', label: 'Name', direction: 'Desc' },
      { columnId: 'type', label: 'Type', direction: 'Asc' },
      { columnId: 'type', label: 'Type', direction: 'Desc' },
    ],
    groupCases: [
      { columnId: 'status', label: 'State' },
      { columnId: 'name', label: 'Name' },
      { columnId: 'type', label: 'Type' },
      { columnId: 'updated-by', label: 'Updated By' },
      { columnId: 'created-by', label: 'Created By' },
    ],
  },
];

test.describe('Device Record Configuration', () => {
  let configPage: DeviceRecordConfigurationPage;

  async function waitForSuiteRows(suite: GridSuite): Promise<void> {
    await suite.rows(configPage).first().waitFor({ state: 'visible', timeout: 15000 });
  }

  async function resetSuiteGridState(suite: GridSuite): Promise<void> {
    await configPage.resetSort();
    await configPage.resetGrouping(suite.entity);
  }

  async function prepareSuiteGridState(suite: GridSuite): Promise<void> {
    await waitForSuiteRows(suite);
    await resetSuiteGridState(suite);
  }

  test.beforeEach(async ({ page }) => {
    configPage = new DeviceRecordConfigurationPage(page);
    await loginAsAdmin(page);
    await configPage.goto();
  });

  for (const suite of gridSuites) {
    test.describe(`${suite.tab} Grid`, () => {
      test.beforeEach(async () => {
        await configPage.switchToTab(suite.tab);
        await waitForSuiteRows(suite);
      });

      test.describe('Default state', () => {
        test.beforeEach(async () => {
          await resetSuiteGridState(suite);
        });

        test('should display at least one row', async () => {
          const count = await configPage.getRowCount(suite.rows(configPage));
          expect(count).toBeGreaterThan(0);
        });
      });

      test.describe('Search', () => {
        test.beforeEach(async () => {
          await resetSuiteGridState(suite);
          await configPage.openSearch();
        });

        for (const { term, column } of suite.searchCases) {
          test(`should return ${column} results for "${term}"`, async ({ page }) => {
            await configPage.searchModalInput.fill(term);
            await expectModalSearchResults(page, term, column);
          });
        }
      });

      test.describe.serial('Sorting', () => {
        test.beforeEach(async () => {
          await prepareSuiteGridState(suite);
        });

        for (const { columnId, label, direction } of suite.sortCases) {
          test(`should sort by "${label}" in ${direction} order`, async () => {
            await configPage.resetSort();
            await configPage.sortColumn(suite.entity, columnId, direction);

            await expect(
              configPage.sortBadge(suite.entity, label, direction),
            ).toBeVisible({ timeout: 10000 });
            await expect(
              configPage.columnSortIndicator(suite.entity, columnId, direction),
            ).toBeVisible({ timeout: 5000 });
            await expect(suite.rows(configPage).first()).toBeVisible({
              timeout: 15000,
            });
          });
        }
      });

      test.describe.serial('Grouping', () => {
        test.beforeEach(async () => {
          await prepareSuiteGridState(suite);
        });

        for (const { columnId, label } of suite.groupCases) {
          test(`should group rows by "${label}"`, async () => {
            await configPage.groupColumn(suite.entity, columnId, label);

            await expect(configPage.groupBadge(suite.entity, label)).toBeVisible(
              {
                timeout: 10000,
              },
            );
            await expect(configPage.groupRows(suite.entity).first()).toBeVisible(
              {
                timeout: 10000,
              },
            );

            const groupCount = await configPage.groupRows(suite.entity).count();
            expect(
              groupCount,
              'Expected at least one group row to be rendered',
            ).toBeGreaterThan(0);

            await configPage.expandFirstGroupRow(suite.entity);
            await expect(
              configPage.expandedDataRowCells(suite.entity).first(),
            ).toBeVisible({ timeout: 15000 });

            const childCount = await configPage
              .expandedDataRowCells(suite.entity)
              .count();
            expect(
              childCount,
              'Expected expanded group to contain at least one child result',
            ).toBeGreaterThan(0);
          });
        }
      });
    });
  }
});
