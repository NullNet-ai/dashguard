import { api } from "~/trpc/server";
import BookingCandidate from "./client";
import { headers } from "next/headers";

const BookingCandidateDetails = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const response = await api.booking.getByCode({
    code: identifier!,
    pluck_fields: ["id", "candidate_id"],
  });

  const candidates = await api.candidate.getCandidates({});

  const candidate_options = candidates?.map((candidate) => ({
    value: candidate.id,
    label: `${candidate?.contact_first_name || ""} ${candidate?.contact_last_name || ""}`,
  }));

  const default_values = response?.data;

  return (
    <div className="space-y-2">
      <BookingCandidate
        defaultValues={default_values}
        selectOptions={{ candidate_id: candidate_options }}
        params={{
          id: default_values?.id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity!,
        }}
      />
    </div>
  );
};

export default BookingCandidateDetails;
