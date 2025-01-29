import { api } from "~/trpc/server";
import { headers } from "next/headers";
import CategoryDetails from "./client";
import { IDropdown } from "./types";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const fetched_category_details = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "code", "categories"],
  });

  const formatted_categories = fetched_category_details?.data?.categories?.map(
    (category: string) => {
      return { value: category, label: category };
    },
  );
  const contact_id = fetched_category_details?.data?.id;
  const filtered_categories = formatted_categories
    ?.filter((category: IDropdown) => category?.value !== "Contact")
    ?.filter(Boolean);
  const default_values = {
    categories: filtered_categories?.[0]?.value || "",
  };

  return (
    <div className="space-y-2">
      <CategoryDetails
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
