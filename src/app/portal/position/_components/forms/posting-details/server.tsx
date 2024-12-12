import { api } from "~/trpc/server";
import { ulid } from "ulid";
import PostingDetailsForm from "./client";
import { headers } from "next/headers";

const PostingDetails = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const code_details = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id"],
  });
  const record_id = code_details?.data?.id;
  const fetched_postings = await api.positionPosting.getPostingsByPositionId({
    position_id: record_id!,
    pluck_fields: ["id", "position_id", "posting_site", "posting_link"],
  });

  const defaultValues = fetched_postings?.length
    ? fetched_postings
    : [
        {
          id: ulid(),
          position_id: record_id!,
          position_site: "",
          posting_link: "",
        },
      ];
  return (
    <div className="space-y-2">
      <PostingDetailsForm
        defaultValues={{
          postings: defaultValues,
        }}
        selectOptions={{}}
        params={{
          id: record_id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default PostingDetails;
