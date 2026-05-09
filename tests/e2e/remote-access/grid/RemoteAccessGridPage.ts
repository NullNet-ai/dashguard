import { type Locator, type Page } from '@playwright/test';

export class RemoteAccessGridPage {
  readonly page: Page;
  readonly gridContainer: Locator;
  readonly createButton: Locator;
  readonly searchButton: Locator;
  readonly searchModalInput: Locator;
  readonly rows: Locator;
  readonly createFormDialog: Locator;
  readonly createFormCloseButton: Locator;
  readonly createFormSubmitButton: Locator;
  readonly createFormDeviceInput: Locator;
  readonly createFormConnectionTypeInput: Locator;
  readonly createFormServiceInput: Locator;
  readonly deviceRequiredErrorMessage: Locator;
  readonly connectionTypeRequiredErrorMessage: Locator;
  readonly serviceRequiredErrorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // No hardcoded data-test-id on page wrapper — use table body as grid presence indicator
    this.gridContainer = page.locator(
      '[data-test-id="device-tunnels-grid-table-body"]',
    );
    // CustomNewButton has no data-test-id; use accessible role + name
    this.createButton = page.getByRole('button', { name: /^New$/ }).first();
    this.searchButton = page
      .locator('[data-test-id="device-remote-access-session-grid-search-button"]')
      .first();
    this.searchModalInput = page
      .locator('[data-test-id="device-remote-access-session-grid-search-input"]')
      .first();
    this.rows = page.locator(
      '[data-test-id^="device-tunnels-grid-table-body-row"]',
    );
    this.createFormDialog = page.getByRole('dialog');
    this.createFormCloseButton = page.locator(
      '[data-test-id="side-drawer-close"]',
    );
    this.createFormSubmitButton = page.locator(
      '[data-test-id="no-entity-wizard-formlabel-save-form-button"]',
    );
    this.createFormDeviceInput = page.locator(
      '[data-test-id="no-entity-wizard-formlabel-select-device-id-input"]',
    );
    this.createFormConnectionTypeInput = page.locator(
      '[data-test-id="no-entity-wizard-formlabel-select-remote-access-type-input"]',
    );
    this.createFormServiceInput = page.locator(
      '[data-test-id="no-entity-wizard-formlabel-select-device-service-id-input"]',
    );
    this.deviceRequiredErrorMessage = page.locator(
      '[data-test-id="no-entity-wizard-formlabel-error-message-device-id"]',
    );
    this.connectionTypeRequiredErrorMessage = page.locator(
      '[data-test-id="no-entity-wizard-formlabel-error-message-remote-access-type"]',
    );
    this.serviceRequiredErrorMessage = page.locator(
      '[data-test-id="no-entity-wizard-formlabel-error-message-device-service-id"]',
    );
  }

  async goto() {
    await this.page.goto('/portal/device_remote_access_session/grid');
    await this.page.waitForLoadState('networkidle');
  }

  async getRowCount() {
    return this.rows.count();
  }

  async openSearch() {
    await this.searchButton.click();
  }

  columnHeader(columnId: string): Locator {
    return this.page.locator(
      `[data-test-id="device-tunnels-grid-table-head-row-${columnId}"]`,
    );
  }

  columnSortIndicator(columnId: string, direction: 'Asc' | 'Desc'): Locator {
    return this.page.locator(
      `[data-test-id="device-tunnels-grid-table-head-row-${columnId}-sort-${direction.toLowerCase()}"]`,
    );
  }

  sortBadge(label: string, direction: 'Asc' | 'Desc'): Locator {
    return this.page
      .locator('[data-test-id="device-tunnels-sort-by-badge"]')
      .filter({ hasText: `${label} (${direction})` });
  }

  async sortColumn(columnId: string, direction: 'Asc' | 'Desc'): Promise<void> {
    const header = this.columnHeader(columnId);
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

  firstRowCell(testId: string): Locator {
    return this.rows.first().locator(`[data-test-id="${testId}"]`);
  }

  async getCellAttributeValues(
    testId: string,
    attr: string,
  ): Promise<string[]> {
    const cells = this.rows.locator(`[data-test-id="${testId}"]`);
    const count = await cells.count();
    const values: string[] = [];
    for (let i = 0; i < count; i++) {
      const value = await cells.nth(i).getAttribute(attr);
      if (value !== null) values.push(value);
    }
    return values;
  }

  groupBadge(label: string): Locator {
    return this.page
      .locator('[data-test-id="device-tunnels-group-by-badge"]')
      .filter({ hasText: label });
  }

  get groupRows(): Locator {
    return this.page.locator(
      '[data-test-id^="device-tunnels-grid-table-body-row-cell-grouping"]',
    );
  }

  get groupRowExpandCells(): Locator {
    return this.page
      .locator('tr')
      .filter({
        has: this.page.locator(
          '[data-test-id^="device-tunnels-grid-table-body-row-cell-grouping"]',
        ),
      })
      .locator(
        '[data-test-id^="device-tunnels-grid-table-body-row-cell-expand"]',
      );
  }

  get expandedDataRowCells(): Locator {
    // Child rows always have a 'group-by' column cell; parent group rows use 'grouping' instead.
    // This holds regardless of which column is grouped.
    return this.page.locator(
      '[data-test-id^="device-tunnels-grid-table-body-row-cell-group-by"]',
    );
  }

  async expandFirstGroupRow(): Promise<void> {
    await this.groupRowExpandCells.first().click();
  }

  async groupColumn(columnId: string, label: string): Promise<void> {
    const header = this.columnHeader(columnId);
    await header.hover();
    await header.locator('button').click();
    await this.page
      .getByRole('menuitem', { name: `Group by "${label}"` })
      .click();
  }

  async resetGrouping(): Promise<void> {
    const removeBtns = this.page.locator(
      '[data-test-id="device-tunnels-remove-grouping-button"]',
    );
    const count = await removeBtns.count();
    for (let i = 0; i < count; i++) {
      await removeBtns.first().click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async openCreateDrawer(): Promise<void> {
    await this.createButton.click();
    await this.createFormDialog.waitFor({ state: 'visible', timeout: 10000 });
    await this.createFormConnectionTypeInput.waitFor({
      state: 'visible',
      timeout: 10000,
    });
  }

  async closeCreateDrawer(): Promise<void> {
    if (await this.createFormCloseButton.isVisible()) {
      await this.createFormCloseButton.click();
      // The drawer slides off-screen via translate-x-full and stays in the DOM,
      // so waitFor('hidden') never resolves. Check for the closed CSS class instead.
      await this.page.waitForFunction(
        () =>
          document
            .querySelector('[role="dialog"]')
            ?.classList.contains('translate-x-full') ?? true,
        { timeout: 5000 },
      );
    }
  }

  async selectConnectionType(type: 'ssh' | 'tty' | 'ui'): Promise<void> {
    await this.createFormConnectionTypeInput.click();
    await this.page
      .locator(
        `[data-test-id="no-entity-wizard-formlabel-select-remote-access-type-option-${type}"]`,
      )
      .click();
  }

  async selectFirstDropdownOption(inputLocator: Locator): Promise<void> {
    await inputLocator.click();
    const firstOption = this.page.locator('[role="option"]').first();
    await firstOption.waitFor({ state: 'visible', timeout: 10000 });
    await firstOption.click();
  }

  rowWithStatus(status: string): Locator {
    return this.rows.filter({ hasText: new RegExp(status, 'i') }).first();
  }

  rowReconnectButton(row: Locator): Locator {
    return row.locator('div.rounded-xl button').first();
  }

  rowDisconnectButton(row: Locator): Locator {
    return row.locator('div.rounded-xl button').nth(1);
  }
}
