import { expect, test } from '@playwright/test';

test.describe('WP-836 — Role Record Summary - Remove category badges and entity field', () => {
  test('role record should not display category badges', async ({ page }) => {
    // Navigate to a role record
    // This assumes there's a valid role with code available
    await page.goto('/portal/user_role/record/test-role-code/user_role');

    // Assert that the category badges container is NOT present
    const badgesContainer = page.locator('[data-test-id="rcrd-sum-details-categories"]');
    await expect(badgesContainer).not.toBeVisible();
  });

  test('role record summary should not display Entity field', async ({ page }) => {
    await page.goto('/portal/user_role/record/test-role-code/user_role');

    // Verify the "Entity" field label is completely absent from the summary
    const entityFieldLabel = page.getByText('Entity', { exact: true });
    // Check that Entity field is not in the summary card
    const summaryCard = page.locator('text=User Role Details').locator('..').first();
    const entityInSummary = summaryCard.locator('text=Entity');
    await expect(entityInSummary).not.toBeVisible();
  });

  test('role record summary should still display Role field', async ({ page }) => {
    await page.goto('/portal/user_role/record/test-role-code/user_role');

    // Verify that the Role field is still present in the summary
    const summaryCard = page.locator('text=User Role Details').locator('..').first();
    const roleField = summaryCard.locator('text=Role');
    await expect(roleField).toBeVisible();
  });

  test('RecordContactBadge component should not be rendered', async ({ page }) => {
    await page.goto('/portal/user_role/record/test-role-code/user_role');

    // Verify that the badges container with the specific test ID is not present
    const badgesElement = page.locator('[data-test-id="rcrd-sum-details-categories"]');
    await expect(badgesElement).toHaveCount(0);
  });
});
