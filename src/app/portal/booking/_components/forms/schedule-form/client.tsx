"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { scheduleSchema } from "~/server/zodSchema/bookings/scheduleSchema";
import { IFormProps } from "../types";

export default function ScheduleForm({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();
  const updateSchedule = api.booking.updateBookingSchedule.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof scheduleSchema>>) => {
    try {
      const res = await updateSchedule.mutateAsync({
        id: params.id,
        ...data,
      });
      if (res.status_code == 200) {
        toast.success("Schedule submit sucessfully");
      }
      return res;
    } catch (error) {
      toast.error("Failed to submit Schedule");
    }
  };

  return (
    <>
      <FormBuilder
        myParent={params.shell_type}
        enableFormRegisterToParent
        formProps={params}
        formLabel="Schedule"
        handleSubmit={handleSave}
        formKey="booking-schedule"
        formSchema={scheduleSchema}
        defaultValues={defaultValues}
        selectOptions={selectOptions}
        fields={[
          {
            id: "title",
            formType: "input",
            name: "title",
            label: "Title",
            placeholder: "Interview Title",
          },
          {
            id: "start_time",
            formType: "input",
            name: "start_time",
            label: "Start Time",
            required: true,
            placeholder: "Start Time",
          },
          {
            id: "start_date",
            formType: "date",
            name: "start_date",
            label: "Start Date",
            required: true,
            placeholder: "Start Date",
            dateMinDate: new Date(),
          },
          {
            id: "duration_mins",
            formType: "select",
            name: "duration_mins",
            label: "Duration",
            required: true,
            placeholder: "Duration",
          },
          {
            id: "timezone",
            formType: "select",
            name: "timezone",
            label: "Timezone",
            required: false,
            placeholder: "Timezone",
          },
          {
            id: "interview_location",
            formType: "input",
            name: "interview_location",
            label: "Location",
            placeholder: "Interview Location",
          },
          {
            id: "reminder",
            formType: "select",
            name: "reminder",
            label: "Reminder",
            placeholder: "Reminder",
          },
        ]}
      />
    </>
  );
}
