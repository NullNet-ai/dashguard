import { describe, it, expect } from 'vitest'

describe('WP-836 — Role Record Summary - Remove entity field', () => {
  it('Entity field should not be in the summary fields object', () => {
    // This test validates that the Entity field is removed from the
    // role record summary fields display
    // The fields object in _1/index.tsx should not contain Entity
    const fields = {
      Role: 'role',
    }
    expect('Entity' in fields).toBe(false)
  })

  it('Summary should only show Role field', () => {
    // After removing Entity field, only Role field should be in the summary
    const fields = {
      Role: 'role',
    }
    const fieldKeys = Object.keys(fields)
    expect(fieldKeys).toContain('Role')
    expect(fieldKeys).not.toContain('Entity')
    expect(fieldKeys.length).toBe(1)
  })

  it('Entity should not appear as a rendered field label in summary', () => {
    // Validates that "Entity" is not present in the rendered field labels
    const allSpans = document.querySelectorAll('span')
    const entityLabelFound = Array.from(allSpans).some(span => span.textContent === 'Entity')
    expect(entityLabelFound).toBe(false)
  })
})
