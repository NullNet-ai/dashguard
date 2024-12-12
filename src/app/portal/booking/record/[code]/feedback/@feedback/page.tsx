import { headers } from "next/headers";
import { api } from "~/trpc/server";
import { FeedbackForm } from "../../../_components/forms";
import { transformDropdown } from "../../../../../../../utils/formatter";

const RecordTabContainer = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , , identifier] = pathname.split("/");

  const booking_results = await api.booking.getByCode({
    code: identifier!,
    pluck_fields: ["id", "code"],
  });

  const record_id = booking_results?.data?.id;

  const response = await api.bookingParticipant.getParticipantsByBookingId({
    booking_id: record_id!,
    pluck_fields: [
      "id",
      "booking_id",
      "participant_id",
      "overall_result",
      "rating",
      "strength",
      "weakness",
      "red_flag",
    ],
  });

  const is_booking_feedbacks = response?.length;

  const default_values = is_booking_feedbacks ? response : [];

  const overall_result = transformDropdown(["Pass", "Fail"]);
  const rating = transformDropdown([
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
  ]);

  if (!is_booking_feedbacks)
    return <>There are no participants to provide feedback.</>;

  return (
    <FeedbackForm
      defaultValues={{
        feedbacks: default_values,
      }}
      selectOptions={{
        overall_result,
        rating,
      }}
      params={{
        id: record_id!,
        shell_type: "record",
      }}
    />
  );
};

export default RecordTabContainer;
