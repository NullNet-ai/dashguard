/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { api } from "~/trpc/server";
import { headers } from "next/headers";
import { fetchParticipants } from "../../Action/createUpdateParticipantsDetails";
import ParticipantsDetailsForm from "./client";
import { notFound } from "next/navigation";

const ParticipantDetails = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , application, identifier] = pathname.split("/");

  const booking_results = await api.booking.getByCode({
    code: identifier!,
    pluck_fields: ["id", "code"],
  });

  const record_id = booking_results?.data?.id;

  const fetch_participants = await api.bookingParticipant.fetchAllContact({
    pluck_fields: ["id", "first_name", "middle_name", "last_name"],
  });

  const full_name = fetch_participants
    ?.map((item) => {
      const label =
        `${item.first_name || ""} ${item.middle_name || ""} ${item.last_name || ""}`.trim();
      return label ? { label, value: item.id } : null;
    })
    .filter(Boolean);

  const defaultParticipants = await fetchParticipants(record_id!);

  return (
    <div className="space-y-2">
      <ParticipantsDetailsForm
        defaultValues={{ participants: defaultParticipants }}
        selectOptions={{
          full_name: full_name,
        }}
        params={{
          id: record_id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default ParticipantDetails;
