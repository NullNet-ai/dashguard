/**
 * ROUTE SEGMENT -> ORM ENTITY.
 *
 * Keys are the `[entity]` segment that appears in a `/portal/<segment>/...`
 * URL (i.e. a real folder under `src/app/portal/`). Values are the entity name
 * the ORM / tRPC layer expects. Consumed by `src/proxy.ts` to set
 * `x-main-entity`.
 */
export const mainEntities: Record<string, string> = {
  student: 'contact', // sample
  device_group: 'device_group_settings',
};

/**
 * ORM ENTITY -> ROUTE SEGMENT (the inverse of `mainEntities`).
 *
 * Deliberately written out by hand instead of being derived from
 * `mainEntities` with `Object.entries(...).reverse()`. `mainEntities` contains
 * the `student: 'contact'` sample, and `student` has NO folder under
 * `src/app/portal/`; a derived inverse would therefore rewrite every
 * `contact` URL to `/portal/student/...` and 404 the whole Contacts grid.
 *
 * RULE: only add a pair here when `src/app/portal/<segment>/` (or
 * `src/app/portal/(group)/<segment>/`) actually exists.
 */
export const routeEntities: Record<string, string> = {
  device_group_settings: 'device_group',
};

/**
 * Convert an ORM entity name into the route segment that must appear in a
 * `/portal/...` URL path. Falls back to the entity itself when it is not
 * aliased (the common case).
 *
 * Use this ONLY for the URL PATH. Anything handed to tRPC / the ORM
 * (`wizard.getCurrentStep`, `getByCode`, ...) must keep the ORM entity name.
 */
export const toRouteSegment = (entity: string): string =>
  routeEntities[entity] ?? entity;
