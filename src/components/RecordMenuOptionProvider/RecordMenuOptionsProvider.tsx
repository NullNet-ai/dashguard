'use client';
import React, { createContext } from 'react';
import { handleChangeStatus } from '~/app/portal/organization_account/record/_actions';
import { IMenuOptionConfig } from '../platform/Record/types';
import { accountStatuses } from '~/app/portal/organization_account/record/_actions/statusOptions';

type Props = {
  menu_options: Array<{ label: string; params: { key: string } }>;
  children: React.ReactNode;
  categories: Array<any>;
};

export const RecordMenuOptionContext = createContext<{
  menu_items: Array<{
    params: { key: string };
    onClick?: any;
    children?: any;
    label?: string;
  }>;
}>({
  menu_items: [],
});

const RecordMenuOptionsProvider = (props: Props) => {
  const modifiedMenuItems = props.menu_options.map((item) => {
    const { label } = item;
    return {
      ...item,
      onClick: async (id: string, entityName: string) => {
        const status = accountStatuses[label as keyof typeof accountStatuses];

        await handleChangeStatus(status, id, entityName, 'account_status');
      },
    };
  });

  return (
    <RecordMenuOptionContext.Provider
      value={{
        menu_items: modifiedMenuItems,
      }}
    >
      {props.children}
    </RecordMenuOptionContext.Provider>
  );
};

export default RecordMenuOptionsProvider;
