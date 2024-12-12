import { api } from "~/trpc/server";
import { headers } from "next/headers";
import EducationDetails from "./client";
import { ulid } from "ulid";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const fetched_contact = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "code"],
  });
  const contact_id = fetched_contact?.data?.id;

  const response = await api.education.getEducationByContactId({
    contact_id: contact_id!,
    pluck_fields: [
      "id",
      "contact_id",
      "institution",
      "country_id",
      "degree",
      "degree_level_id",
      "completed_on",
      "note",
    ],
  });

  const country_id_options = await api.country.getCountryOptions();
  const degree_level_id_options = await api.degreeLevel.getDegreeLevelOptions();

  const default_values = response?.length
    ? response
    : [
        {
          id: ulid(),
          institution: "",
          country_id: "",
          degree: "",
          degree_level_id: "",
          completed_on: new Date().getFullYear().toString(),
          note: "",
          contact_id: contact_id!,
        },
      ];

  return (
    <div className="space-y-2">
      <EducationDetails
        defaultValues={{
          educations: default_values,
        }}
        selectOptions={{
          country_id: country_id_options,
          degree_level_id: degree_level_id_options,
        }}
        params={{
          id: contact_id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity,
        }}
      />
    </div>
  );
};

export default FormServerFetch;
