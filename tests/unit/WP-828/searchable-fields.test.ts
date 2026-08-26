import { describe, expect, it } from 'vitest';

import contactColumns from '~/app/portal/contact/grid/_config/columns';
import deviceColumns from '~/app/portal/device/grid/_config/columns';
import { constructSearchableFields } from '~/components/platform/Grid/utils/constructSearchableFields';

// WP-828 regression guard.
//
// The live search emits ONE FLAT OR CHAIN built from constructSearchableFields.
// The Store validates every criteria in that chain, so a SINGLE criteria naming
// a field that is not on the queried entity (or is the wrong type) fails the
// WHOLE query and the grid returns zero rows for EVERY term — which is exactly
// what shipped:
//   contacts.roles              -> 400 Filter field 'roles' does not exist in entity 'contacts'
//   contacts.device_group_names -> 400 Filter field 'device_group_names' does not exist in entity 'contacts'
//   devices.is_device_online    -> 500 operator does not exist: boolean ~~* unknown
//
// These assertions fail the moment someone drops the `isSearchable: false`
// opt-out back off one of those columns.

const fieldKeys = (columns: unknown[], entity: string) =>
  constructSearchableFields({ columns: columns as never, entity }).map(
    (f) => f.field,
  );

describe('WP-828 searchable field construction', () => {
  describe('contact grid', () => {
    const fields = fieldKeys(contactColumns, 'contact');

    it('never emits a criteria for `roles` (assembled in JS, not a contacts column)', () => {
      expect(fields).not.toContain('roles');
    });

    it('never emits a criteria for `device_group_names` (assembled in JS, not a contacts column)', () => {
      expect(fields).not.toContain('device_group_names');
    });

    it('still searches the real contact columns', () => {
      expect(fields).toEqual(
        expect.arrayContaining(['code', 'first_name', 'last_name', 'status']),
      );
    });

    it('routes joined columns to their own entity, not to `contact`', () => {
      const searchable = constructSearchableFields({
        columns: contactColumns as never,
        entity: 'contact',
      });
      const phone = searchable.find(
        (f) => f.entity === 'contact_phone_numbers',
      );
      expect(phone, 'phone number must query contact_phone_numbers').toBeTruthy();
    });
  });

  describe('device grid', () => {
    const fields = fieldKeys(deviceColumns, 'device');

    it('never emits a `like` criteria for the BOOLEAN `is_device_online`', () => {
      expect(fields).not.toContain('is_device_online');
    });

    it('still searches the real device columns', () => {
      expect(fields).toEqual(
        expect.arrayContaining(['code', 'device_name', 'device_uuid']),
      );
    });
  });

  describe('every emitted criteria', () => {
    it('uses the `like` operator and names a field and an entity', () => {
      const all = [
        ...constructSearchableFields({
          columns: contactColumns as never,
          entity: 'contact',
        }),
        ...constructSearchableFields({
          columns: deviceColumns as never,
          entity: 'device',
        }),
      ];
      expect(all.length).toBeGreaterThan(0);
      for (const f of all) {
        expect(f.field, JSON.stringify(f)).toBeTruthy();
        expect(f.entity, JSON.stringify(f)).toBeTruthy();
        expect(f.operator, JSON.stringify(f)).toBe('like');
      }
    });
  });
});
