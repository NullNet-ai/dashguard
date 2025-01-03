"use client";
import { useMemo } from "react";
import useRefetchRecord from "../hooks/useFetchMainRecord";
import { api } from "~/trpc/react";
import { formatPhoneNumber } from "~/utils/formatter";

const BasicDetailsSummary = ({
  form_key,
  identifier,
}: {
  form_key: string;
  identifier: string;
}) => {
  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.contact.fetchContactPhoneEmail.useQuery({
    code: identifier!,
    pluck_fields: [],
  });
  const { emails: _email, phones: _phone } = record as unknown as Record<
    string,
    any
  >;

  const email = useMemo(() => {
    const primary_email = _email?.find(
      ({ is_primary }: { is_primary: boolean }) => is_primary,
    );
    return primary_email?.email || "None";
  }, [_email]);

  const phone = useMemo(() => {
    const primary_phone = _phone?.find(
      ({ is_primary }: { is_primary: boolean }) => is_primary,
    );
    const { raw_phone_number, iso_code } = primary_phone || {};
    const format_phone = formatPhoneNumber({
      raw_phone_number,
      iso_code,
    });
    return format_phone || "None";
  }, [_phone]);

  useRefetchRecord({
    refetch,
    form_key,
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <p className="mb-[15px]">
        <strong> Phone Number: </strong>
        &nbsp; {phone}
      </p>
      <p>
        <strong> Email: </strong>
        &nbsp; {email}
      </p>
    </div>
  );
};

export default BasicDetailsSummary;
