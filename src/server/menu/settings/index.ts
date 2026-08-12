import communication_template from './communication_template';
import role from "./role";
import device_group from './device_group';

// Manual add menu to items
const menu = {
  title: "Settings",
  groupTitle: "Platform",
  groups: [
    {
      title: "Settings",
      icon: "Cog8ToothIcon",
      items: [role,
        // communication_template
        device_group,
      ],
    }
  ],
};

export default menu;
