import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// deviceGroup.unassignDevices deletes `device_groups` junction rows by id.
// The members payload carries BOTH the junction id (`id`) and the device id
// (`device_id`) on the same row — sending `device_id` here would delete the
// wrong rows (or none). These tests pin that the junction id is what goes out.
const mutateAsync = vi.fn().mockResolvedValue({ success: true });

vi.mock('~/trpc/react', () => ({
  api: {
    deviceGroup: {
      unassignDevices: {
        useMutation: () => ({ mutateAsync, isPending: false }),
      },
    },
  },
}));

vi.mock('~/context/ToastProvider', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn() }),
}));

import UnassignRowAction from '~/app/portal/(settings)/device_group/_components/forms/device-details/UnassignRowAction';

// Shape of one deviceGroup.members item.
const memberRow = {
  original: {
    id: 'device-group-junction-1',
    device_id: 'device-1',
    device_group_setting_id: 'group-1',
    device_name: 'Firewall A',
    device_code: 'DV0001',
    device_status: 'Active',
  },
};

describe('WP-831 unassign contract', () => {
  beforeEach(() => {
    mutateAsync.mockClear();
  });

  // globals:false means testing-library's auto-cleanup is not registered.
  afterEach(() => {
    cleanup();
  });

  it('sends the device_groups junction row id, not the device id', async () => {
    const onFetchRecords = vi.fn();
    render(<UnassignRowAction row={memberRow} onFetchRecords={onFetchRecords} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
    expect(mutateAsync).toHaveBeenCalledWith({
      device_group_ids: ['device-group-junction-1'],
    });
    expect(mutateAsync.mock.calls[0]?.[0]?.device_group_ids).not.toContain(
      memberRow.original.device_id,
    );
  });

  it('refetches the members grid after a successful unassign', async () => {
    const onFetchRecords = vi.fn();
    render(<UnassignRowAction row={memberRow} onFetchRecords={onFetchRecords} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(onFetchRecords).toHaveBeenCalledTimes(1));
  });

  it('does not refetch when the mutation fails', async () => {
    mutateAsync.mockRejectedValueOnce(new Error('boom'));
    const onFetchRecords = vi.fn();
    render(<UnassignRowAction row={memberRow} onFetchRecords={onFetchRecords} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
    expect(onFetchRecords).not.toHaveBeenCalled();
  });
});
