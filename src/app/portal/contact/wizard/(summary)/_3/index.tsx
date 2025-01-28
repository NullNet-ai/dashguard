"use client";
import { usePathname } from "next/navigation";
import useRefetchRecord from "../hooks/useFetchMainRecord";
import { api } from "~/trpc/react";

const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname();
  const [, , entity, _, identifier] = pathName.split("/");
  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.record.getByCode.useQuery({
    main_entity: entity!,
    id: identifier!,
    pluck_fields: ["id", "code", "categories"],
  });

  const { data } = record || {};
  const { categories } = data || {};
  const filtered_categories = categories?.filter(
    (category: string) => category !== "Contact",
  );

  useRefetchRecord({
    refetch,
    form_key,
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <p className="mb-[8px] no-underline">
        <strong> Category: </strong>
        &nbsp;{" "}
        {filtered_categories?.length ? filtered_categories.join(", ") : "None"}
      </p>
    </div>
  );
};

const SummaryConfig = {
  label: "Step 3",
  required: true,
  show_summary: true,
  components: [
    {
      label: "Category Details",
      component: <Summary form_key={"ContactCategoryDetails"} />,
    },
  ],
};
export default SummaryConfig;
