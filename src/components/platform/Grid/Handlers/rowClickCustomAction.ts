import * as React from 'react';
import { IRowClickCustomConfig } from '../types';

interface ActionHandlerProps {
  application_config: any;
  row: any;
  actions: any;
}

const handleSideDrawer = ({
  application_config,
  row,
  actions,
}: ActionHandlerProps) => {
  actions?.openSideDrawer({
    ...application_config,
    header:
      application_config.header &&
      React.isValidElement(application_config.header)
        ? React.cloneElement(application_config.header, {
            record_data: row.original,
          } as { record_data: typeof row.original })
        : application_config.header || '',
    body: {
      ...application_config.body,
      componentProps: {
        ...application_config.body.componentProps,
        record_data: row.original,
        actions,
      },
    },
  });
};

export const handleCustomAction = ({
  config,
  row,
  actions,
}: {
  config: any;
  row: any;
  actions: any;
}) => {
  const { application_config, action_type } =
    config?.rowClickCustomAction as IRowClickCustomConfig;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const actionHandlers: Record<string, Function> = {
    'open-sidedrawer': () =>
      handleSideDrawer({ application_config, row, actions }),
    // Add more action types here
  };

  const handler = actionHandlers[action_type];
  if (handler) {
    handler();
  }
};
