"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ulid } from "ulid";
import { z } from "zod";
import { ISearchItem } from "~/components/platform/Grid/Search/types";
import { ContactPhoneEmailSchema } from "~/server/zodSchema/contact/contactPhoneEmail";
import { api } from "~/trpc/server";
import { defaultSorting } from "../../../grid/_config/sorting";
import { getGridCacheData } from "~/lib/grid-get-cache-data";

const defaultAdvanceFilter = [
  {
    entity: "contacts",
    operator: "equal",
    type: "criteria",
    field: "status",
    id: ulid(),
    label: "Status",
    values: ["Active"],
    default: true,
  },
  {
    operator: "or",
    type: "operator",
    default: true,
  },
  {
    entity: "contacts",
    operator: "equal",
    type: "criteria",
    field: "status",
    id: ulid(),
    label: "Status",
    values: ["Draft"],
    default: true,
  },
] as ISearchItem[];

export const saveContactDetails = async (
  data: z.infer<typeof ContactPhoneEmailSchema>,
) => {
  const response = await api.contact.saveContactPhoneEmail(data);

  if (response?.existing) {
    return response;
  }
  return response;
};

export const selectRecord = async (rows: any[]) => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, portal, mainEntity] = pathname.split("/");
  const currentContext = "/" + portal + "/" + mainEntity;
  await api.tab.closeCurrentInnerClassTab({
    href: pathname,
    current_context: currentContext,
  });
  redirect(`/portal/${mainEntity}/wizard/${rows?.[0]?.code}/1`);
};

export const removeRecord = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, portal, mainEntity] = pathname.split("/");
  const currentContext = "/" + portal + "/" + mainEntity;
  await api.tab.closeCurrentInnerClassTab({
    href: pathname,
    current_context: currentContext,
  });
  redirect(`/portal/${mainEntity}/wizard/new/1`);
};

export const closeCurrentInnerClassTab = async ({ code }: { code: string }) => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, portal, mainEntity] = pathname.split("/");
  const currentContext = "/" + portal + "/" + mainEntity;

  await api.tab.closeCurrentInnerClassTab({
    href: pathname,
    current_context: currentContext,
  });

  redirect(`/portal/contact/wizard/${code}/1`);
};

export const fetchRecords = async ({
  advance_filters = [],
  pluck_fields,
}: {
  pluck_fields: string[];
  advance_filters: {
    type: string;
    operator: string;
    values?: string[] | undefined;
    entity?: string | undefined;
    field?: string | undefined;
  }[];
}) => {
  const { sorting } = (await getGridCacheData()) ?? {};
  const { items = [], totalCount } = await api.contact.mainGrid({
    current: 0,
    limit: 100,
    entity: "contact",
    pluck: pluck_fields,
    sorting: sorting?.length ? sorting : defaultSorting,
    advance_filters: advance_filters?.length
      ? advance_filters
      : defaultAdvanceFilter,
  });
  return {
    items,
    totalCount,
  };
};
