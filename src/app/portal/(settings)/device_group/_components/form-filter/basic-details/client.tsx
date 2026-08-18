'use client';

import { z } from 'zod';
import { ulid } from 'ulid';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { api } from '~/trpc/react';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';
import { removeRecord, selectRecord, savedRecord } from './actions';
import gridColumns from './_config/columns';
import SelectedView from './components/SelectedView';
import { useRouter } from 'next/navigation';

const FormSchema = z.object({
  name: z
    .string({ message: 'Name is required' })
    .min(1, { message: 'Name is required' }),
});

// WP-838: the "Show Grid" list on Device Group Wizard Step 1 must show Draft
// records only. `statusesIncluded` below only gates row selectability, so the
// list has to be narrowed by a default advance filter on the grid query.
const defaultAdvanceFilter = [
  {
    entity: 'device_group_settings',
    operator: 'equal',
    type: 'criteria',
    field: 'status',
    id: ulid(),
    label: 'Status',
    values: ['Draft'],
    default: true,
  },
];

export default function DeviceGroupBasicDetails({
  params,
  defaultValues,
  selectedRecords,
}: IFormProps) {
  const toast = useToast();
  const utils = api.useUtils();
  const router = useRouter();
  const saveDeviceGroup = api.deviceGroup.saveDeviceGroup.useMutation();

  const handleSave = async ({
    data,
    action_type,
  }: IHandleSubmit<z.infer<typeof FormSchema>>): Promise<any[]> => {
    try {
      const res = await saveDeviceGroup.mutateAsync({
        id: params.id || undefined,
        ...data,
      });
      if (res.status_code == 200 || res.status_code == 201) {
        const [device_group_data] = res?.data;
        const wizardPath = `/portal/device_group/wizard/${device_group_data?.code}`;

        toast.success('Device Group submitted successfully');
        if (action_type && ['Create', 'Next', 'Paste'].includes(action_type)) {
          await savedRecord({ code: device_group_data?.code, action_type });
          await utils.invalidate();
          const targetPath =
            action_type === 'Next' ? `${wizardPath}/2` : `${wizardPath}/1`;
          router.push(targetPath);
          if (action_type === 'Next') return [];
        }
        return res.data || [];
      }
      return [];
    } catch (error) {
      toast.error('Failed to submit Device Group');
      return [];
    }
  };

  const handleRemoveRecord = async () => {
    try {
      await removeRecord();
      return {
        rows: [],
        filter_entity: 'device_group_settings',
        main_entity_id: '',
      };
    } catch (error: any) {
      if (error.message === 'NEXT_REDIRECT') return;
      toast.error('Failed to remove selection');
    }
  };

  const handleSelectRecord = async ({ rows }: { rows: any[] }) => {
    try {
      await selectRecord(rows);
      return {
        rows,
        filter_entity: 'device_group_settings',
        main_entity_id: params.id,
      };
    } catch (error: any) {
      if (error.message === 'NEXT_REDIRECT') return;
      toast.error('Failed to select record');
    }
  };

  return (
    <FormBuilder
      filterGridConfig={{
        selectedRecords,
        statusesIncluded: ['Draft'],
        actionType: 'single-select',
        pluck: params?.pluck_fields,
        filter_entity: 'device_group_settings',
        main_entity_id: params.id,
        gridColumns: gridColumns,
        current: 1,
        limit: 1000,
        label: 'Device Group',
        searchConfig: {
          query_params: {
            entity: 'device_group_settings',
            pluck: params?.pluck_fields,
            default_advance_filters: defaultAdvanceFilter as {
              entity: string;
              operator: string;
              type: string;
              field: string;
              values: string[];
            }[],
          },
        },
        async onSelectRecords({ rows }) {
          const response = await handleSelectRecord({ rows });
          return (
            response || {
              rows: [],
              filter_entity: 'device_group_settings',
              main_entity_id: '',
            }
          );
        },
        async onRemoveSelectedRecords() {
          const response = await handleRemoveRecord();
          return (
            response || {
              rows: [],
              filter_entity: 'device_group_settings',
              main_entity_id: '',
            }
          );
        },
        handleSelectFieldFilterGrid: (data) => data,
        renderComponentSelected: (record) => <SelectedView record={record} />,
      }}
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Basic Details"
      handleSubmitFormGrid={handleSave}
      formKey="BasicDetails"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: 'name',
          formType: 'input',
          name: 'name',
          label: 'Device Group',
          required: true,
          placeholder: 'Device Group',
          withGridFilter: true,
          filterFieldConfig: {
            entity: 'device_group_settings',
            field: 'name',
          },
        },
      ]}
    />
  );
}
