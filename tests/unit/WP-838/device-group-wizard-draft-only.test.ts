import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

// WP-838 — Device Group Wizard > Step 1 > Basic Details: "Show Grid" must list
// ONLY Draft records.
//
// Requirement is INFERRED from sibling ticket WP-837 (Role Wizard, identical
// wording), which the owner clarified as: "when clicking 'Show Grid', the list
// of items, filter show Draft only."
//
// Why a code change is needed even though `statusesIncluded: ['Draft']` is
// already present: that config only DISABLES selection of non-Draft rows
// (src/components/platform/Grid/hooks/actionColumns.tsx:110-114 and
// FormFilter/List.tsx:396). The rows are still fetched and rendered. Filtering
// the list itself requires a default advance filter on `status`, which is fed
// into the grid query through
// searchConfig.query_params.default_advance_filters
// (FormFilter/List.tsx:148-211 -> useFetchGridData -> api.grid.items).
//
// Reference implementation of the same pattern (reused verbatim, not invented):
//   src/app/portal/contact/_components/form-filter/basic-details/client.tsx:25-36,86-107
//   src/app/portal/timeline/_components/form-filter/basic-details/client.tsx:24-35
//   src/app/portal/organization/grid/_config/advanceFilter.ts:4-15

const ROOT = path.join(__dirname, '../../..')

const DEVICE_GROUP_CLIENT = path.join(
  ROOT,
  'src/app/portal/(settings)/device_group/_components/form-filter/basic-details/client.tsx',
)
const DEVICE_GROUP_GRID_PAGE = path.join(
  ROOT,
  'src/app/portal/(settings)/device_group/grid/page.tsx',
)

const read = (file: string) => fs.readFileSync(file, 'utf-8')

/** Collapse whitespace so multi-line object literals can be matched simply. */
const flat = (source: string) => source.replace(/\s+/g, ' ')

describe('WP-838 — Device Group wizard step 1 "Show Grid" is Draft-only', () => {
  it('declares a default advance filter on status', () => {
    const source = flat(read(DEVICE_GROUP_CLIENT))
    expect(source).toMatch(/field:\s*'status'/)
  })

  it("scopes that status filter to the 'device_group_settings' entity", () => {
    const source = flat(read(DEVICE_GROUP_CLIENT))
    // The advance-filter object must name the same entity the grid queries.
    expect(source).toMatch(
      /entity:\s*'device_group_settings',\s*operator:\s*'equal',\s*type:\s*'criteria',\s*field:\s*'status'/,
    )
  })

  it("filters on exactly ['Draft'] — no Active/Archived leakage", () => {
    const source = flat(read(DEVICE_GROUP_CLIENT))
    expect(source).toMatch(/values:\s*\['Draft'\]/)
    expect(source).not.toMatch(/values:\s*\[\s*'Active'/)
  })

  it('wires the filter into the grid query via searchConfig.query_params.default_advance_filters', () => {
    const source = flat(read(DEVICE_GROUP_CLIENT))
    expect(source).toMatch(/searchConfig:\s*\{/)
    expect(source).toMatch(/query_params:\s*\{/)
    expect(source).toMatch(/default_advance_filters:/)
  })

  it('generates a stable filter id with ulid, like the reference implementations', () => {
    const source = read(DEVICE_GROUP_CLIENT)
    expect(source).toMatch(/from\s*'ulid'/)
    expect(flat(source)).toMatch(/id:\s*ulid\(\)/)
  })

  it("keeps statusesIncluded: ['Draft'] so selection stays restricted too", () => {
    const source = flat(read(DEVICE_GROUP_CLIENT))
    expect(source).toMatch(/statusesIncluded:\s*\['Draft'\]/)
  })

  it('still renders the Basic Details form with the name field intact', () => {
    const source = flat(read(DEVICE_GROUP_CLIENT))
    expect(source).toMatch(/formLabel="Basic Details"/)
    expect(source).toMatch(/formKey="BasicDetails"/)
    expect(source).toMatch(/filter_entity:\s*'device_group_settings'/)
    expect(source).toMatch(/name:\s*'name'/)
  })

  it('does NOT add a status filter to the main Device Group grid page', () => {
    // Scope guard: only the wizard step-1 form-filter grid changes.
    const source = flat(read(DEVICE_GROUP_GRID_PAGE))
    expect(source).not.toMatch(/default_advance_filters/)
    expect(source).not.toMatch(/field:\s*'status'/)
  })

  it('does NOT touch the user_role wizard (WP-837/WP-839 own those files)', () => {
    const userRoleClient = read(
      path.join(
        ROOT,
        'src/app/portal/(settings)/user_role/_components/form-filter/basic-details/client.tsx',
      ),
    )
    // user_role is planned in parallel; this ticket must leave it untouched.
    expect(flat(userRoleClient)).toMatch(/filter_entity:\s*'user_role'/)
  })
})
