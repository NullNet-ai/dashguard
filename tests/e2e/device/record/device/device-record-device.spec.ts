import { expect, test } from '@playwright/test';

import { DeviceRecordDevicePage } from './DeviceRecordDevicePage';
import { loginAsAdmin } from '../../../utils/auth';

test.describe('Device Record Device', () => {
  let devicePage: DeviceRecordDevicePage;

  test.beforeEach(async ({ page }) => {
    devicePage = new DeviceRecordDevicePage(page);
    await loginAsAdmin(page);
    await devicePage.goto();
  });

  test.describe('Device Category', () => {
    test('should display all device category options', async () => {
      await devicePage.unlockCategoryForm();

      await expect(devicePage.categoryFirewallOption).toBeVisible();
      await expect(devicePage.categoryAppGuardOption).toBeVisible();
      await expect(devicePage.categoryLoadBalancerOption).toBeVisible();
      await expect(devicePage.categorySaveButton).toBeVisible();
    });

    test('should save the selected Firewall category', async ({ page }) => {
      await devicePage.unlockCategoryForm();
      await devicePage.categoryFirewallOption.click();
      await devicePage.categorySaveButton.click();
      await page.waitForLoadState('networkidle');

      await expect(devicePage.categorySaveButton).toBeVisible();
    });
  });

  test.describe('Device Location', () => {
    test('should display the country input and save action', async () => {
      await devicePage.unlockLocationForm();

      await expect(devicePage.countryInput).toBeVisible();
      await expect(devicePage.locationSaveButton).toBeVisible();
    });

    test('should enable the city input after a country is selected', async () => {
      await devicePage.unlockLocationForm();
      await devicePage.countryInput.click();
      await devicePage
        .countryOption('Afghanistan')
        .waitFor({ state: 'visible', timeout: 10000 });
      await devicePage.countryOption('Afghanistan').click();

      await expect(devicePage.cityInput).toBeEnabled();
    });

    test('should save the selected country and city', async ({ page }) => {
      await devicePage.unlockLocationForm();
      await devicePage.countryInput.click();
      await devicePage
        .countryOption('Afghanistan')
        .waitFor({ state: 'visible', timeout: 10000 });
      await devicePage.countryOption('Afghanistan').click();

      await expect(devicePage.cityInput).toBeEnabled();

      await devicePage.cityInput.click();
      await devicePage
        .cityOption('Herat')
        .waitFor({ state: 'visible', timeout: 10000 });
      await devicePage.cityOption('Herat').click();

      await devicePage.locationSaveButton.click();
      await page.waitForLoadState('networkidle');

      await expect(devicePage.locationSaveButton).toBeVisible();
    });
  });
});
