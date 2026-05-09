import { expect, type Locator, type Page } from '@playwright/test';

function toTestIdSegment(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export class DeviceWizardPage {
  readonly page: Page;
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly categoryFirewallLabel: Locator;
  readonly countryInput: Locator;
  readonly cityInput: Locator;
  readonly locationSaveButton: Locator;
  readonly categorySaveButton: Locator;
  readonly deviceNameInput: Locator;
  readonly deviceTypeInput: Locator;
  readonly deviceTypeSaveButton: Locator;
  readonly step1CategorySummary: Locator;
  readonly step1LocationSummary: Locator;
  readonly step2DeviceNameSummary: Locator;
  readonly step2DeviceTypeSummary: Locator;
  readonly step3InstallationCodeSummary: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nextButton = page.locator('[data-test-id="device-wizard-next-button"]');
    this.previousButton = page.locator(
      '[data-test-id="device-wizard-previous-button"]',
    );
    this.categoryFirewallLabel = page.locator(
      '[data-test-id="device-wizard-devicecategoryform-option-label-firewall-device-category"]',
    );
    this.countryInput = page.locator(
      '[data-test-id="device-wizard-devicelocationform-select-address-country-input"]',
    );
    this.cityInput = page.locator(
      '[data-test-id="device-wizard-devicelocationform-select-address-city-input"]',
    );
    this.locationSaveButton = page.locator(
      '[data-test-id="device-wizard-device-location-form-save-form-button"]',
    );
    this.categorySaveButton = page.locator(
      '[data-test-id="device-wizard-device-category-form-save-form-button"]',
    );
    this.deviceNameInput = page.locator(
      '[data-test-id="device-wizard-devicetype-input-device-name"]',
    );
    this.deviceTypeInput = page.locator(
      '[data-test-id="device-wizard-devicetype-select-device-type-input"]',
    );
    this.deviceTypeSaveButton = page.locator(
      '[data-test-id="device-wizard-device-type-save-form-button"]',
    );
    this.step1CategorySummary = page
      .locator('p')
      .filter({ hasText: 'Category:' });
    this.step1LocationSummary = page
      .locator('p')
      .filter({ hasText: 'Location:' });
    this.step2DeviceNameSummary = page
      .locator('p')
      .filter({ hasText: 'Device Name:' });
    this.step2DeviceTypeSummary = page
      .locator('p')
      .filter({ hasText: 'Device Type:' });
    this.step3InstallationCodeSummary = page
      .locator('p')
      .filter({ hasText: 'Installation Code:' });
  }

  async selectFirstDropdownOption(): Promise<void> {
    const firstOption = this.page.getByRole('option').first();
    await firstOption.waitFor({ state: 'visible', timeout: 5000 });
    await firstOption.click();
  }

  async selectCountryOption(name: string): Promise<void> {
    await this.page.getByRole('option', { name, exact: true }).click();
  }

  async selectCityOption(city: string): Promise<void> {
    await this.page
      .locator(
        `[data-test-id="device-wizard-devicelocationform-select-address-city-option-${toTestIdSegment(city)}"]`,
      )
      .click();
  }

  async selectDeviceTypeOption(type: string): Promise<void> {
    await this.page
      .locator(
        `[data-test-id="device-wizard-devicetype-select-device-type-option-${toTestIdSegment(type)}"]`,
      )
      .click();
  }

  async saveCategoryAndWaitForSummary(category: string): Promise<void> {
    await this.categorySaveButton.click();
    await expect(this.step1CategorySummary).toContainText(category, {
      timeout: 10000,
    });
  }

  async saveLocationAndWaitForSummary(location: string): Promise<void> {
    await this.locationSaveButton.click();
    await expect(this.step1LocationSummary).toContainText(location, {
      timeout: 10000,
    });
  }

  async saveDeviceTypeAndWaitForSummary(
    deviceName: string,
    deviceType: string,
  ): Promise<void> {
    await this.deviceTypeSaveButton.click();
    await expect(this.step2DeviceNameSummary).toContainText(deviceName, {
      timeout: 10000,
    });
    await expect(this.step2DeviceTypeSummary).toContainText(deviceType, {
      timeout: 10000,
    });
  }
}
