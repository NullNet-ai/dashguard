import { api } from "~/trpc/server";
import { startCase } from "lodash";
import { headers } from "next/headers";
import ReportColumnsForm from "./client";

const ReportColumns = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const response = await api.report.getByCode({
    // id: identifier!,
    code: identifier!,
    pluck_fields: ["id", "columns"],
  });

  const responseData = response?.data?.columns;
  const modifiedColumn = responseData?.length
    ? responseData.map((data: string) => {
        return {
          label: startCase(data),
          value: data,
        };
      })
    : [];

  const defaultValues = { ...responseData.data, columns: modifiedColumn };

  return (
    <div className="space-y-2">
      <ReportColumnsForm
        defaultValues={defaultValues}
        params={{
          id: defaultValues?.id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity!,
        }}
      />
    </div>
  );
};

export default ReportColumns;
