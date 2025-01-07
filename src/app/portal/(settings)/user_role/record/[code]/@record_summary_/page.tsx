import RecordSummary from "~/components/platform/Record/Summary/RecordSummary";
import RecordShellSummary from "../../_components/record-shell-summary";
import { headers } from "next/headers";
import { api } from "~/trpc/server";

export default async function Page() {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, , identifier] = pathname.split("/");

  const record_details = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "role"],
  });

  const { role } = record_details?.data;
  return (
    <div>
      <RecordSummary />
      <RecordShellSummary role={role} />
    </div>
  );
}
