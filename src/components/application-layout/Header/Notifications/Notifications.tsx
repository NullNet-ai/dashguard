import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { BellIcon, NewspaperIcon } from "@heroicons/react/24/outline";
import { api } from "~/trpc/server";

type TNotification = {
  id: string;
  icon: string;
  title: string;
  description: string;
  time: string;
  link: string;
  acknowledged: boolean;
};

const getNotifcations = async (): Promise<Array<TNotification>> => {
  const notifcations =
    (await api.notification.getNotificationsByContact()) || [];

  return notifcations;
};

export default async function Notifications() {
  const notifications = await getNotifcations();

  const notificationsCount = notifications.filter(
    (notification) => !notification.acknowledged,
  ).length;

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <MenuButton className="flex items-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
            <span className="sr-only">Open Notifcations</span>
            <BellIcon className="h-6 w-6 text-muted-foreground" />
          </MenuButton>
        </div>

        <MenuItems
          transition
          className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
        >
          <div>
            {notifications.length == 0 && (
              <span className="flex min-h-48 w-full items-center justify-center px-4 py-2 text-xs text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none">
                No new notifications
              </span>
            )}

            {notifications.length > 0 &&
              notifications.map((notification) => {
                return (
                  <MenuItem key={notification.id}>
                    <a
                      href={notification.link}
                      className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex w-4 items-end justify-between">
                          <NewspaperIcon className="size-24 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold">{notification.title}</p>
                          <p className="text-sm text-gray-500">
                            {notification.description}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {notification.time}
                        </p>
                      </div>
                    </a>
                  </MenuItem>
                );
              })}

            <MenuItem>
              <a
                href={"/portal/notifications"}
                className="flex w-full items-center justify-center px-4 py-2 text-xs text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
              >
                Go to Notifications
              </a>
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
      {notificationsCount > 0 && (
        <span className="absolute right-2 top-1 inline-flex -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-red-600 px-2 py-1 text-xs font-bold leading-none text-red-100">
          {notificationsCount}
        </span>
      )}
    </>
  );
}
