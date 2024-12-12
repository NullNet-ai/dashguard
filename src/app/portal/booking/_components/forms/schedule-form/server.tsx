/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { api } from "~/trpc/server";
import { headers } from "next/headers";
import ScheduleForm from "./client";

const transformDropdown = (data: string[]) => {
  return data.map((item) => ({
    label: item,
    value: item,
  }));
};
const generateIncrements = () => {
  const result = [];
  for (let i = 5; i <= 120; i += 5) {
    result.push(i);
  }
  return result.map((item) => ({
    label: `${item}`,
    value: `${item}`,
  }));
};

const StepTwoScheduleForm = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , application, identifier] = pathname.split("/");

  const booking_results = await api.booking.getByCode({
    code: identifier!,
    pluck_fields: ["id", "code"],
  });

  const record_id = booking_results?.data?.id;

  const fetched_schedules = await api.booking.getBooking({
    id: record_id!,
    pluck_fields: [
      "timezone",
      "reminder",
      "duration_mins",
      "start_date",
      "start_time",
      "title",
      "interview_location",
    ],
  });

  const fetched_reminder = await api.reminder.fetchAllReminders({
    pluck: ["reminder"],
  });

  const fetched_timezones = await api.timezones.fetchAlltimezone({
    pluck: ["timezone"],
  });

  const reminder_options = transformDropdown(
    fetched_reminder?.data.map((item) => item.reminder),
  );
  const timezone_options = transformDropdown(
    fetched_timezones?.data.map((item) => item.timezone),
  );

  const defaultValues = fetched_schedules;

  return (
    <div className="space-y-2">
      <ScheduleForm
        defaultValues={defaultValues}
        selectOptions={{
          reminder: reminder_options,
          timezone: timezone_options,
          duration_mins: generateIncrements(),
        }}
        params={{
          id: record_id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default StepTwoScheduleForm;
