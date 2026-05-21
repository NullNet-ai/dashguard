import { type Locator, type Page } from '@playwright/test';

export type DeviceRecordConfigurationTab = 'Rules' | 'NAT' | 'Aliases';

export class DeviceRecordConfigurationPage {
  readonly page: Page;
  readonly searchButton: Locator;
  readonly searchModalInput: Locator;
  readonly rulesRows: Locator;
  readonly natRulesRows: Locator;
  readonly aliasesRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchButton = page
      .locator('[data-test-id="device-record-search-button"]')
      .first();
    this.searchModalInput = page
      .locator('[data-test-id="device-record-search-input"]')
      .first();
    this.rulesRows = this.rowsForEntity('device-filter-rules');
    this.natRulesRows = this.rowsForEntity('device-nat-rules');
    this.aliasesRows = this.rowsForEntity('aliases');
  }

  async goto(): Promise<void> {
    await this.page.goto('/portal/device/record/DV000002/configuration');
    await this.page.waitForLoadState('networkidle');
  }

  async switchToTab(tab: DeviceRecordConfigurationTab): Promise<void> {
    await this.page.locator(`[aria-label="${tab}"]`).click();
    await this.page.waitForLoadState('networkidle');
  }

  async openSearch(): Promise<void> {
    await this.searchButton.click();
    await this.searchModalInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  rowsForEntity(entity: string): Locator {
    return this.page.locator(
      `tr[data-test-id^="${entity}-grid-table-body-row-"]`,
    );
  }

  columnHeader(entity: string, columnId: string): Locator {
    return this.page.locator(
      `[data-test-id="${entity}-grid-table-head-row-${columnId}"]`,
    );
  }

  columnSortIndicator(
    entity: string,
    columnId: string,
    direction: 'Asc' | 'Desc',
  ): Locator {
    return this.page.locator(
      `[data-test-id="${entity}-grid-table-head-row-${columnId}-sort-${direction.toLowerCase()}"]`,
    );
  }

  sortBadge(entity: string, label: string, direction: 'Asc' | 'Desc'): Locator {
    return this.page
      .locator(`[data-test-id="${entity}-sort-by-badge"]`)
      .filter({ hasText: `${label} (${direction})` });
  }

  groupBadge(entity: string, label: string): Locator {
    return this.page
      .locator(`[data-test-id="${entity}-group-by-badge"]`)
      .filter({ hasText: label });
  }

  groupRows(entity: string): Locator {
    return this.page.locator(
      `td[data-test-id^="${entity}-grid-table-body-row-cell-grouping-"]`,
    );
  }

  groupRowExpandCells(entity: string): Locator {
    return this.page
      .locator('tr')
      .filter({ has: this.groupRows(entity) })
      .locator(`[data-test-id^="${entity}-grid-table-body-row-cell-expand-"]`);
  }

  expandedDataRowCells(entity: string): Locator {
    return this.page.locator(
      `td[data-test-id^="${entity}-grid-table-body-row-cell-group-by-"]`,
    );
  }

  async sortColumn(
    entity: string,
    columnId: string,
    direction: 'Asc' | 'Desc',
  ): Promise<void> {
    if (await this.columnSortIndicator(entity, columnId, direction).isVisible()) {
      return;
    }

    const header = this.columnHeader(entity, columnId);
    await header.hover();
    await header.locator('button').click();
    const menuText =
      direction === 'Asc' ? 'Sort by Ascending' : 'Sort by Descending';
    await this.page.getByRole('menuitem', { name: menuText }).click();
  }

  async resetSort(): Promise<void> {
    const resetButton = this.page.locator('button[name="resetSortButton"]');
    if (await resetButton.isVisible()) {
      await resetButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async groupColumn(
    entity: string,
    columnId: string,
    label: string,
  ): Promise<void> {
    const header = this.columnHeader(entity, columnId);
    await header.hover();
    await header.locator('button').click();
    await this.page
      .getByRole('menuitem', { name: `Group by "${label}"` })
      .click();
  }

  async resetGrouping(entity: string): Promise<void> {
    const removeButtons = this.page.locator(
      `[data-test-id="${entity}-remove-grouping-button"]`,
    );
    const count = await removeButtons.count();
    for (let i = 0; i < count; i++) {
      await removeButtons.first().click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async expandFirstGroupRow(entity: string): Promise<void> {
    await this.groupRowExpandCells(entity).first().click();
  }

  async getRowCount(rows: Locator): Promise<number> {
    return rows.count();
  }
}
