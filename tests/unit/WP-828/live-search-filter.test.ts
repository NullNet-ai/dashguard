import { describe, expect, it } from 'vitest';

// WP-828 — "Custom Search (Hide/replace/override default) / Search live /
// Apply on mentioned entities". Owner picked option A (Jira comment 14345):
// on the User (contact), Device, Role (user_role) and Device Group
// (device_group_settings) grids, HIDE the default search and swap in a custom
// LIVE one. Each grid still searches only its own entity.
//
// The default today is NOT live: SearchDialog.tsx renders a "Search" button ->
// modal -> 500ms debounce -> `search.*Search` suggestion mutation -> a list of
// field/value suggestion pills -> click one -> handleAddSearchItem() pushes an
// advance filter -> grid refetches. Two clicks and two round trips before any
// row moves.
//
// The live replacement needs no new tRPC procedure: every one of the four grids
// already fetches through a resolver that accepts `advance_filters`
// (device -> device.mainGrid, contact -> contact.mainGrid,
// user_role -> grid.items, device_group -> deviceGroup.mainGrid). So the whole
// server-side of this ticket is "produce the right advance_filters", which is a
// pure function — and that is what this file pins down.
//
// The shape it must produce is the one GridSearchProvider already builds inline
// at src/components/platform/Grid/Search/Provider.tsx:76-105, extracted so it
// can be tested and reused. Two hard ORM constraints are encoded here:
//   * there is NO `IN` operator — multi-field match must be an OR chain of
//     `like` criteria interleaved with explicit {type:'operator'} entries;
//   * a field the Store rejects empties the WHOLE query with HTTP 200 + [], so
//     the chain may only ever be built from column-derived searchableFields
//     (constructSearchableFields.ts), never from free-form input.
//
// RED until src/components/platform/Grid/Search/utils/buildLiveSearchFilters.ts
// exists.
import { buildLiveSearchFilters } from '../../../src/components/platform/Grid/Search/utils/buildLiveSearchFilters';

const field = (f: string, extra: Record<string, unknown> = {}) => ({
  accessorKey: f,
  field: f,
  label: f,
  entity: 'devices',
  operator: 'like',
  ...extra,
});

const criteria = (items: any[]) =>
  items.filter((i) => i?.type === 'criteria');
const operators = (items: any[]) =>
  items.filter((i) => i?.type === 'operator');

describe('WP-828: buildLiveSearchFilters', () => {
  it('returns no filters for an empty query, so the grid stays unfiltered', () => {
    // Clearing the box must restore the full grid, never leave a `like ''`
    // criteria behind that could match nothing.
    for (const query of ['', '   ', '\t']) {
      expect(
        buildLiveSearchFilters({
          query,
          searchableFields: [field('name')],
          entity: 'devices',
        }),
        `query ${JSON.stringify(query)} must produce no filters`,
      ).toEqual([]);
    }
  });

  it('returns no filters when the grid exposes no searchable fields', () => {
    // Never invent a field name: an unknown field silently zeroes the whole
    // query at the Store.
    expect(
      buildLiveSearchFilters({
        query: 'abc',
        searchableFields: [],
        entity: 'devices',
      }),
    ).toEqual([]);
  });

  it('builds a single `like` criteria for a one-field grid', () => {
    const out = buildLiveSearchFilters({
      query: 'router-01',
      searchableFields: [field('name')],
      entity: 'devices',
    });

    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      type: 'criteria',
      operator: 'like',
      field: 'name',
      entity: 'devices',
      values: ['router-01'],
      is_search: true,
    });
  });

  it('OR-chains multiple fields — no `IN` operator, explicit operator entries', () => {
    const out = buildLiveSearchFilters({
      query: 'acme',
      searchableFields: [field('name'), field('code'), field('status')],
      entity: 'devices',
    });

    // 3 criteria + 2 interleaved operators.
    expect(criteria(out)).toHaveLength(3);
    expect(operators(out)).toHaveLength(2);
    expect(out).toHaveLength(5);

    for (const op of operators(out)) {
      expect(op.operator, 'fields must be OR-ed, not AND-ed').toBe('or');
    }
    // No leading or trailing operator — a dangling operator is a malformed
    // query tail (same failure WP-837 hit with default_advance_filters).
    expect(out[0]?.type).toBe('criteria');
    expect(out[out.length - 1]?.type).toBe('criteria');
    // Strictly alternating.
    out.forEach((item: any, i: number) => {
      expect(item.type).toBe(i % 2 === 0 ? 'criteria' : 'operator');
    });
    // And nothing anywhere claims an `in` operator, which the ORM lacks.
    for (const item of out) {
      expect(String((item as any).operator).toLowerCase()).not.toBe('in');
    }
  });

  it('applies the same query value to every field', () => {
    const out = buildLiveSearchFilters({
      query: 'acme',
      searchableFields: [field('name'), field('code')],
      entity: 'devices',
    });
    for (const c of criteria(out)) {
      expect(c.values).toEqual(['acme']);
    }
  });

  it('strips non-digits for raw_phone_number, matching the existing provider', () => {
    // src/components/platform/Grid/Search/Provider.tsx:79-82 already does this;
    // the contact grid is in scope for WP-828 so it must survive extraction.
    const out = buildLiveSearchFilters({
      query: '(415) 555-0142',
      searchableFields: [field('raw_phone_number', { entity: 'contact' })],
      entity: 'contact',
    });
    expect(criteria(out)[0]?.values).toEqual(['4155550142']);
  });

  it("uses the field's own entity when it has one, else the grid entity", () => {
    const out = buildLiveSearchFilters({
      query: 'x',
      searchableFields: [
        field('name', { entity: undefined }),
        field('full_name', { entity: 'contacts' }),
      ],
      entity: 'device_group_settings',
    });
    const [first, second] = criteria(out);
    expect(first?.entity).toBe('device_group_settings');
    expect(second?.entity).toBe('contacts');
  });

  it('carries the column label through so the grid can render the pill', () => {
    const out = buildLiveSearchFilters({
      query: 'x',
      searchableFields: [field('name', { label: 'Device Name' })],
      entity: 'devices',
    });
    expect(criteria(out)[0]?.label).toBe('Device Name');
  });

  it('never emits group_advance_filters-style nested filters', () => {
    // View.tsx:65-84 splices an array into `filters` when group_advance_filters
    // is present, producing a malformed group. Live search must stay flat.
    const out = buildLiveSearchFilters({
      query: 'x',
      searchableFields: [field('name'), field('code')],
      entity: 'devices',
    });
    for (const item of out) {
      expect((item as any).filters).toBeUndefined();
    }
  });
});
