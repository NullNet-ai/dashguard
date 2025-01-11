import { api } from "~/trpc/server";
import { headers } from "next/headers";
import BasicDetails from "./client";
import { defaultSorting } from "../../../grid/_config/sorting";
import { getGridCacheData } from "~/lib/grid-get-cache-data";
const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const pluck_fields = ["id", "code", "role", "status"];
  const [, , main_entity, application, identifier] = pathname.split("/");

  const record_data = await api.contact.fetchContactPhoneEmail({
    code: identifier!,
    pluck_fields,
    is_multiple: true,
  });
  const _pluck = [
    "id",
    "code",
    "categories",
    "organization_id",
    "first_name",
    "middle_name",
    "last_name",
    "email_address",
    "contact_status",
    "status",
    "created_date",
    "updated_date",
    "created_time",
    "updated_time",
  ];
  const { sorting } = (await getGridCacheData()) ?? {};

  const { items = [], totalCount } = await api.contact.formFilterGrid({
    entity: "contact",
    pluck: _pluck,
    sorting: sorting?.length ? sorting : defaultSorting,
    current: 0,
    limit: 100,
  });

  const default_values = record_data;

  const contact_id = default_values?.id;

  // TODO: create query that joins related contact phone and email
  // !TEMPORARY: join contact phone and email
  // let joinedContactDetails = (record_data.emails.length && record_data.emails.reduce(
  //   (acc: Array<Record<string, any>>, curr, index) => {
  //     return [
  //       ...acc,
  //       {
  //         ...record_data,
  //         // refactor: do not enclose in array
  //         emails: [curr],
  //         // refactor: do not enclose in array
  //         phones: [record_data.phones[index]],
  //       },
  //     ];
  //   },
  //   [],
  // )) || [{ emails: [], phones: [] }];

  return (
    <div className="space-y-2">
      <BasicDetails
        defaultValues={{
          ...default_values,
          // for multi-select form filter
          // form_builder_fields: joinedContactDetails,
        }}
        params={{
          id: contact_id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity,
          pluck_fields,
        }}
        selectedRecords={contact_id ? [default_values] : []}
        grid_data={{ items, totalCount }}
      />
    </div>
  );
};

export default FormServerFetch;
