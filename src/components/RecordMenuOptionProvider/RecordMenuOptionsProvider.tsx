'use client';
import React, { createContext } from 'react';
import { handleChangeStatus } from './actions/updateRecordStatus';
import { useEventEmitter } from '~/context/EventEmitterProvider';

interface IChildMenuOption {
  label: string;
  status: string;
  disabled?: boolean;
}

export interface IMenuOption {
  label: string;
  children?: IChildMenuOption[];
  disabled?: boolean;
}

interface Props {
  menu_options: Array<IMenuOption | IChildMenuOption>;
  children: React.ReactNode;
  entity_field: string;
  formKey: string;
}

export const RecordMenuOptionContext = createContext<{
  menu_items: Array<{
    onClick?: any;
    children?: any;
    label?: string;
  }>;
}>({
  menu_items: [],
});

const RecordMenuOptionsProvider = (props: Props) => {
  const { menu_options = [], entity_field, formKey } = props ?? {};
  const eventEmitter = useEventEmitter();

  const modifiedMenuItems = menu_options.map((item) => {
    if ('children' in item) {
      const { label = '', children, disabled = false } = item;
      return {
        label,
        onClick: () => null,
        children: children?.map((child) => {
          const { label, status, disabled = false } = child;
          return {
            label,
            onClick: async (id: string, entityName: string) => {
              await handleChangeStatus(status, id, entityName, entity_field);
              eventEmitter.emit(`formStatus:${formKey}`, {
                status: 'status',
                form_key: formKey,
              });
            },
            disabled,
          };
        }),
        disabled
      };
    }
    const { label = '', status, disabled = false } = item as IChildMenuOption;
    return {
      label,
      onClick: async (id: string, entityName: string) => {
        await handleChangeStatus(status, id, entityName, entity_field);
        eventEmitter.emit(`formStatus:${formKey}`, {
          status: 'status',
          form_key: formKey,
        });
      },
      disabled,
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
