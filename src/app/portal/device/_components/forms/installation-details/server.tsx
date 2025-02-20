import { api } from "~/trpc/server";
import { headers } from "next/headers";
import InstallationDetails from "./client";
import { getActualDownloadURL } from "~/app/api/device/get_actual_download_url";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const fetched_user_role = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "code"],
  });
  const defaultValues = fetched_user_role?.data;
  const download_url = await api.device.fetchDownloadURL({})
  
  return (
    <div className="space-y-2">
      <InstallationDetails
        defaultValues={{...defaultValues, download_url}}
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
