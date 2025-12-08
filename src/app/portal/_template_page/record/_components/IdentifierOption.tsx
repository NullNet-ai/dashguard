"use client";

import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { useToast } from "~/context/ToastProvider";
import { api } from "~/trpc/react";

export default function Options({ identifier }: { identifier: string }) {
  const toast = useToast();

  // TODO: Replace 'template' with your actual entity name
  const fetched_record = api.record.getByCode.useQuery({
    main_entity: "template", // TODO: Change this to your entity name
    id: identifier!,
    pluck_fields: ["id", "code"],
  });
  const record_id = fetched_record?.data?.data?.id;
  
  // TODO: Add your mutation here
  // const changeRecordStatus = api.template.updateTemplateStatus.useMutation();

  const handleChangeStatus = async (status: string) => {
    try {
      // TODO: Implement your status change logic here
      // const response = await changeRecordStatus.mutateAsync({
      //   id: record_id!,
      //   status: status,
      // });
      // toast.success("Status changed successfully.");
      // return response;
    } catch (error) {
      toast.error("Failed to change status.");
    }
  };
  
  return (
    <>
      <DropdownMenuLabel>Change Status</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {/* TODO: Add your status options here */}
      <DropdownMenuItem onClick={() => handleChangeStatus("Active")}>
        Active
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => handleChangeStatus("Inactive")}>
        Inactive
      </DropdownMenuItem>
      <DropdownMenuSeparator />
    </>
  );
}