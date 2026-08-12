"use client";

import { api } from "~/trpc/react";
import useRefetchRecord from "../hooks/useFetchMainRecord";
import { RecordWrapperContext } from '~/components/platform/Record/providers/RecordWrapperProvider';
import { useContext } from 'react';
import { CardComponent as Card } from '~/components/ui/card/index';
import { Separator } from '~/components/ui/separator';

const fields = {
  Name: "name",
};

const RecordShellSummary = ({
  form_key,
  identifier,
}: {
  form_key: string;
  identifier: string;
  main_entity: string;
}) => {
  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.organization.getOrgSummary.useQuery({
    code: identifier!,
    pluck_fields: ["id", "name"],
  });

  const { data } = record ?? {};


  const { isCollapseRecordSummary } =
  useContext(RecordWrapperContext);

  useRefetchRecord({
    refetch,
    form_key,
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if(isCollapseRecordSummary) return null

  return (
    <Card className='p-3'>
      <div className="flex flex-col gap-1">
        <div>
          <span className="text-md font-medium text-foreground">
            Organization Details
          </span>
        </div>
        <Separator />
        {Object.entries(fields).map(([key, value], index) => (
          <div className="flex justify-between gap-2 text-sm" key={index}>
            <span className="text-slate-400 whitespace-nowrap">{key} </span>
            <span className='break-all text-slate-700'>
              {(data as { [key: string]: any })?.[value] || "None"}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecordShellSummary;
