"use client";

import React, { useContext, useEffect, useState } from "react";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { z } from "zod";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types/global/interfaces";
import { type IFormProps } from "../types";
import CustomConfirmationDetails from "../_custom/Confirmation";
import CustomSuccessfulConnectionDetails from "../_custom/SuccessfulConnection";
import { WizardContext } from "~/components/platform/Wizard/Provider";
import { CheckIcon } from "@heroicons/react/20/solid";
import { api } from "~/trpc/react";

const FormSchema = z.object({
  connection: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional(),
});
const Confirmation = ({ params, defaultValues }: IFormProps) => {
  const { actions } = useContext(WizardContext);
  const [loading, setLoading] = useState(true);

  const fetchConnectionStatus = api.device.fetchDeviceConnectionStatus.useQuery(
    {
      id: params.id,
    },
  );

  const updateConnectionStatus =
    api.device.updateDeviceConnectionStatus.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    actions?.setCallback({
      customizeWizardButtonSave: {
        label: "Finish",
        icon: <CheckIcon className="h-6 w-4 text-secondary" />,
        disableDropdown: true,
        disabled: loading,
        dropdownOptions: [],
      },
    });
  }, [loading]);

  useEffect(() => {
    if(loading) return 
    //This is a temporary solution to simulate the connection establishment
    const interval = setInterval(async () => {
      const { data } = await fetchConnectionStatus.refetch();
      const { is_connection_established = false } = data || {};

      if (is_connection_established) {
        setLoading(false);
      }
    }, 2000);

    // setTimeout(() => {
    //   updateConnectionStatus.mutate({
    //     id: params.id,
    //   });
    // }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <FormBuilder
      defaultValues={defaultValues}
      formSchema={FormSchema}
      myParent={params.shell_type}
      formProps={params}
      handleSubmit={handleSave}
      customDesign={{
        formClassName: "lg:grid-cols-1 grid-cols-1",
      }}
      formLabel="Confirmation"
      formKey="confirmation"
      fields={[]}
      customRender={(form) => (
        <>
          {loading ? (
            <CustomConfirmationDetails form={form} />
          ) : (
            <CustomSuccessfulConnectionDetails form={form} />
          )}
        </>
      )}
    />
  );
};

export default Confirmation;
