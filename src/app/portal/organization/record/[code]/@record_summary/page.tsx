import RecordSummary from "~/components/platform/Record/Summary/RecordSummary";
import { headers } from "next/headers";
import RecordShellSummary from "./_1";

export default async function Page() {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, , identifier] = pathname.split("/");

  return (
    <div>
      <RecordSummary />
      <RecordShellSummary
        form_key={"organization_basic_details"}
        identifier={identifier!}
        main_entity={main_entity!}
      />
    </div>
  );
}
