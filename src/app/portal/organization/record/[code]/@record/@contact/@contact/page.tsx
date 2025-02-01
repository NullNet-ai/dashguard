import { api } from "~/trpc/server";
// import Grid from "~/components/platform/Grid/Server";

import { headers } from "next/headers";
// import gridColumns, {
//   TO_HIDE_COLUMNS_WHEN_MOBILE,
// } from "~/app/portal/contact/grid/_config/columns";
import NewComingSoon from "~/app/coming-soon";

export default async function Page() {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , , identifier] = pathname.split("/");
  const _pluck = [
    "id",
    "code",
    "categories",
    "organization_id",
    "first_name",
    "middle_name",
    "last_name",
    "email_address",
    "status",
    "created_date",
    "updated_date",
    "created_time",
    "updated_time",
  ];

  // ! JOIN AVAILABLE KINDLY USE and Transform the data ( Map Reduce)
  // const { items = [], totalCount } = await api.contact.mainGrid({
  //   current: 0,
  //   limit: 100,
  //   entity: "contact",
  //   pluck: _pluck,
  //   advance_filters: [
  //     {
  //       field: "organization_id",
  //       operator: EOperator.EQUAL,
  //       values: [identifier!],
  //       type: "criteria",
  //     },
  //   ],
  // });

  return (
    // <Grid
    //   totalCount={totalCount || 0}
    //   data={items}
    //   config={{
    //     entity: "contact",
    //     title: "Contacts",
    //     columns: gridColumns,
    //     hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
    //     // disableDefaultAction: true,
    //   }}
    // />
    <NewComingSoon type="inner-component"/>
  );
}
