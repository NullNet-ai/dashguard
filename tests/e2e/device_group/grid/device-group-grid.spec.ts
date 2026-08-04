import { expect, test } from '@playwright/test';

import { DeviceGroupGridPage } from './DeviceGroupGridPage';
import { loginAsAdmin } from '../../utils/auth';

test.describe('Device Group Grid', () => {
  let gridPage: DeviceGroupGridPage;

  test.beforeEach(async ({ page }) => {
    gridPage = new DeviceGroupGridPage(page);
    await loginAsAdmin(page);
    await gridPage.goto();
  });

  test('should display the table body', async () => {
    await expect(gridPage.tableBody).toBeVisible({ timeout: 10000 });
  });

  test('should display the Name column header', async () => {
    await expect(gridPage.nameColumnHeader).toBeVisible({ timeout: 10000 });
  });

  test('should display the create button', async () => {
    await expect(gridPage.createButton).toBeVisible();
  });
});
