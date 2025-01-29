import { ulid } from "ulid";

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
  const modified_entity = mainEntity === "user_role" ? "role" : mainEntity;

  return [
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
    {
      name: "Draft",
      current: false,
      href: `/portal/${mainEntity}/grid?filter_id=`,
      default: true,
      default_filter: [
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
  ].map((tab) => {
    const _id = ulid();

    return {
      ...tab,
      id: _id,
      href: `${tab.href}${_id}`,
    };
  });
};
