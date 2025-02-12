import { notification_container } from './notifications.class';

const actionsMap = new Map([
  ['yes', async (context : any, metadata : any) => {
    console.log('Action: YES', context, metadata);
  }],
  ['no', async (context, metadata) => {
    console.log('Action: NO', context, metadata);
  }],
]);

notification_container.setActions(actionsMap);
