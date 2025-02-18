/* eslint-disable @typescript-eslint/no-empty-function */
import { notification_container } from './notifications.class'

interface NotificationActions {
  setActions(actions: Map<string, () => Promise<void>>): void
}

const actionsMap = new Map<string, () => Promise<void>>([
  ['yes', async () => {
  }],
  ['no', async () => {
  }],
])

if (notification_container && 'setActions' in notification_container) {
  (notification_container as NotificationActions).setActions(actionsMap)
}
