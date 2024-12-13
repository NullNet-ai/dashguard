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

  const fetched_contact = api.record.getByCode.useQuery({
    main_entity: "contact",
    id: identifier!,
    pluck_fields: ["id", "code"],
  });
  const contact_id = fetched_contact?.data?.data?.id;
  // const changeContactStatus = api.contact.updateContactStatus.useMutation();

  const handleChangeStatus = async (status: string) => {
    try {
      // const response = await changeContactStatus.mutateAsync({
      //   id: contact_id!,
      //   contact_status: status,
      // });
      // toast.success("Status changed sucessfully.");
      // return response;
    } catch (error) {
      toast.error("Failed to change status.");
    }
  };
  return (
    <>
      <DropdownMenuLabel>Change Status</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => handleChangeStatus("Screening")}>
        Screening
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => handleChangeStatus("Assessment Test")}>
        Assessment Test
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => handleChangeStatus("Interview")}>
        Interview
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => handleChangeStatus("Pending")}>
        Pending
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => handleChangeStatus("Hired")}>
        Hired
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => handleChangeStatus("Failed")}>
        Failed
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => handleChangeStatus("On Hold")}>
        On Hold
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => handleChangeStatus("Job Offered")}>
        Job Offered
      </DropdownMenuItem>
      <DropdownMenuSeparator />
    </>
  );
}
