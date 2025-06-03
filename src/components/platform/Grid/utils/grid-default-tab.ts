import pluralize from 'pluralize';
import { ulid } from 'ulid';
import GRIDTABS from '~/server/default-grid-tab';


export const tabName: Record<string, string> = {
  user_role: 'role',
  account_organization: 'Accounts',
};

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

export const SetIdTab = (mainEntity: string, href?: string, defaultGridTabs?: any[], defaultSorting?: any[]) => {
  const modified_entity = tabName[mainEntity] || mainEntity;

  const additional_tabs = GRIDTABS[mainEntity] || [];

  const modifyDefaultSorting = defaultSorting?.map((sort) => {
    return {
      id: sort.id,
      desc : sort.desc,
    };
  }) || [];
  const tabs = [
    {
      name: `All ${pluralize(modified_entity)}`,
      current: true,
      href: href ? href : `/portal/${mainEntity}/grid?filter_id=`,
      default: true,
      sorts : modifyDefaultSorting,
      default_filter: [
        {
          operator: 'equal',
          type: 'criteria',
          field: 'status',
          id: ulid(),
          label: 'Status',
          values: ['Active', 'Draft'],
          default: true,
        }
      ],
    },
    ...additional_tabs,
    ...(defaultGridTabs || []),
  ];

  const modifiedTabs =  tabs.map((tab) => {
    const _id = tab.id || ulid();
    
    // Check if href already has a filter_id with a value
    const hasFilterId = tab.href.includes('/grid?filter_id=') && 
    tab.href.split('/grid?filter_id=')[1].length > 0;

    return {
      ...tab,
      id: _id,
      href: hasFilterId ? tab.href : `${tab.href}${_id}`,
    };
  });

  return modifiedTabs;
};
