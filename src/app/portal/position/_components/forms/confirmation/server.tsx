/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { api } from "~/trpc/server";
import { headers } from "next/headers";
import ConfirmationForm from "./client";
const Confirmation = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const response = await api.record.getByCode({
    id: identifier!,
    main_entity: main_entity!,
    pluck_fields: ["id", "tags"],
  });
  const tags = response?.data?.tags?.map(
    (tag: { label: string; value: string }) => ({
      label: tag,
      value: tag,
    }),
  );
  const record_id = response?.data?.id;
  const defaultValues = { ...response?.data, tags };
  return (
    <div className="space-y-2">
      <ConfirmationForm
        defaultValues={defaultValues}
        params={{
          id: record_id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default Confirmation;
