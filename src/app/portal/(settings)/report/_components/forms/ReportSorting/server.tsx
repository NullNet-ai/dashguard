import { api } from "~/trpc/server";
import ReportSortingForm from "./client";
import { headers } from "next/headers";

const ReportSorting = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const response = await api.report.getByCode({
    code: identifier!,
    pluck_fields: ["id", "code", "order_key", "order_direction"],
  });

  const defaultValues = response?.data;
  return (
    <div className="space-y-2">
      <ReportSortingForm
        defaultValues={{
          ...defaultValues,
          order_key: defaultValues?.order_key || "",
          order_direction: defaultValues?.order_direction || "",
          id: defaultValues?.id || "",
        }}
        params={{
          id: defaultValues?.id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity!,
        }}
      />
    </div>
  );
};

export default ReportSorting;
