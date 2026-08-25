export interface SelectableDeviceRow {
  id?: string | null;
  device_group_names?: string[] | null;
}

export interface AssignSelection {
  /** Device ids to send to deviceGroup.assignDevices — deduped, never already in the group. */
  device_ids: string[];
  /** Selected devices skipped because they are already in the group. */
  skipped: number;
}

// WP-830: assignDevices has no upsert — it blindly creates one device_groups
// junction row per id, so a device already in the group would get a duplicate
// row. The grid already carries device_group_names (WP-829) and group names are
// unique (enforced in deviceGroup.saveDeviceGroup), so filter by name here
// rather than paying an extra round trip.
export const partitionDevicesForGroup = (
  rows: (SelectableDeviceRow | null | undefined)[],
  groupName: string,
): AssignSelection => {
  const device_ids: string[] = [];
  const seen = new Set<string>();
  let skipped = 0;

  rows.forEach((row) => {
    const id = row?.id;
    if (!id || seen.has(id)) return;
    seen.add(id);

    if ((row?.device_group_names ?? []).includes(groupName)) {
      skipped += 1;
      return;
    }
    device_ids.push(id);
  });

  return { device_ids, skipped };
};
