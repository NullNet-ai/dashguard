import { api } from "~/trpc/server";
import { headers } from "next/headers";
import SkillDetails from "./client";
import { ulid } from "ulid";
import { transformDropdown } from "~/utils/formatter";

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
  const proficiency_options = transformDropdown([
    "Beginner",
    "Intermediate",
    "Advanced",
  ]);

  const years_of_experience_options = transformDropdown([
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
    "10+",
  ]);
  const response = await api.contactSkill.get({
    contact_id: contact_id!,
  });
  const defaultValues = response?.length
    ? response
    : [{ id: ulid(), proficiency: "", years_of_experience: "", skill: "" }];

  return (
    <div className="space-y-2">
      <SkillDetails
        defaultValues={{
          skills: defaultValues,
        }}
        selectOptions={{ proficiency_options, years_of_experience_options }}
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
