import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

// WP-845 — Login: change heading label from "Login" to "Sign in to your account".
// This intentionally reverses WP-844 (commit 0af86ac8), which had changed the
// same two headings from "Sign in to your account" to "Login".
//
// Scope note: the ONLY strings in scope are the <h2> headings on the two login
// pages. The browser tab title (src/app/layout.tsx -> 'Appguard.ai'), the
// submit button label ("Sign in", loginForm.tsx:148) and the sign-up page's
// "Sign in" link (SignInLabel.tsx:19) are deliberately NOT touched.
const EXPECTED = 'Sign in to your account'

const PAGES = [
  {
    name: 'src/app/login/page.tsx',
    file: path.join(__dirname, '../../../src/app/login/page.tsx'),
  },
  {
    name: 'src/app/login/[account_id]/page.tsx',
    file: path.join(__dirname, '../../../src/app/login/[account_id]/page.tsx'),
  },
]

/** Text content of the first <h2>...</h2> in the file, whitespace-collapsed. */
function firstH2Text(source: string): string | null {
  const match = /<h2\b[^>]*>([\s\S]*?)<\/h2>/.exec(source)
  if (!match?.[1]) return null
  return match[1].replace(/\s+/g, ' ').trim()
}

describe('WP-845 — login page heading copy', () => {
  for (const page of PAGES) {
    describe(page.name, () => {
      it(`renders the heading exactly "${EXPECTED}"`, () => {
        const source = fs.readFileSync(page.file, 'utf-8')
        expect(firstH2Text(source)).toBe(EXPECTED)
      })

      it('no longer renders the old "Login" heading', () => {
        const source = fs.readFileSync(page.file, 'utf-8')
        expect(firstH2Text(source)).not.toBe('Login')
      })

      it('does not misspell the copy as "Sign in to you account"', () => {
        const source = fs.readFileSync(page.file, 'utf-8')
        expect(source).not.toMatch(/Sign in to you account/)
      })

      it('leaves the rest of the page intact (logo + LoginForm still rendered)', () => {
        const source = fs.readFileSync(page.file, 'utf-8')
        expect(source).toMatch(/appguard-logo\.png/)
        expect(source).toMatch(/<LoginForm\b/)
      })
    })
  }

  it('leaves the browser tab title untouched', () => {
    const layout = fs.readFileSync(
      path.join(__dirname, '../../../src/app/layout.tsx'),
      'utf-8',
    )
    expect(layout).toMatch(/title: 'Appguard\.ai'/)
  })

  it('leaves the login form submit button label as "Sign in"', () => {
    const form = fs.readFileSync(
      path.join(__dirname, '../../../src/app/login/_components/loginForm.tsx'),
      'utf-8',
    )
    expect(form).toMatch(/Sign in\s*$/m)
  })

  it('retires the stale WP-844 spec that asserts the old "Login" heading', () => {
    const stale = path.join(__dirname, '../../../tests/e2e/loop/WP-844.spec.ts')
    expect(fs.existsSync(stale)).toBe(false)
  })
})
