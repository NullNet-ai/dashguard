import RecordSummary from "~/components/platform/RecordV2/Summary/RecordSummary";
import RecordShellSummary from "../../_components/record-shell-summary";
import { headers } from "next/headers";
import { api } from "~/trpc/server";
import { formatPhoneNumber } from "~/utils/formatter";

export default async function Page() {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , , identifier] = pathname.split("/");

  const record_details = await api.contact.fetchContactPhoneEmail({
    code: identifier!,
    pluck_fields: ["id", "first_name", "last_name", "categories"],
  });

  const { categories, first_name, last_name, email, phone } = record_details;

  const full_name = `${first_name} ${last_name}`;

  const _categories = categories
    .filter((cat: string) => cat !== "Contact")
    .join(", ");

  const _email = email?.find(
    ({ is_primary }: { is_primary: boolean }) => is_primary,
  );

  const _phone = phone?.find(
    ({ is_primary }: { is_primary: boolean }) => is_primary,
  );

  const { raw_phone_number, iso_code } = _phone || {};
  const format_phone = formatPhoneNumber({
    raw_phone_number,
    iso_code,
  });
  return (
    <div>
      <RecordSummary />
      <RecordShellSummary
        email={_email?.email}
        phone={format_phone}
        full_name={full_name}
        categories={_categories}
      />
    </div>
  );
}
