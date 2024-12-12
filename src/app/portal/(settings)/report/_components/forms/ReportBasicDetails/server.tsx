import { api } from "~/trpc/server";
import ReportBasicDetailsForm from "./client";
import { headers } from "next/headers";

const ReportBasicDetails = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const response = await api.report.getByCode({
    // id: identifier!,
    code: identifier!,
    pluck_fields: ["id", "entity_name", "report_name"],
  });

  const defaultValues = response?.data;
  return (
    <div className="space-y-2">
      <ReportBasicDetailsForm
        defaultValues={{
          entity_name: defaultValues?.entity_name || "",
          report_name: defaultValues?.report_name || "",
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

export default ReportBasicDetails;
