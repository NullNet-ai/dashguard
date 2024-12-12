/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { api } from "~/trpc/server";
import { headers } from "next/headers";
import ConfirmationTags from "./client";
const WizardContainer = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , application, identifier] = pathname.split("/");

  const response = await api.booking.getByCode({
    code: identifier!,
    pluck_fields: ["id", "tags"],
  });
  const tags = response?.data?.tags?.map(
    (tag: { label: string; value: string }) => ({
      label: tag,
      value: tag,
    }),
  );

  const defaultValues = { ...response?.data, tags };
  return (
    <div className="space-y-2">
      <ConfirmationTags
        defaultValues={defaultValues}
        params={{
          id: response?.data?.id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default WizardContainer;
