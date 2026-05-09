import { expect, test, type Page } from '@playwright/test';

import { RemoteAccessGridPage } from '../grid/RemoteAccessGridPage';
import { loginAsAdmin } from '../../utils/auth';
import {
  createRemoteAccessSession,
  createRemoteAccessSessionAndReturnToGrid,
  type RemoteAccessConnectionType,
} from '../../utils/remote-access';

type SessionScenario = {
  label: 'SSH' | 'TTY' | 'UI';
  connectionType: RemoteAccessConnectionType;
  expectedStatus: 'Idle' | 'Active';
  reconnectUrl: RegExp;
  opensTerminal: boolean;
};

const sessionScenarios: SessionScenario[] = [
  {
    label: 'SSH',
    connectionType: 'ssh',
    expectedStatus: 'Idle',
    reconnectUrl: /\/terminal/,
    opensTerminal: true,
  },
  {
    label: 'TTY',
    connectionType: 'tty',
    expectedStatus: 'Idle',
    reconnectUrl: /\/terminal/,
    opensTerminal: true,
  },
  {
    label: 'UI',
    connectionType: 'ui',
    expectedStatus: 'Active',
    reconnectUrl: /^https?:\/\//,
    opensTerminal: false,
  },
];

test.describe('Remote Access Side Drawer', () => {
  let gridPage: RemoteAccessGridPage;

  async function waitForGridRows(): Promise<void> {
    await gridPage.rows.first().waitFor({ state: 'visible', timeout: 15000 });
  }

  async function createSessionAndReopenGrid(
    page: Page,
    connectionType: RemoteAccessConnectionType,
  ): Promise<void> {
    await createRemoteAccessSessionAndReturnToGrid(page, gridPage, connectionType);
  }

  async function expectSessionDestinationPage(
    newPage: Page,
    scenario: SessionScenario,
    options?: { expectTerminalRows?: boolean },
  ): Promise<void> {
    await newPage.waitForLoadState('domcontentloaded');
    await expect(newPage).toHaveURL(scenario.reconnectUrl);
    if (scenario.opensTerminal) {
      await expect(newPage.locator('.xterm')).toBeVisible({ timeout: 15000 });
      if (options?.expectTerminalRows) {
        await expect(newPage.locator('.xterm-rows')).toBeVisible({
          timeout: 10000,
        });
      }
    }
  }

  async function expectReconnectOpensSessionDestination(
    page: Page,
    scenario: SessionScenario,
  ): Promise<void> {
    await createSessionAndReopenGrid(page, scenario.connectionType);
    const firstRow = gridPage.rows.first();
    await firstRow.hover();
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page', { timeout: 15000 }),
      gridPage.rowReconnectButton(firstRow).click(),
    ]);
    await expectSessionDestinationPage(newPage, scenario);
    await newPage.close();
  }

  async function expectDisconnectChangesStatus(
    page: Page,
    connectionType: RemoteAccessConnectionType,
  ): Promise<void> {
    await createSessionAndReopenGrid(page, connectionType);
    const firstRow = gridPage.rows.first();
    await firstRow.hover();
    await gridPage.rowDisconnectButton(firstRow).click();
    await page.waitForLoadState('networkidle');
    await expect(gridPage.rows.first().getByText('Terminated')).toBeVisible({
      timeout: 10000,
    });
  }

  async function expectConnectionTypeShowsServiceOptions(
    connectionType: RemoteAccessConnectionType,
  ): Promise<void> {
    await waitForGridRows();
    await gridPage.openCreateDrawer();
    await gridPage.selectFirstDropdownOption(gridPage.createFormDeviceInput);
    await gridPage.selectConnectionType(connectionType);
    await gridPage.selectFirstDropdownOption(gridPage.createFormServiceInput);
    await expect(gridPage.createFormServiceInput).not.toHaveValue('');
  }

  test.beforeEach(async ({ page }) => {
    gridPage = new RemoteAccessGridPage(page);
    await loginAsAdmin(page);
    await gridPage.goto();
  });

  test.afterEach(async () => {
    await gridPage.closeCreateDrawer();
  });

  test('should open the creation drawer from the New action', async () => {
    await waitForGridRows();
    await gridPage.openCreateDrawer();
    await expect(gridPage.createFormConnectionTypeInput).toBeVisible();
  });

  test('should display all required session fields', async () => {
    await waitForGridRows();
    await gridPage.openCreateDrawer();
    await expect(gridPage.createFormDeviceInput).toBeVisible();
    await expect(gridPage.createFormConnectionTypeInput).toBeVisible();
    await expect(gridPage.createFormServiceInput).toBeVisible();
  });

  test('should display validation errors when the form is submitted empty', async ({
    page,
  }) => {
    await waitForGridRows();
    await gridPage.openCreateDrawer();
    await gridPage.createFormSubmitButton.click();
    await expect(gridPage.deviceRequiredErrorMessage).toBeVisible({
      timeout: 5000,
    });
    await expect(gridPage.connectionTypeRequiredErrorMessage).toBeVisible({
      timeout: 5000,
    });
    await expect(gridPage.serviceRequiredErrorMessage).toBeVisible({
      timeout: 5000,
    });
  });

  for (const scenario of sessionScenarios) {
    test(`should display service options for the ${scenario.label} connection type`, async () => {
      await expectConnectionTypeShowsServiceOptions(scenario.connectionType);
    });
  }

  test.describe.serial('Destination launch after session creation', () => {
    for (const scenario of sessionScenarios) {
      test(`should create a ${scenario.label} session and open the expected destination`, async ({
        page,
      }) => {
        const newPage = await createRemoteAccessSession(
          page,
          gridPage,
          scenario.connectionType,
        );
        await expectSessionDestinationPage(newPage, scenario, {
          expectTerminalRows: true,
        });
        await newPage.close();
      });
    }
  });

  test.describe.serial('Session lifecycle', () => {
    for (const scenario of sessionScenarios) {
      test.describe.serial(`${scenario.label}`, () => {
        test.beforeEach(async () => {
          await waitForGridRows();
        });

        test(`should show a new ${scenario.label} session in the grid with ${scenario.expectedStatus} status`, async ({
          page,
        }) => {
          await createSessionAndReopenGrid(page, scenario.connectionType);
          const firstRow = gridPage.rows.first();
          await expect(firstRow.getByText(scenario.expectedStatus)).toBeVisible({
            timeout: 10000,
          });
        });

        test(`should enable reconnect and disconnect grid actions for an ${scenario.expectedStatus} ${scenario.label} session`, async ({
          page,
        }) => {
          await createSessionAndReopenGrid(page, scenario.connectionType);
          const firstRow = gridPage.rows.first();
          await firstRow.hover();
          await expect(gridPage.rowReconnectButton(firstRow)).not.toBeDisabled({
            timeout: 5000,
          });
          await expect(gridPage.rowDisconnectButton(firstRow)).not.toBeDisabled({
            timeout: 5000,
          });
        });

        test(`should reopen the correct destination in a new tab for a ${scenario.label} session`, async ({
          page,
        }) => {
          await expectReconnectOpensSessionDestination(page, scenario);
        });

        test(`should change a ${scenario.label} session to Terminated after disconnecting`, async ({
          page,
        }) => {
          await expectDisconnectChangesStatus(page, scenario.connectionType);
        });
      });
    }
  });
});
