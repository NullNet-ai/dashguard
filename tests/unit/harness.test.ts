import { describe, expect, it } from 'vitest';

import { toCapitalize } from '~/lib/capitalize';

// Proves the loop's unit-test substrate works end to end. If any of these fail,
// the local gate is unreliable and no ticket should ship.
//   - document exists                 -> environment: 'jsdom'
//   - toBeInTheDocument matcher       -> tests/unit/setup.ts loaded
//   - `~/lib/capitalize` resolves     -> vite-tsconfig-paths wired to tsconfig paths
// Imports are explicit (not globals:true) so Cypress's ambient Chai `expect`
// cannot shadow vitest's.
describe('vitest harness', () => {
  it('resolves the ~/ path alias', () => {
    expect(toCapitalize('device_group')).toBe('Device Group');
  });

  it('provides a jsdom document and jest-dom matchers', () => {
    const el = document.createElement('span');
    el.textContent = 'ok';
    document.body.appendChild(el);

    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent('ok');

    el.remove();
  });
});
