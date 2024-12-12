import { api } from "~/trpc/server";
import { ulid } from "ulid";
import ReportFiltersForm from "./client";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

const ReportFilters = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , application, identifier] = pathname.split("/");
  const responseByCode = await api.report.getByCode({
    // id: identifier!,
    code: identifier!,
    pluck_fields: ["id"],
  });
  const record_id = responseByCode?.data?.id;

  const response = await api.reportFilter.fetchReportFilters({
    report_id: record_id!,
    entity: "report_filter",
    pluck: ["report_id", "field", "values", "operator", "id", "type"],
  });

  return (
    <div className="space-y-2">
      <ReportFiltersForm
        defaultValues={{
          filters: response.data.length
            ? response.data
            : [
                {
                  id: ulid(),
                  type: "criteria",
                  field: "",
                  values: "",
                  operator: "",
                  report_id: record_id,
                },
              ],
        }}
        params={{
          id: record_id!,
          shell_type: application! as "record" | "wizard",
          entity: "report_filter",
          navigation: {
            wizard_step: "3",
            record_tab: "report_filters",
          },
        }}
      />
    </div>
  );
};

export default ReportFilters;
