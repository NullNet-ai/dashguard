import { api } from "~/trpc/server";
import { headers } from "next/headers";
import BasicDetails from "./client";
import FormBuilderPage from "./builder";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const record = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "code"],
  });
  const defaultValues = record?.data;
  return (
    <div className="space-y-2">
      <BasicDetails
        defaultValues={defaultValues ?? {}}
        params={{
          id: defaultValues?.id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity,
        }}
      />
      {
        // Remove this component after implementing FormBuilderPage
        // You remove the component by deleting the following line and the import statement at the top of the file
        // You can delete the file after removing the component
      }
      <FormBuilderPage />
    </div>
  );
};

export default FormServerFetch;
