const toArray = (value: any): any[] =>
  Array.isArray(value) ? value : value ? [value] : [];

// WP-829: a device can belong to more than one group, so the grid column is
// array-valued. The Store returns the nested-joined settings either merged at
// the row root or hanging off each device_groups row, so read both shapes.
export const flattenDeviceGroupNames = (
  item: Record<string, any> | null | undefined,
): string[] => {
  const names = new Set<string>();

  const collect = (settings: any) => {
    toArray(settings).forEach((setting: any) => {
      if (setting?.name) names.add(setting.name);
    });
  };

  collect(item?.device_group_settings);
  toArray(item?.device_groups).forEach((group: any) =>
    collect(group?.device_group_settings),
  );

  return [...names].sort();
};
