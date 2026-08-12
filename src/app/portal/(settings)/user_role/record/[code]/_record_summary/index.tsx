import { headers } from "next/headers";
import RecordSummary from "~/components/platform/Record/Summary/RecordSummary";
import RecordShellSummary from "./_1";
import RecordContactBadge from '../_components/RecordContactBadge';

export default async function Page() {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, , identifier] = pathname.split("/");

  return (
    <div className='flex flex-col gap-2 md:pr-0'>
      <RecordSummary>
        <RecordContactBadge
          form_key="UserRolesBasicDetails"
          identifier={identifier!}
          main_entity={main_entity!}
        />
      </RecordSummary>
      <RecordShellSummary
        form_key={"UserRolesBasicDetails"}
        identifier={identifier!}
        main_entity={main_entity!}
      />
    </div>
  );
}
