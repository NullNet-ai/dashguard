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
  return [
    {
      name: `All ${mainEntity}`,
      current: true,
      href: `/portal/${mainEntity}/grid?filter_id=`,
      default: true,
    },
    {
      name: "Draft",
      current: false,
      href: `/portal/${mainEntity}/grid?filter_id=`,
      default: true,
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
