import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

// WP-837 — Role Wizard > Step 1 (Basic Details) > "Show Grid" must list Draft
// records ONLY. The list is the FormBuilder form-filter sub-grid, which fetches
// via `grid.items` using `filterGridConfig.searchConfig.query_params
// .default_advance_filters` (see
// src/components/platform/FormBuilder/components/custom/FormFilter/List.tsx).
// So the assertion belongs on that advance-filter config.
import {
  defaultAdvanceFilter,
  draftOnlySearchConfig,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
} from '../../../src/app/portal/(settings)/user_role/_components/form-filter/basic-details/_config/advanceFilter';

const REPO_ROOT = path.resolve(__dirname, '../../..');
const USER_ROLE_CLIENT = path.join(
  REPO_ROOT,
  'src/app/portal/(settings)/user_role/_components/form-filter/basic-details/client.tsx',
);
const CONTACT_CLIENT = path.join(
  REPO_ROOT,
  'src/app/portal/contact/_components/form-filter/basic-details/client.tsx',
);

const NON_DRAFT_STATUSES = ['Active', 'active', 'Archived', 'archived', 'Inactive'];

const criteria = (filters: any[]) =>
  (filters ?? []).filter((f) => f?.type === 'criteria');

describe('WP-837: Role Wizard Step 1 "Show Grid" — Draft only', () => {
  it('exposes a default advance filter for the role form-filter grid', () => {
    expect(Array.isArray(defaultAdvanceFilter)).toBe(true);
    expect(criteria(defaultAdvanceFilter as any[]).length).toBeGreaterThan(0);
  });

  it('filters on the status field of the user_roles entity', () => {
    for (const f of criteria(defaultAdvanceFilter as any[])) {
      expect(f.field, 'advance filter must target `status`').toBe('status');
      expect(f.entity, 'advance filter entity must be `user_roles`').toBe(
        'user_roles',
      );
      expect(f.operator).toBe('equal');
    }
  });

  it('restricts the list to Draft and nothing else', () => {
    const values = criteria(defaultAdvanceFilter as any[]).flatMap(
      (f) => (f.values as string[]) ?? [],
    );
    expect(values, 'Draft must be included').toContain('Draft');
    for (const status of NON_DRAFT_STATUSES) {
      expect(
        values,
        `non-Draft status "${status}" must NOT be selectable in the list`,
      ).not.toContain(status);
    }
    expect(new Set(values).size, 'exactly one status may be filtered').toBe(1);
  });

  it('wires the Draft filter into a searchConfig the FormFilter List consumes', () => {
    const config: any = draftOnlySearchConfig(['id', 'code', 'role', 'status']);
    expect(config?.query_params?.entity).toBe('user_role');
    expect(config?.query_params?.pluck).toContain('status');
    expect(config?.query_params?.default_advance_filters).toEqual(
      defaultAdvanceFilter,
    );
    // Single criteria only: List.tsx appends a trailing `and` operator when
    // default_advance_filters.length > 1, which would produce a malformed query.
    expect(config?.query_params?.default_advance_filters).toHaveLength(1);
  });

  it('role basic-details client.tsx passes that searchConfig to filterGridConfig', () => {
    const src = fs.readFileSync(USER_ROLE_CLIENT, 'utf8');
    expect(src).toMatch(/from ['"]\.\/_config\/advanceFilter['"]/);
    expect(src).toMatch(/searchConfig:\s*draftOnlySearchConfig\(/);
    // Existing selectable-status behaviour must survive untouched.
    expect(src).toMatch(/statusesIncluded:\s*\['Draft'\]/);
  });

  it('does not change any other entity form-filter grid (contact stays Active+Draft)', () => {
    const src = fs.readFileSync(CONTACT_CLIENT, 'utf8');
    expect(src).toMatch(/values:\s*\['Active',\s*'Draft'\]/);
  });
});
