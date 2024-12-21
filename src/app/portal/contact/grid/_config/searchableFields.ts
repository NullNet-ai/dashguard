import { ISearchableField } from "~/components/platform/Grid/Search/types";

export const searchableFields: ISearchableField[] = [
  {
    field: "status",
    label: "Status",
    entity: "contacts"
  },
  {
    field: "code",
    label: "ID",
    entity: "contacts"
  },
  {
    field: "categories",
    label: "Category",
    entity: "contacts",
    operator: "contains"
  },
  {
    field: "first_name",
    label: "First Name",
    entity: "contacts"
  },
  {
    field: "last_name",
    label: "Last Name",
    entity: "contacts"
  },
  {
    field: "middle_name",
    label: "Middle Name",
    entity: "contacts"
  },
  {
    label: "Primary Phone Number",
    field: "raw_phone_number",
    entity: "contact_phone_numbers",
  },
  {
    label: "Primary Email",
    field: "email",
    entity: "contact_emails",
  },
  // {
  //   label: "Organization",
  //   field: "name",
  //   entity: "organizations",
  // },
  // {
  //   label: "Role",
  //   field: "role",
  //   entity: "user_roles",
  // },
  {
    label: "Updated Date",
    field: "updated_date",
    entity: "contacts"
  },
  // {
  //   label: "Updated By",
  //   field: "updated_by",

  // },
  {
    label: "Created Date",
    field: "created_date",
    entity: "contacts"
  },
  // {
  //   label: "Created By",
  //   field: "created_by",
  // },
];
