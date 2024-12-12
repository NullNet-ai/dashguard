import { api } from "~/trpc/server";
import { headers } from "next/headers";
import CertificationDetails from "./client";
import { ulid } from "ulid";

const empty_cert_val = {
  certificate_name: "",
  institution: "",
  issued_on_date: "",
  expiration_date_date: "",
};

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const contact = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id"],
  });

  const { id: contact_id } = contact?.data || {};

  const response = await api.contactCertificate.get({
    contact_id,
  });

  const defaultValues = response?.length
    ? response
    : [
        {
          id: ulid(),
          ...empty_cert_val,
        },
      ];

  return (
    <div className="space-y-2">
      <CertificationDetails
        defaultValues={{
          certifications: defaultValues,
        }}
        params={{
          id: contact_id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default FormServerFetch;
