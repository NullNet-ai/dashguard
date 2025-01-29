"use client";

import { ArchiveIcon } from "lucide-react";
import { type DefaultRowActions } from "~/components/platform/Grid/types";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export default function ArchiveComponent({
  setOpen,
  setRecord,
  record,
  row,
  config,
}: DefaultRowActions) {
  if (!row.id) return null;
  const { data } = api.organization.getOrgWithContact.useQuery({
    id: row.id ?? "",
    pluck_fields: ["contact_organization_id"],
  });
  const shouldDisplayArchiveWarningPrompt =
    data?.contact_organization_id === row.id;

  if (data?.contact_organization_id !== row?.id || row?.original?.disabled)
    return null;
  // ang component ang e null
  const handleOpenButton = () => {
    setOpen && setOpen(true);

    if (data?.contact_organization_id === row?.id) {
      setOpen && setOpen(true);
      setRecord &&
        setRecord({
          ...record,
          original: {
            ...row.original,
            shouldDisplayArchiveWarningPrompt,
          },
        });
      //   // if (data) {
      //   //   setOpen && setOpen(true);
      //   // }
      //   // setOpen && setOpen(false);
    }
  };
  return (
    <Button
      onClick={() => {
        handleOpenButton();
      }}
      variant={"ghost"}
      className="hover:bg-transparent"
    >
      <ArchiveIcon
        className={`h-3 w-3 ${row.original.disabled ? "bg-gray:300 opacity-50" : "text-destructive"}`}
      />
    </Button>
  );
}
