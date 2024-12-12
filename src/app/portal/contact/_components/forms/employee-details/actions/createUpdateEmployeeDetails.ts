"use server";

import { TEmployeeDetailsSchema } from "~/server/zodSchema/contacts/employeeDetails";
import { api } from "~/trpc/server";

export const createUpdateSubOrg = async (values: TEmployeeDetailsSchema) => {
  const { sub_organizations, contact_id, job_title } = values;
  const sub_organization_id = sub_organizations!;

  const existing_sub_org =
    await api.contactSubOrganization.getSubOrganizationByContactId({
      contact_id: contact_id!,
      pluck_fields: ["id", "sub_organization_id", "contact_id"],
    });

  const find_existing_sub_org = existing_sub_org.find((sub_org) => {
    const { sub_organization_id: _sub_org_id } = sub_org;
    const _sub_organization_id = _sub_org_id || "";
    return (
      _sub_organization_id === sub_organization_id &&
      sub_org.contact_id === contact_id
    );
  });

  let response = null;

  if (find_existing_sub_org) {
    response = await api.contactSubOrganization.updateSubOrganizationRecord({
      id: find_existing_sub_org.id,
      contact_id: contact_id!,
      job_title: job_title!,
      sub_organization_id,
    });
  } else {
    response = await api.contactSubOrganization.createSubOrganizationRecord({
      contact_id: contact_id!,
      job_title: job_title!, //Need to create for job title
      sub_organization_id,
    });
  }

  existing_sub_org.map(async (sub_org) => {
    if (sub_org.id !== find_existing_sub_org?.id) {
      await api.contactSubOrganization.delete({
        id: sub_org.id,
      });
    }
  });

  return response?.success;
};

export const createUpdateOrgContact = async (
  values: TEmployeeDetailsSchema,
) => {
  const { contact_id, organizations } = values;
  const contact_organization_id = organizations;
  const existing_org_contacts = await api.contactOrganization.getOrgByContactId(
    {
      contact_id: contact_id!,
      pluck_fields: ["id", "contact_organization_id", "contact_id"],
    },
  );
  const find_existing_sub_org = existing_org_contacts.find(
    (sub_org) =>
      sub_org.contact_organization_id === contact_organization_id &&
      sub_org.contact_id === contact_id,
  );

  let response = null;
  if (find_existing_sub_org) {
    response = {
      success: true,
      data: [find_existing_sub_org],
    };
    // response = await api.contactOrganization.updateContactOrgRecord({
    //   id: find_existing_sub_org.id,
    //   contact_id: contact_id!,
    //   contact_organization_id,
    // });
  } else {
    response = await api.contactOrganization.createContactOrgRecord({
      contact_id: contact_id!,
      contact_organization_id,
    });
  }

  existing_org_contacts.map(async (sub_org) => {
    if (sub_org.id !== find_existing_sub_org?.id) {
      await api.contactOrganization.delete({
        id: sub_org.id,
      });
    }
  });

  return response?.success;
};
