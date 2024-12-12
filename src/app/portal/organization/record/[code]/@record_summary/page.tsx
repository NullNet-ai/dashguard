import RecordSummary from "~/components/platform/RecordV2/Summary/RecordSummary";
import RecordShellSummary from "../../_components/RecordShellSummary";
import { headers } from "next/headers";
import { api } from "~/trpc/server";

export default async function Page() {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, , identifier] = pathname.split("/");

  const record_details = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: [
      "name",
    ],
  });

  return (
    <div>
      <RecordSummary />
      <RecordShellSummary name={record_details?.data?.name} />
    </div>
  );
}
