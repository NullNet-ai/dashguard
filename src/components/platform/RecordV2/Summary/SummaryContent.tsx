import React from "react";

import IdentifierComponent from "./Header/IdentifierComponent";
import SummaryRecordTab from "./Header/SummaryTab";
import ProfileImage from "./Header/ProfileImage";
import SystemDates from "./Header/SystemDate";
import { headers } from "next/headers";
import { api } from "~/trpc/server";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";

const RecordSummaryContent = async () => {
  const headerList = headers();

  const pathname = headerList.get("x-pathname") || "";
  const [, , mainEntity, , identifier] = pathname.split("/");

  const recordDetails = await api.record.getByCode({
    id: identifier!,
    pluck_fields: [
      "id",
      "code",
      "name",
      "status",
      "created_date",
      "created_time",
      "updated_date",
      "updated_time",
      "categories",
    ],
    main_entity: mainEntity!,
  });

  if (recordDetails?.status_code === 500) {
    throw recordDetails.message
  }

  return (
    <div className="">
      {/* <Separator /> */}
      <IdentifierComponent
        code={recordDetails?.data?.code!}
        status={recordDetails?.data?.status!}
      />
      <SummaryRecordTab />
      <ProfileImage />
      <SystemDates
        created_date={recordDetails?.data?.created_date!}
        created_time={recordDetails?.data?.created_time!}
        updated_date={recordDetails?.data?.updated_date!}
        updated_time={recordDetails?.data?.updated_time!}
        created_by_first_name={recordDetails?.data?.created_by_data?.first_name || ''}
        created_by_last_name={recordDetails?.data?.created_by_data?.last_name || ''}
        updated_by_first_name={recordDetails?.data?.updated_by_data?.first_name || ''}
        updated_by_last_name={recordDetails?.data?.updated_by_data?.last_name || ''}
      />
            <Separator />
      <div className=" p-2 px-4 text-sm">
        <div className="mb-2 px-2">
          <span className="text-slate-400">Category</span>
          <div>
          {
            recordDetails && recordDetails.data?.categories?.map((e: string) => {
              return <Badge key={e} className="m-1" variant="primary">{e}</Badge>
            })
          }

          </div>
        </div>
      </div>
        <Separator />
    </div>
    
  );
};

export default RecordSummaryContent;
