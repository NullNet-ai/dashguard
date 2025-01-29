import { api } from "~/trpc/server";
import { headers } from "next/headers";
import DeviceBasicDetails from "./client";

const model_options = ["PfSense", "OpenSense"].map((model) => ({
  label: model,
  value: model,
}));

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const fetched_device = await api.device.fetchBasicDetails({
    code: identifier!,
  });

  const group_options = await api.deviceGroupSettings.getDeviceGroupSettings();

  const defaultValues = fetched_device?.data;

  return (
    <div className="space-y-2">
      <DeviceBasicDetails
        defaultValues={defaultValues ?? {}}
        selectOptions={{
          model: model_options,
          grouping: group_options,
        }}
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
