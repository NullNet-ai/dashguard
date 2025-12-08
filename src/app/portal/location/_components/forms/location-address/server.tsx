import { api } from "~/trpc/server";
import { headers } from "next/headers";
import BasicDetails from "./client";
import { ulid } from 'ulid';

const LocationAddressServer = async () => {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const record = await api.location.getLocationAddress({
    main_entity: main_entity!,
    id: identifier!,
  });
  const defaultValues = {
    location_id : record?.data?.[0]?.locations?.id,
    address_id: record?.data?.[0]?.locations?.address_id || ulid(),
    details : record?.data?.[0]?.addresses ?? {}
  };
  return (
    <div className="space-y-2">
      <BasicDetails
        defaultValues={defaultValues ?? {}}
        params={{
          id: defaultValues?.location_id,
          shell_type: application! as "record" | "wizard",
          entity: main_entity,
        }}
      />
    </div>
  );
};

export default LocationAddressServer;
