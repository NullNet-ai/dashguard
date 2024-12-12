import { api } from "~/trpc/server";
import BookingInterviewNotes from "./client";
import { headers } from "next/headers";

const InterviewNoteDetails = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const response = await api.booking.getByCode({
    code: identifier!,
    pluck_fields: ["id", "interview_notes"],
  });

  const default_values = response?.data;

  return (
    <div className="space-y-2">
      <BookingInterviewNotes
        defaultValues={default_values}
        params={{
          id: default_values?.id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity!,
        }}
      />
    </div>
  );
};

export default InterviewNoteDetails;
