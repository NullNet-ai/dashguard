import { api } from "~/trpc/server";
import { headers } from "next/headers";
import EmployeeDetails from "./client";
import { transformDataToOptions } from "./actions/utils";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const contact_details = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: [
      "id",
      "code",
      "first_name",
      "middle_name",
      "last_name",
      "goes_by",
    ],
  });

  const fetchSubOrganization = async (contact_id: string) => {
    const res = await api.contactSubOrganization.getSubOrganizationByContactId({
      contact_id,
      pluck_fields: [
        "id",
        "sub_organization_id",
        "contact_id",
        "job_title",
        "status",
      ],
      advance_filters: {
        status: "Active",
      },
    });

    const [sub_org] = res || [];
    return sub_org;
  };

  const fetchOrganizationContact = async (contact_id: string) => {
    const res = await api.contactOrganization.getOrgByContactId({
      contact_id,
      pluck_fields: ["id", "contact_organization_id", "contact_id", "status"],
      advance_filters: {
        status: "Active",
      },
    });
    const [contact_org] = res || [];

    return contact_org;
  };

  const default_values = contact_details?.data || {};

  const contact_id = default_values?.id;

  const organization_data_options = await api.contact.getAllOrganization({
    id: contact_id,
    pluck_fields: ["id", "name"],
  });

  const [sub_organization, organization_contact] = await Promise.all([
    fetchSubOrganization(contact_id),
    fetchOrganizationContact(contact_id),
  ]);

  const defaultOptions = transformDataToOptions(
    organization_data_options?.data || [],
  );

  let organizations = "";

  if (organization_contact?.contact_organization_id) {
    organizations = organization_contact.contact_organization_id;
  } else {
    const default_organization_values =
      await api.organization.getCurrentLoginOrg({
        pluck_fields: ["id", "name"],
      });

    organizations = default_organization_values?.id || "";
  }

  return (
    <div className="space-y-2">
      <EmployeeDetails
        defaultValues={{
          organizations: organizations || "",
          sub_organizations: sub_organization?.sub_organization_id || "",
          job_title: sub_organization?.job_title || "",
        }}
        multiSelectOptions={{
          organizations: defaultOptions,
        }}
        params={{
          id: default_values?.id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity,
        }}
      />
    </div>
  );
};

export default FormServerFetch;
