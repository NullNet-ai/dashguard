import pluralize from 'pluralize';
import { ulid } from 'ulid';
import GRIDTABS from '~/server/default-grid-tab';
import { ISearchItem } from '../Search/types';

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

export const SetIdTab = ({
  mainEntity,
  href,
  defaultGridTabs,
  defaultSorting,
  additionalFilters,
  defaultGrouping,
  gridEntity,
  defaultAdvanceFilter,
  defaultAllTabName,
  hideDefaultAllTab = false,
}: {
  mainEntity: string;
  href?: string;
  defaultGridTabs?: any[];
  defaultSorting?: any[];
  additionalFilters?: any[];
  defaultGrouping?: any[];
  gridEntity?: string;
  defaultAdvanceFilter?: ISearchItem[];
  defaultAllTabName?: string;
  hideDefaultAllTab?: boolean;
}) => {
  const modified_entity = tabName[mainEntity] || mainEntity;

  const additional_tabs = GRIDTABS[mainEntity] || [];

  const modifyDefaultSorting =
    defaultSorting?.map((sort) => ({
      id: sort.id,
      desc: sort.desc,
      ...(sort.sort_key ? { sort_key: sort.sort_key } : {}),
    })) || [];

  const modifydefaultGridTabs =
    defaultGridTabs?.map((tab) => {
      return {
        ...tab,
        sorts: tab?.sorts?.length ? tab.sorts : modifyDefaultSorting,
      };
    }) || [];

  const gridTabs = [...additional_tabs, ...modifydefaultGridTabs];

  const tabs = [
    ...(!hideDefaultAllTab
      ? [
          {
            name: defaultAllTabName ?? `All ${pluralize(modified_entity)}`,
            current: true,
            href: href ? href : `/portal/${mainEntity}/grid?filter_id=`,
            default: true,
            sorts: modifyDefaultSorting,
            groups: defaultGrouping,
            default_filter: defaultAdvanceFilter?.length
              ? defaultAdvanceFilter
              : [
                  {
                    operator: 'equal',
                    type: 'criteria',
                    field: 'status',
                    id: ulid(),
                    label: 'Status',
                    values: ['Active', 'Draft'],
                    default: true,
                    ...(gridEntity
                      ? {
                          entity: gridEntity,
                        }
                      : {}),
                  },
                  ...(additionalFilters?.length
                    ? [
                        {
                          operator: 'and',
                          type: 'operator',
                          default: true,
                        },
                        ...additionalFilters,
                      ]
                    : []),
                ],
          },
        ]
      : []),
    ...gridTabs,
  ];

  const modifiedTabs = tabs.map((tab) => {
    const _id = tab.id || ulid();

    // Fix the URL construction to prevent duplicate filter_id
    let finalHref = tab.href;

    // If the URL already contains ?filter_id= (with or without a value)
    if (finalHref.includes('?filter_id=')) {
      // Check if it already has a value
      if (finalHref.split('?filter_id=')[1].length > 0) {
        // Already has a value, don't modify
        return {
          ...tab,
          id: _id,
          href: finalHref,
        };
      } else {
        // Has ?filter_id= but no value, append the ID
        finalHref = `${finalHref}${_id}`;
      }
    } else {
      // Doesn't have filter_id parameter at all
      // Check if it has other query parameters
      if (finalHref.includes('?')) {
        finalHref = `${finalHref}&filter_id=${_id}`;
      } else {
        finalHref = `${finalHref}?filter_id=${_id}`;
      }
    }

    return {
      ...tab,
      id: _id,
      href: finalHref,
    };
  });

  return modifiedTabs;
};
