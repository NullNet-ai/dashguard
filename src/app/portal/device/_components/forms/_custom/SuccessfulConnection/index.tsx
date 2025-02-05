import { CheckIcon, PlusIcon } from "lucide-react";
import React from "react";
import { Fragment } from "react";
import { type UseFormReturn } from "react-hook-form";
import { FormField } from "~/components/ui/form";
import { FirewallChart } from "../../../charts/FirewallChart";
import { Alert, AlertContent, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

interface ISuccessfulConnectionDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  selectOptions?: Record<string, any>;
}

export default function CustomSuccessfulConnectionDetails({
  form,
}: ISuccessfulConnectionDetails) {
  return (
    <Fragment>
      <FormField
        name="SuccessfulConnection"
        control={form.control}
        render={() => {
          return (
            <div className="flex flex-col gap-2">
              {
                <Alert dismissible variant={"success"} className="pb-2">
                  <AlertContent className="">
                    Firewall Connected Successfully!
                  </AlertContent>
                </Alert>
              }

              <FirewallChart />
            </div>
          );
        }}
      />
    </Fragment>
  );
}
