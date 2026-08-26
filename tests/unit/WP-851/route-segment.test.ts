import { describe, expect, it } from 'vitest';

import {
  mainEntities,
  routeEntities,
  toRouteSegment,
} from '~/middleware-alias-entities';

/**
 * WP-851 — Device Group grid row-click 404.
 *
 * The grid pushed the ORM entity (`device_group_settings`) into the URL PATH,
 * but `src/app/portal/` only has a `device_group` folder, so Next.js 404'd at
 * the route level. `toRouteSegment` converts ORM entity -> route segment.
 */
describe('toRouteSegment', () => {
  it('maps the aliased ORM entity back to its route segment', () => {
    // The whole point of the ticket: this must NOT be `device_group_settings`.
    expect(toRouteSegment('device_group_settings')).toBe('device_group');
  });

  it('builds a record URL that matches a real app-router folder', () => {
    const entity = 'device_group_settings'; // what config.entity holds
    const segment = toRouteSegment(entity);

    expect(`/portal/${segment}/record/DGS000013/${segment}`).toBe(
      '/portal/device_group/record/DGS000013/device_group',
    );
    // The broken URL from production must no longer be produced.
    expect(`/portal/${segment}/record/DGS000013/${segment}`).not.toContain(
      'device_group_settings',
    );
  });

  it('is the exact inverse of the route-segment -> entity map', () => {
    expect(routeEntities.device_group_settings).toBe('device_group');
    expect(mainEntities.device_group).toBe('device_group_settings');
    expect(toRouteSegment(mainEntities.device_group!)).toBe('device_group');
  });

  it('leaves non-aliased entities untouched', () => {
    for (const entity of ['device', 'organization', 'location', 'user_role']) {
      expect(toRouteSegment(entity)).toBe(entity);
    }
  });

  it('does NOT rewrite `contact` to the `student` sample alias', () => {
    // `mainEntities` carries a `student: 'contact'` sample, but there is no
    // `src/app/portal/student/` folder. A naively derived inverse map would
    // send every Contacts row to `/portal/student/...` -> 404. Guard that.
    expect(mainEntities.student).toBe('contact');
    expect(toRouteSegment('contact')).toBe('contact');
    expect(routeEntities.contact).toBeUndefined();
  });
});
