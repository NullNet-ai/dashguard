import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('WP-835 — Role Record > Role - Remove Category Details', () => {
  const pageFilePath = path.join(
    __dirname,
    '../../../src/app/portal/(settings)/user_role/record/[code]/(record)/user_role/@category_details/page.tsx'
  )

  it('page.tsx should not import CategoryDetails component', () => {
    const content = fs.readFileSync(pageFilePath, 'utf-8')
    // CategoryDetails should NOT be imported
    expect(content).not.toMatch(/CategoryDetails/)
  })

  it('page.tsx should not contain CategoryDetails JSX element', () => {
    const content = fs.readFileSync(pageFilePath, 'utf-8')
    // CategoryDetails JSX should NOT be present
    expect(content).not.toMatch(/<CategoryDetails\s*\/?>/)
  })

  it('page.tsx should still import ConfirmationDetails component', () => {
    const content = fs.readFileSync(pageFilePath, 'utf-8')
    // ConfirmationDetails should still be imported
    expect(content).toMatch(/ConfirmationDetails/)
  })

  it('page.tsx should still contain ConfirmationDetails JSX element', () => {
    const content = fs.readFileSync(pageFilePath, 'utf-8')
    // ConfirmationDetails JSX should still be present
    expect(content).toMatch(/<ConfirmationDetails\s*\/?>/)
  })

  it('page.tsx should not have entity or category form fields', () => {
    const content = fs.readFileSync(pageFilePath, 'utf-8')
    // Entity field selector should not be present
    expect(content).not.toMatch(/name=["']entity["']/)
    // Category field selector should not be present
    expect(content).not.toMatch(/name=["']categories?["']/)
  })
})
