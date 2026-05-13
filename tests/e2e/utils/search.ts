import { expect, type Page } from '@playwright/test';

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

export async function expectModalSearchResults(
  page: Page,
  term: string,
  column: string,
): Promise<void> {
  const searchInput = page.locator('[data-test-id$="-search-input"]:visible').last();
  const resultsList = searchInput.locator(
    'xpath=ancestor::div[1]/following-sibling::*[@role="listbox"][1]',
  );
  const noResults = resultsList.getByText('No Results Found');
  const results = resultsList.getByRole('option');

  await expect(searchInput).toBeVisible();
  await expect(resultsList).toBeVisible();
  await expect
    .poll(
      async () => {
        if (await noResults.isVisible()) {
          return 'no-results';
        }

        if ((await results.count()) > 0 && (await results.first().isVisible())) {
          return 'results';
        }

        return 'pending';
      },
      {
        message: `Timed out waiting for search results for "${term}" in "${column}"`,
        timeout: 10000,
      },
    )
    .not.toBe('pending');

  if (await noResults.isVisible()) {
    throw new Error(`Search returned no results for term "${term}"`);
  }

  const count = await results.count();
  const normalizedTerm = normalizeText(term);
  const normalizedColumn = normalizeText(column);
  const renderedResults: string[] = [];

  for (let i = 0; i < count; i++) {
    const text = normalizeText((await results.nth(i).textContent()) ?? '');
    renderedResults.push(text);

    if (text.includes(normalizedTerm) && text.includes(normalizedColumn)) {
      return;
    }
  }

  throw new Error(
    `No rendered search result contained term "${term}" and column "${column}". Rendered results: ${renderedResults.join(' | ')}`,
  );
}
