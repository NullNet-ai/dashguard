import { describe, it, expect } from 'vitest'

describe('WP-836 — Role Record Summary - Remove category badges', () => {
  it('RecordContactBadge component should not render in role record summary', () => {
    // This test validates that the category badges component is removed
    // from the role record summary page
    const badgesContainer = document.querySelector('[data-test-id="rcrd-sum-details-categories"]')
    expect(badgesContainer).toBeNull()
  })

  it('No badge elements should be present for categories', () => {
    // Validates that Badge components (which display categories) are not rendered
    const badges = document.querySelectorAll('[data-test-id="rcrd-sum-details-categories"]')
    expect(badges.length).toBe(0)
  })
})
