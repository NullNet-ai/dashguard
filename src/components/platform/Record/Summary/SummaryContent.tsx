import React from "react";

import IdentifierComponent from "./Header/IdentifierComponent";
import SummaryRecordTab from "./Header/SummaryTab";
import ProfileImage from "./Header/ProfileImage";
import SystemDates from "./Header/SystemDate";
import { headers } from "next/headers";
import { api } from "~/trpc/server";
import { Separator } from "~/components/ui/separator";
import moment from "moment";

const RecordSummaryContent = async () => {
  const headerList = headers();

  const pathname = headerList.get("x-pathname") || "";
  const [, , mainEntity, , identifier] = pathname.split("/");

  const recordDetails =
    mainEntity === "devices" || mainEntity === "device"
      ? await api.device.getByCodeWithJoin({
          id: identifier!,
          pluck_fields: [
            "id",
            "code",
            "first_name",
            "last_name",
            "status",
            "created_date",
            "created_time",
            "updated_date",
            "updated_time",
            "categories",
            "updated_by",
            "created_by",
            "categories"
          ],
          main_entity: mainEntity!,
        })
      : await api.record.getByCodeWithJoin({
          id: identifier!,
          pluck_fields: [
            "id",
            "code",
            "first_name",
            "last_name",
            "status",
            "created_date",
            "created_time",
            "updated_date",
            "updated_time",
            "categories",
            "updated_by",
            "created_by",
          ],
          main_entity: mainEntity!,
        });

  if (recordDetails?.status_code === 500) {
    throw recordDetails.message;
  }

  const formatted_created_date = moment(recordDetails?.data?.created_date).format('YYYY/MM/DD') || ''
  const formatted_updated_date = moment(recordDetails?.data?.updated_date).format('YYYY/MM/DD') || ''

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
        created_date={formatted_created_date!}
        created_time={recordDetails?.data?.created_time!}
        updated_date={formatted_updated_date!}
        updated_time={recordDetails?.data?.updated_time!}
        created_by_first_name={
          recordDetails?.data?.created_by_data?.first_name || ""
        }
        created_by_last_name={
          recordDetails?.data?.created_by_data?.last_name || ""
        }
        updated_by_first_name={
          recordDetails?.data?.updated_by_data?.first_name || ""
        }
        updated_by_last_name={
          recordDetails?.data?.updated_by_data?.last_name || ""
        }
      />
      <Separator />
    </div>
  );
};

export default RecordSummaryContent;
