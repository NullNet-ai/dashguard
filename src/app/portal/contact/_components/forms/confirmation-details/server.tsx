import { api } from "~/trpc/server";
import { headers } from "next/headers";
import ConfirmationDetails from "./client";
import { transformDataToOptions } from "./actions/utils";
import ConfirmationSummary from "./custom/ConfirmationSummary";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const response = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "tags"],
  });

  const { tags: _tags, id: contact_id } = response?.data || {};

  const tags = transformDataToOptions(_tags);

  const default_values = { ...response?.data, tags };

  return (
    <div className="space-y-2">
      <ConfirmationSummary />
      <ConfirmationDetails
        defaultValues={default_values}
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
