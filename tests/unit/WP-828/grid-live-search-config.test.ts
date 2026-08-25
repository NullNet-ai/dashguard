import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

// WP-828 — scope guard + wiring guard.
//
// "Apply on mentioned entities" (Jira comment 14339) means exactly four grids:
// User = contact, Device = device, Role = user_role, Device Group =
// device_group_settings (the last two confirmed on WP-832 / WP-830). Every
// OTHER grid in the portal — around twenty of them — must keep the default
// modal search untouched, so the opt-in has to be an explicit per-grid config
// flag that defaults to the current behaviour.
//
// These are file-level assertions on purpose: the four grid pages are RSC/client
// page components with heavy `~/trpc/server` and `next/headers` imports that
// cannot be imported into jsdom, and the thing under test is a config literal.
// Same approach as tests/unit/WP-837/draft-only-filter.test.ts.
//
// RED until `searchMode` is declared on IConfigGrid and set on the four grids.

const REPO_ROOT = path.resolve(__dirname, '../../..');
const read = (rel: string) => fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');

const GRID_TYPES = 'src/components/platform/Grid/types.ts';

const IN_SCOPE: { label: string; file: string; entity: string }[] = [
  {
    label: 'User (contact)',
    file: 'src/app/portal/contact/grid/page.tsx',
    entity: 'contact',
  },
  {
    label: 'Device',
    file: 'src/app/portal/device/grid/page.tsx',
    entity: 'device',
  },
  {
    label: 'Role (user_role)',
    file: 'src/app/portal/(settings)/user_role/grid/page.tsx',
    entity: 'user_role',
  },
  {
    label: 'Device Group (device_group_settings)',
    file: 'src/app/portal/(settings)/device_group/grid/page.tsx',
    entity: 'device_group_settings',
  },
];

// A representative sample of grids that are explicitly NOT in scope.
const OUT_OF_SCOPE = [
  'src/app/portal/organization/grid/page.tsx',
  'src/app/portal/location/grid/page.tsx',
  'src/app/portal/account_organization/grid/page.tsx',
  'src/app/portal/device_remote_access_session/grid/page.tsx',
  'src/app/portal/timeline/grid/page.tsx',
  'src/app/portal/(settings)/communication_template/grid/page.tsx',
];

describe('WP-828: live search is an opt-in grid config', () => {
  it('declares a searchMode option on the shared grid config type', () => {
    const types = read(GRID_TYPES);
    expect(
      types,
      'IConfigGrid must expose searchMode so a grid can override the default search',
    ).toMatch(/searchMode\??:/);
    expect(types).toMatch(/'live'/);
  });

  it('keeps enableSearch as the separate full-hide escape hatch', () => {
    // searchMode replaces the search UI; enableSearch removes it entirely.
    // Conflating them would silently un-hide search on grids that opted out.
    expect(read(GRID_TYPES)).toMatch(/enableSearch\??:\s*boolean/);
  });

  it('ships a shared LiveSearch component rather than four copies', () => {
    const p = path.join(
      REPO_ROOT,
      'src/components/platform/Grid/Search/LiveSearch.tsx',
    );
    expect(
      fs.existsSync(p),
      'expected src/components/platform/Grid/Search/LiveSearch.tsx',
    ).toBe(true);
  });

  it('renders LiveSearch instead of SearchDialog when searchMode is live', () => {
    // The swap must happen inside the shared Search barrel, so no grid page
    // has to know about SearchDialog at all.
    const barrel = read('src/components/platform/Grid/Search/index.tsx');
    const list = read('src/components/platform/Grid/Search/SearchList.tsx');
    const combined = `${barrel}\n${list}`;
    expect(combined).toMatch(/LiveSearch/);
    expect(combined).toMatch(/searchMode/);
  });
});

describe('WP-828: exactly the four ticketed grids opt in', () => {
  for (const { label, file, entity } of IN_SCOPE) {
    it(`${label} grid sets searchMode: 'live'`, () => {
      const src = read(file);
      expect(src).toMatch(/searchMode:\s*'live'/);
    });

    it(`${label} grid keeps its registered entity name (${entity})`, () => {
      // Store-rejected entity => HTTP 200 + empty array for the whole query.
      // 'contacts' and 'device_group' (for this grid) are the known traps.
      const src = read(file);
      // The Role and Device grids read their entity from the middleware
      // `x-main-entity` header (`main_entity`) rather than hardcoding it, so
      // accept either form — what must not appear is a wrong literal.
      expect(
        src.includes(entity) || /main_entity/.test(src),
        'grid must resolve its entity from a registered name or main_entity',
      ).toBe(true);
      if (entity === 'contact') {
        expect(src, "the contact grid must not switch to 'contacts'").not.toMatch(
          /entity:\s*'contacts'/,
        );
      }
      if (entity === 'device_group_settings') {
        expect(
          src,
          "the device group grid must not switch to 'device_group'",
        ).not.toMatch(/entity:\s*'device_group'/);
      }
    });
  }

  for (const file of OUT_OF_SCOPE) {
    it(`${file} is left on the default search`, () => {
      expect(read(file)).not.toMatch(/searchMode:\s*'live'/);
    });
  }
});
