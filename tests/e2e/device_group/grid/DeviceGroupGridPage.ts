import { type Locator, type Page } from '@playwright/test';

export class DeviceGroupGridPage {
  readonly page: Page;
  readonly tableBody: Locator;
  readonly nameColumnHeader: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tableBody = page.locator(
      '[data-test-id="device-group-settings-grid-table-body"]',
    );
    this.nameColumnHeader = page.locator(
      '[data-test-id="device-group-settings-grid-table-head-row-name"]',
    );
    this.createButton = page.getByRole('button', { name: /^New$/ }).first();
  }

  async goto() {
    await this.page.goto('/portal/device_group/grid');
    await this.page.waitForLoadState('networkidle');
  }
}
