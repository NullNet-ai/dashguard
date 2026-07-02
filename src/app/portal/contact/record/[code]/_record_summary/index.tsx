import { headers } from "next/headers";
import RecordSummary from "~/components/platform/Record/Summary/RecordSummary";
import RecordShellSummary from "./_1";
import RecordContactBadge from '../_components/RecordContactBadge';
import ResetPasswordAction from '../_components/ResetPasswordAction';

interface RecordSummaryProps {
  image_placeholder?: string;
}

export default async function Page({ image_placeholder }: RecordSummaryProps) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, , identifier] = pathname.split("/");

  return (
    <div className='flex flex-col gap-2 md:pr-0'>
      <ResetPasswordAction contact_code={identifier!} />
      <RecordSummary image_placeholder={image_placeholder} is_show_header_tab={true}>
        <RecordContactBadge form_key="contact_details" />
      </RecordSummary>
      <RecordShellSummary
        form_key={"contact_details"}
        identifier={identifier!}
        main_entity={main_entity!}
      />
    </div>
  );
}