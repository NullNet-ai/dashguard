"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "../types";
import { api } from "~/trpc/react";

const FormSchema = z.object({
  device_id: z.string({message: "Device is required"}).min(1, {message: "Device is required"}),
  remote_access_type: z.string({message: "Connection Type is required"}).min(1, {message: "Connection Type is required"}),
})

export default function RemoteAccessDetails(props: IFormProps) {
  const { record_data } = props;
  const toast = useToast();
  const createUpdate = api.deviceRemoteAccessSession.createUpdateDeviceRemoteAccessSessions.useMutation();

  const { data: devices } = api.deviceRemoteAccessSession.fetchDevices.useQuery({
    limit: 100
  })

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const { device_id, remote_access_type } = data;
      
      const res = await createUpdate.mutateAsync({
        id: record_data?.id || '',
        device_id,
        remote_access_type,
        category: remote_access_type.toLowerCase() === "console" ? "Console" : "Web",
      });
      if(res.status_code == 200) {
        toast.success("Remote Access submitted successfully");
        if(remote_access_type.toLowerCase() == "console") {
        window.open("http://localhost:3000/terminal", "_blank");
        } else {
          window.open("http://wallguard.nullnetqa.net:4444/", "_blank");
        }

      }
    } catch (error) {
      toast.error("Failed to submit Remote Access");
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-2 gap-4',
      }}
      myParent={`wizard`}
      formProps={record_data}
      formLabel="Remote Access"
      handleSubmit={handleSave}
      formKey="formlabel"
      formSchema={FormSchema}
      defaultValues={record_data}
      fields={[
        {
        id: "",
        formType: "space",
        name: "",
        label: "",
        description: "Field Description",
        placeholder: "Enter value...",
        fieldClassName: "",
        fieldStyle: {}
        },
        {
        id: "field_1744432010535",
        formType: "space",
        name: "field_1744432010535",
        label: "New Field 2",
        description: "Field Description",
        placeholder: "Enter value...",
        fieldClassName: "",
        fieldStyle: {}
        },
        {
        id: "device_id",
        formType: "select",
        name: "device_id",
        label: "Devices",
        description: "Field Description",
        placeholder: "Enter value...",
        fieldClassName: "",
        readonly: !!record_data?.device_id || false,
        required: true,
        selectSearchable: true,
        fieldStyle: {
          gridColumn: "1 / span 2",
          gridRow: "2 / span 1"
          }
        },
        {
        id: "remote_access_type",
        formType: "select",
        name: "remote_access_type",
        label: "Connection Type",
        description: "Field Description",
        placeholder: "Enter value...",
        fieldClassName: "",
        readonly: false,
        required: true,
        selectSearchable: true,
        fieldStyle: {
          gridColumn: "1 / span 2",
          gridRow: "3 / span 1"
          }
        }
      ]}
      selectOptions={{
        device_id: devices ?? [],
        remote_access_type: [
          {
            label: "Console",
            value: "console",
          },
          {
            label: "Web Interface",
            value: "web_interface",
          },
        ]
      }}
    />
  );
}

