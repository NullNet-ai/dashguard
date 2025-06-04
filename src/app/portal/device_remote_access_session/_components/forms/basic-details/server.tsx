"use server"
import { api } from "~/trpc/server";
import { headers } from "next/headers";
import BasicDetails from "./client";


const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const record = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "code", "device_id", "remote_access_type"],
  });
  const defaultValues = record?.data;

  const devices = await api.deviceRemoteAccessSession.fetchDevices({
    limit: 100
  })

  return (
    <div className="space-y-2">
      <BasicDetails
        defaultValues={defaultValues ?? {}}
        selectOptions={devices}
        params={{
          id: defaultValues?.id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity,
        }}
      />
    </div>
  );
};

export default FormServerFetch;
