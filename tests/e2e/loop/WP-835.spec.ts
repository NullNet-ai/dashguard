import { expect, test } from '@playwright/test';

test.describe('WP-835 — Role Record > Role - Remove Category Details', () => {
  test('role record should not display category details form', async ({ page }) => {
    // Navigate to a role record
    // This assumes there's a valid role with code available
    // In actual execution, this will be seeded or fetched from test data
    await page.goto('/portal/user_role/record/test-role-code/user_role');

    // Assert that CategoryDetails form (with Entity and Category fields) is NOT present
    await expect(page.getByLabel('Entity')).not.toBeVisible();
    await expect(page.getByLabel('Category')).not.toBeVisible();
  });

  test('role record should not have "Category Details" form label', async ({ page }) => {
    await page.goto('/portal/user_role/record/test-role-code/user_role');

    // Verify the form label "Category Details" is completely absent
    const categoryDetailsLabel = page.getByText('Category Details', { exact: true });
    await expect(categoryDetailsLabel).toHaveCount(0);
  });

  test('role record should still display tags (confirmation details)', async ({ page }) => {
    await page.goto('/portal/user_role/record/test-role-code/user_role');

    // Verify that ConfirmationDetails (Tags form) is still present
    // Tags should still be functional even after CategoryDetails removal
    const tagsFormLabel = page.getByText('Tags', { exact: true });
    await expect(tagsFormLabel).toBeVisible();
  });

  test('role record category_details slot should not contain entity/category selects', async ({ page }) => {
    await page.goto('/portal/user_role/record/test-role-code/user_role');

    // Check that the category_details parallel route slot
    // does not render the category-related form fields
    const selectElements = page.locator('select[name="entity"], select[name="categories"]');
    await expect(selectElements).toHaveCount(0);
  });
});
