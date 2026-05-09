import { expect, type Page } from '@playwright/test';

export async function expectModalSearchResults(
  page: Page,
  term: string,
  column: string,
): Promise<void> {
  await expect(page.getByText('No Results Found')).not.toBeVisible();

  const results = page.getByRole('option');
  await results.first().waitFor({ state: 'visible', timeout: 10000 });

  const count = await results.count();
  const normalizedTerm = term.toLowerCase();

  for (let i = 0; i < count; i++) {
    const text = (await results.nth(i).textContent()) ?? '';
    if (text.toLowerCase().includes(normalizedTerm) && text.includes(column)) {
      return;
    }
  }

  throw new Error(`No result contained term "${term}" and column "${column}"`);
}
