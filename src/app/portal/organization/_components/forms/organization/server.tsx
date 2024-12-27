import { api } from "~/trpc/server";
import { headers } from "next/headers";
import Organization from "./client";

const StepOneOrganizationForm = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , application, identifier] = pathname.split("/");

  const fetched_orgs = await api.organization.getByCode({
    code: identifier!,
    pluck_fields: ["id", "code", "name", "parent_organization_id"],
  });
  const record_id = fetched_orgs?.data?.id;

  const parent_orgs_options = await api.organization.parentOrganizations({
    id: record_id!,
  });
  const defaultValues = fetched_orgs?.data;

  return (
    <div className="space-y-2">
      <Organization
        defaultValues={defaultValues}
        selectOptions={{ parent_organization_id: parent_orgs_options }}
        params={{
          id: record_id!,
          shell_type: application! as "record" | "wizard",
          entity: "organizations",
          navigate: {
            wizard_step: "1",
            record_tab: "organization",
          },
        }}
      />
    </div>
  );
};

export default StepOneOrganizationForm;
