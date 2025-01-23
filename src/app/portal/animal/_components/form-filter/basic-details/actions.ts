"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

const entity = "";

export const saveContactDetails = async (data: any, action_type?: string) => {
  // @ts-expect-error - Fix type later
  const response = await api[entity].saveContactPhoneEmail(data);

  if (response?.existing) {
    return response;
  }
  return response;
};

// @ts-expect-error - Fix type later
export const selectRecord = async (rows: any[], main_entity_id: string, filter_entity: string, selectedRecord) => {
  // @ts-expect-error - Fix type later
  const response = await api[entity].saveContactPhoneEmail({
    id: main_entity_id,
    [filter_entity]: [
      {
        ...rows[0],
        [`${entity}_id`]: main_entity_id,
        is_primary: true,
      },
    ],
    form_filter_entity: filter_entity,
  });
  if (selectedRecord) {
    // @ts-expect-error - Fix type later
    await api[entity].saveContactPhoneEmail({
      id: main_entity_id,
      [filter_entity]: [
        {
          ...selectedRecord,
          [`${entity}_id`]: null,
          is_primary: false,
        },
      ],
      form_filter_entity: filter_entity,
    });
  }

  if (response?.existing) {
    return response;
  }
  return response;
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
