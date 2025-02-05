"use client";
import { useMemo } from "react";
import useRefetchRecord from "../hooks/useFetchMainRecord";
import { api } from "~/trpc/react";
import { formatPhoneNumber } from "~/utils/formatter";
import { cn } from "~/lib/utils";
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';

const fields = {
  Category: "categories",
  "Primary Phone Number": "phone",
  "Primary Email": "email",
  "Full Name": "full_name",
  "Date of Birth": "date_of_birth",
  Address: "address",
  Organization: "organization",
  Role: "role",
};

const RecordShellSummary = ({
  form_key,
  identifier,
}: {
  form_key: string;
  identifier: string;
  main_entity: string;
}) => {
  const {
    data: record = { data: { id: null } },
    refetch: refetchPhoneAndEmail,
    error: _error,
  } = api.contact.fetchContactPhoneEmail.useQuery({
    code: identifier!,
    pluck_fields: ["id"],
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

  const {
    data,
    refetch: refetchContactDetails,
    error,
  } = api.contact.getContactWithAddress.useQuery({
    code: identifier!,
    pluck_fields: [
      "id",
      "categories",
      "first_name",
      "last_name",
      "middle_name",
      "date_of_birth",
      "address_id",
    ],
  });

  const {
    data: org_record = {
      data: {
        organizations: [],
        user_roles: [],
      },
    },
    refetch: refetchOrg,
  } = api.organizationContact.fetchOrganizations.useQuery({
    code: identifier!,
  });

  const { organizations, user_roles } = org_record?.data || {};

  const categories = data?.categories || [];

  const record_details = {
    ...data,
    categories: categories.length
      ? categories
      : null,
    full_name:
      `${data?.first_name || ""} ${data?.middle_name || ""} ${data?.last_name || ""}`.trim() ||
      "None",
    phone,
    email,
    organization: organizations?.length
      ? organizations
        .sort(
          (
            a: {
              label: string;
            },
            b: {
              label: string;
            },
          ) => a.label.localeCompare(b.label),
        )
        .map(({ label }: { label: string }) => label)
        .join(", ")
      : "None",
    role: user_roles?.length
      ? user_roles
        .sort((a, b) => a.label.localeCompare(b.label))
        .map(({ label }: { label: string }) => label)
        .join(", ")
      : "None",
  };

  const refetchAll = async () => {
    await refetchPhoneAndEmail();
    await refetchContactDetails();
  };

  useRefetchRecord({
    refetch: refetchAll,
    form_key,
  });

  useRefetchRecord({
    refetch: refetchOrg,
    form_key: "organization_details",
  });
  if (_error) {
    return <div>Error: {_error.message}</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {Object.entries(fields).map(([key, value], index) => {
        const fieldValue = (record_details as { [key: string]: any })?.[value];
        if (value === "categories" && !fieldValue) {
          return null;
        }
        return (
          <div className={cn(`${index !== 0 ? 'pt-[4px]' : ''}`)} key={index}>
            <div className="px-5">
              <div className="p-1 text-sm">
                <div>
                  <span className="text-slate-400">{key}: </span>
                  {value === "categories" ? (
                    <div className='inline-flex gap-2 p-1'>{fieldValue.map((category: string) => (
                      <Badge variant={"primary"} className='' key={category}>{category}</Badge>
                    ))}</div>
                  ) : (
                    <span>{fieldValue || "None"}</span>
                  )}
                </div>
              </div>
            </div>
            {value === "categories" && fieldValue && <Separator />}
          </div>
        );
      })}
    </div>
  );
};

export default RecordShellSummary;
