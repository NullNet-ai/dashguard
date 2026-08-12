import { type Locator, type Page } from '@playwright/test';

const DEVICE_CODE = 'DV000002';

function toTestIdSegment(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export class DeviceRecordDevicePage {
  readonly page: Page;
  readonly categoryUnlockButton: Locator;
  readonly categoryAppGuardOption: Locator;
  readonly categoryFirewallOption: Locator;
  readonly categoryLoadBalancerOption: Locator;
  readonly categorySaveButton: Locator;
  readonly locationUnlockButton: Locator;
  readonly countryInput: Locator;
  readonly cityInput: Locator;
  readonly locationSaveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.categoryUnlockButton = page.locator(
      '[data-test-id="device-wizard-device-category-form-unlock-button"]',
    );
    this.categoryAppGuardOption = page.locator(
      '[data-test-id="device-record-devicecategoryform-option-app-guard-device-category"]',
    );
    this.categoryFirewallOption = page.locator(
      '[data-test-id="device-record-devicecategoryform-option-firewall-device-category"]',
    );
    this.categoryLoadBalancerOption = page.locator(
      '[data-test-id="device-record-devicecategoryform-option-load-balancer-device-category"]',
    );
    this.categorySaveButton = page.locator(
      '[data-test-id="device-wizard-device-category-form-save-form-button"]',
    );
    this.locationUnlockButton = page.locator(
      '[data-test-id="device-wizard-device-location-form-unlock-button"]',
    );
    this.countryInput = page.locator(
      '[data-test-id="device-record-devicelocationform-select-address-country-input"]',
    );
    this.cityInput = page.locator(
      '[data-test-id="device-record-devicelocationform-select-address-city-input"]',
    );
    this.locationSaveButton = page.locator(
      '[data-test-id="device-wizard-device-location-form-save-form-button"]',
    );
  }

  async goto(): Promise<void> {
    await this.page.goto(`/portal/device/record/${DEVICE_CODE}/device`);
    await this.page.waitForLoadState('networkidle');
  }

  countryOption(country: string): Locator {
    return this.page.locator(
      `[data-test-id="device-record-devicelocationform-select-address-country-option-${toTestIdSegment(country)}"]`,
    );
  }

  cityOption(city: string): Locator {
    return this.page.locator(
      `[data-test-id="device-record-devicelocationform-select-address-city-option-${toTestIdSegment(city)}"]`,
    );
  }

  async unlockCategoryForm(): Promise<void> {
    if (await this.categorySaveButton.isVisible()) {
      return;
    }

    await this.categoryUnlockButton.click();
    await this.categorySaveButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  async unlockLocationForm(): Promise<void> {
    if (await this.locationSaveButton.isVisible()) {
      return;
    }

    await this.locationUnlockButton.click();
    await this.locationSaveButton.waitFor({ state: 'visible', timeout: 10000 });
  }
}
