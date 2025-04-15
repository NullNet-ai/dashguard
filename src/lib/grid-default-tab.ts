import { ulid } from "ulid";
import GRIDTABS from '../server/default-grid-tab'

const tabName: Record<string, string> = {
  user_role: "role",
  organization_account: "Accounts",
  device_remote_access_session: "Remote Access",
}

export const SetTab = ({ name, entity }: { name: string; entity: string }) => {
  const _id = ulid();
  return {
    name: `${name} Copy`,
    current: true,
    href: `/portal/${entity}/grid?filter_id=` + _id,
    default: false,
    id: _id,
  };
};

export const SetIdTab = (mainEntity: string) => {
  const modified_entity = tabName[mainEntity] || mainEntity;

  const additional_tabs = GRIDTABS[mainEntity] || [];

  const tabs = [
    {
      name: `All ${modified_entity}`,
      current: true,
      href: `/portal/${mainEntity}/grid?filter_id=`,
      default: true,
      default_filter: [
        {
          operator: "equal",
          type: "criteria",
          field: "status",
          id: ulid(),
          label: "Status",
          values: ["Active"],
          default: true,
        },
        {
          operator: "or",
          type: "operator",
          default: true,
        },
        {
          operator: "equal",
          type: "criteria",
          field: "status",
          id: ulid(),
          label: "Status",
          values: ["Draft"],
          default: true,
        },
      ],
    },
    ...additional_tabs
  ]

  return tabs.map((tab) => {
    const _id = ulid();

    return {
      ...tab,
      id: _id,
      href: `${tab.href}${_id}`,
    };
  });
};
