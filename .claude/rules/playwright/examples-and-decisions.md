# Playwright Examples And Decisions

## Ideal Test Structure

```ts
test.describe('Profile Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/settings/profile')
  })

  test('should update display name', async ({ page }) => {
    await page.getByLabel('Display Name').fill('John Doe')
    await page.getByRole('button', { name: 'Save' }).click()

    await expect(page.getByText('Profile updated')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.getByLabel('Display Name').clear()
    await page.getByRole('button', { name: 'Save' }).click()

    await expect(page.getByText('Display name is required')).toBeVisible()
  })
})
```

## When To Use A Spec File

Use spec files to separate:

- Features
- Domains
- Workflows
- Ownership boundaries

## When To Use `describe`

Use `describe` blocks to separate:

- Roles
- Scenarios
- States
- Environments
- Subfeatures
