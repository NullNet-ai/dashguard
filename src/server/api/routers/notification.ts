import { ulid } from "ulid";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
export const notificationsRouter = createTRPCRouter({
  getNotificationsByContact: privateProcedure.query(async () => {
    const notifcations = [
      {
        id: ulid(),
        icon: "",
        title: "New message",
        description: "You have a new message from a user",
        time: "2m",
        link: "#",
        acknowledged: false,
      },
      {
        id: ulid(),
        icon: "",
        title: "New message",
        description: "You have a new message from a user",
        time: "5m",
        link: "#",
        acknowledged: false,
      },
      {
        id: ulid(),
        icon: "",
        title: "New message",
        description: "You have a new message from a user",
        time: "10m",
        link: "#",
        acknowledged: false,
      },
    ];
    return notifcations;
  }),
});
