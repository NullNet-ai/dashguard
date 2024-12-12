"use client";

import { type DefaultRowActions } from "~/components/platform/Grid/types";
import { Button } from "~/components/ui/button";

export default function EditComponent({ row, config }: DefaultRowActions) {
  // You can use useQuery, useMutation, useQueryClient, useToast, etc. here
  return (
    <Button
      disabled={true}
      type="button"
      className="flex w-full text-start"
      variant={"ghost"}
      onClick={() => {
        console.info("Edit");
      }}
    >
      Edit
    </Button>
  );
}
