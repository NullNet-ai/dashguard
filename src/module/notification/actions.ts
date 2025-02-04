import { notification_container } from './notifications.class';

notification_container.set('yes', async (context: any, metadata: any) => {
  console.log('Action: YES');
  console.log('Context:', context);
  console.log('Metadata:', metadata);
  // Add your action handling logic here
});
