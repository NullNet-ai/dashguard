/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { api } from "~/trpc/server";
import { headers } from "next/headers";
import Confirmation from "./client";
const WizardContainer = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const response = await api.record.getByCode({
    id: identifier!,
    pluck_fields: ["id", "tags"],
    main_entity: main_entity!,
  });

  const record_id = response?.data?.id;
  const tags = response?.data?.tags?.map(
    (tag: { label: string; value: string }) => ({
      label: tag,
      value: tag,
    }),
  );

  const defaultValues = { ...response?.data, tags };

  return (
    <div className="space-y-2">
      <Confirmation
        defaultValues={defaultValues}
        params={{
          id: record_id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default WizardContainer;
