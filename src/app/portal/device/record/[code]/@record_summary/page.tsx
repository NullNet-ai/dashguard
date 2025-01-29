import RecordSummary from "~/components/platform/Record/Summary/RecordSummary";
import RecordShellSummary from "./_1";
import { headers } from "next/headers";

export default function Page() {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, , identifier] = pathname.split("/");
  return (
    <div>
      <RecordSummary />
      <RecordShellSummary
        form_key={"setup_details"}
        identifier={identifier!}
        main_entity={main_entity!}
      />
    </div>
  );
}
