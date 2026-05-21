import { expect, test } from '@playwright/test';

import { DeviceGridPage } from '../grid/DeviceGridPage';
import { DeviceWizardPage } from './DeviceWizardPage';
import { loginAsAdmin } from '../../utils/auth';

test.describe('Device Wizard', () => {
  let deviceGridPage: DeviceGridPage;

  async function waitForGridRows(): Promise<void> {
    await deviceGridPage.rows.first().waitFor({ state: 'visible', timeout: 15000 });
  }

  test.beforeEach(async ({ page }) => {
    deviceGridPage = new DeviceGridPage(page);
    await loginAsAdmin(page);
    await deviceGridPage.goto();
    await waitForGridRows();
  });

  test('should create a draft Firewall PFSense device through wizard steps 1 to 3', async ({
    page,
  }) => {
    const wizardPage = new DeviceWizardPage(page);

    await deviceGridPage.createButton.click();
    await expect(page).toHaveURL(/\/portal\/device\/wizard\/.+\/1/, {
      timeout: 15000,
    });

    // Step 1: Category — Firewall (fill & save first)
    await wizardPage.categoryFirewallLabel.click();
    await wizardPage.saveCategoryAndWaitForSummary('Firewall');

    // Step 1: Location — Afghanistan / Herat (fill & save second)
    await wizardPage.countryInput.click();
    await wizardPage.selectCountryOption('Afghanistan');
    await wizardPage.cityInput.waitFor({ state: 'visible', timeout: 5000 });
    await wizardPage.cityInput.click();
    await wizardPage.selectCityOption('Herat');
    await wizardPage.saveLocationAndWaitForSummary('Herat');

    await wizardPage.nextButton.click();
    await expect(page).toHaveURL(/\/portal\/device\/wizard\/.+\/2/, {
      timeout: 15000,
    });

    // Step 2: Device Details — name + PFSense type
    await wizardPage.deviceNameInput.fill('E2E Firewall PFSense');
    await wizardPage.deviceTypeInput.click();
    await wizardPage.selectDeviceTypeOption('PFSense');
    await wizardPage.saveDeviceTypeAndWaitForSummary(
      'E2E Firewall PFSense',
      'PFSense',
    );

    await wizardPage.nextButton.click();
    await expect(page).toHaveURL(/\/portal\/device\/wizard\/.+\/3/, {
      timeout: 15000,
    });

    // Verify Step 3 summary shows a real Installation Code (not "None")
    await expect(wizardPage.step3InstallationCodeSummary).not.toContainText(
      'None',
      { timeout: 10000 },
    );

    // Step 3: Setup Details (read-only) — verify it loaded
    await expect(wizardPage.nextButton).toBeVisible({ timeout: 10000 });
  });
});
