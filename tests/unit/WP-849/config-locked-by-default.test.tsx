import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// WP-849: the /portal/config WG Agent Version form must open LOCKED.
// FormBuilder locks only when `properties.isEditable` is explicitly false —
// with `properties` absent its default effect resolves `myParent === 'record'
// ? true : false`, and this form passes no `myParent`, so it opened unlocked.
// The lock is safe because FormBuilder merges `hasActions: true` into
// `properties`, so FormHeader still renders the UnlockButton.
const captured: { properties?: { isEditable?: boolean } } = {};

vi.mock('~/components/platform/FormBuilder', () => ({
  FormBuilder: (props: { properties?: { isEditable?: boolean } }) => {
    captured.properties = props.properties;
    return null;
  },
}));

vi.mock('~/trpc/react', () => ({
  api: {
    device: {
      updateLatestVersion: {
        useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
      },
    },
  },
}));

vi.mock('~/context/ToastProvider', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn() }),
}));

import WGAgentVersionForm from '~/app/portal/(settings)/config/_components/forms/wg-agent-version/client';

describe('WP-849 config WG Agent Version form', () => {
  it.each([
    ['a version already set', '1.3.12'],
    ['no version configured yet', ''],
  ])('opens locked with %s', (_label, latest_version) => {
    render(<WGAgentVersionForm defaultValues={{ latest_version }} />);
    expect(captured.properties?.isEditable).toBe(false);
  });
});
