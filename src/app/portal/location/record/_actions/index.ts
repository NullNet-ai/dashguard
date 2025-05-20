"use server";

import { TStatus } from "./types";

const handleChangeStatus = (
  status: TStatus,
  recordId: string,
  entityName: string,
) => {
  try {
    // const response = await changeContactStatus.mutateAsync({
    //   id: contact_id!,
    //   contact_status: status,
    // });
    // toast.success("Status changed sucessfully.");
    // return response;
  } catch (error) {
    // toast.error("Failed to change status.");
  }
};

export { handleChangeStatus };
