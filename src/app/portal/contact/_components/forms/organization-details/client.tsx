'use client';

import { type z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { api } from '~/trpc/react';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';
import { ContactOrganizationDetailsSchema } from '~/server/zodSchema/contact/organizationDetails';

export default function OrganizationDetails({
  params,
  defaultValues,
  selectOptions,
  multiSelectOptions,
}: IFormProps) {
  const toast = useToast();
  const updateOrganization = api.organizationContact.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof ContactOrganizationDetailsSchema>>) => {
    try {
      const { organizations } = data;
      const response = await updateOrganization.mutateAsync({
        contact_organization_ids: organizations?.map((itm) => itm.value) ?? [],
        contact_id: params.id,
      });
      if (response) {
        toast.success('Department Details submit successfully');
        return response;
      }
      throw new Error('Failed to submit Department Details');
    } catch (error) {
      toast.error('Failed to submit Department Details');
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-1 gap-4',
      }}
      myParent={params.shell_type}
      enableFormRegisterToParent={true}
      formProps={params}
      formLabel="Department Details"
      handleSubmit={handleSave}
      formKey="organization_details"
      formSchema={ContactOrganizationDetailsSchema}
      defaultValues={defaultValues}
      multiSelectOptions={multiSelectOptions}
      selectOptions={selectOptions}
      fields={[
        {
          id: 'organizations',
          formType: 'multi-select',
          name: 'organizations',
          label: 'Department',
          required: false
        },
      ]}
    />
  );
}
