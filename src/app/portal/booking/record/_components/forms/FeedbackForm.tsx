"use client";

import { FormBuilder } from "~/components/platform/FormBuilder";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "./types";
import CustomFeedbackForm from "./Custom/CustomFeedbackForm";
import { BookingFeedbackSchema } from "~/server/zodSchema/bookings/feedback";

export default function FeedbackForm({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();

  const handleSave = async () =>
    //   {
    //   data,
    // }: IHandleSubmit<TBookingFeedbackSchema>
    {
      try {
        //Save and Close Form
        return true;
      } catch (error) {
        toast.error("Failed to submit Candidate Details");
      }
    };



  return (
    <div className="space-y-2">
      <FormBuilder
        myParent={params.shell_type}
        customDesign={{
          formClassName: "sm:grid-cols-1",
        }}
        formProps={params}
        formLabel="Feedback"
        handleSubmit={handleSave}
        formKey="booking-feedback"
        formSchema={BookingFeedbackSchema}
        defaultValues={defaultValues}
        selectOptions={selectOptions}
        fields={[]}
        customRender={(form) => (
          <CustomFeedbackForm form={form} selectOptions={selectOptions} />
        )}
      />
    </div>
  );
}
