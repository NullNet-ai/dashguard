import { type Page } from '@playwright/test';

import { type RemoteAccessGridPage } from '../remote-access/grid/RemoteAccessGridPage';

export type RemoteAccessConnectionType = 'ssh' | 'tty' | 'ui';

export async function createRemoteAccessSession(
  page: Page,
  gridPage: RemoteAccessGridPage,
  connectionType: RemoteAccessConnectionType,
): Promise<Page> {
  await gridPage.openCreateDrawer();
  await gridPage.selectFirstDropdownOption(gridPage.createFormDeviceInput);
  await gridPage.selectConnectionType(connectionType);
  await gridPage.selectFirstDropdownOption(gridPage.createFormServiceInput);

  const [newPage] = await Promise.all([
    page.context().waitForEvent('page', { timeout: 15000 }),
    gridPage.createFormSubmitButton.click(),
  ]);

  await newPage.waitForLoadState('domcontentloaded');
  return newPage;
}

export async function createRemoteAccessSessionAndReturnToGrid(
  page: Page,
  gridPage: RemoteAccessGridPage,
  connectionType: RemoteAccessConnectionType,
): Promise<void> {
  const newPage = await createRemoteAccessSession(page, gridPage, connectionType);
  await newPage.close();
  await gridPage.goto();
  await gridPage.resetSort();
  await gridPage.resetGrouping();
  await gridPage.rows.first().waitFor({ state: 'visible', timeout: 15000 });
}
