'use client';

import { ulid } from 'ulid';
import { z } from 'zod';
import { FIELD_FILTER_GRID_COLUMNS } from '~/app/portal/contact/_components/form-filter/basic-details/_config/columns';
import gridColumns from '~/app/portal/contact/grid/_config/columns';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { useToast } from '~/context/ToastProvider';
import { api } from '~/trpc/react';
import { type IFormProps } from '../types';
import SelectedView from './components/SelectedView';

const FormSchema = z.object({});

const defaultAdvanceFilter = [
  {
    entity: 'contacts',
    operator: 'equal',
    type: 'criteria',
    field: 'status',
    id: ulid(),
    label: 'Status',
    values: ['Active'],
    default: true,
  },
  {
    operator: 'and',
    type: 'operator',
    default: true,
  },
  {
    entity: 'organization_accounts',
    operator: 'is_null',
    type: 'criteria',
    field: 'contact_id',
    id: ulid(),
    label: '',
    values: [],
    default: true,
  },
];

export default function BasicDetails({
  params,
  defaultValues,
  selectedRecords,
}: IFormProps) {
  const toast = useToast();

  const update = api.record.updateDynamicRecord.useMutation();

  const handleRemoveRecord = async ({
    filter_entity,
  }: {
    rows: any[];
    main_entity_id: string;
    filter_entity: string;
  }) => {
    try {
      const response = await update.mutateAsync({
        id: params.id,
        entity: 'organization_account',
        data: {
          contact_id: null,
        },
      });

      if (response) {
        toast.success('Internal User removed successfully');
        return {
          rows: [],
          filter_entity,
          main_entity_id: '',
        };
      }
    } catch (error) {
      toast.error('Failed to remove Internal User');
    }
  };

  const handleSelectRecord = async ({
    rows,
    filter_entity,
    main_entity_id,
  }: {
    rows: any[];
    main_entity_id: string;
    filter_entity: string;
  }) => {
    try {
      const response = await update.mutateAsync({
        id: params.id,
        entity: 'organization_account',
        data: {
          contact_id: rows[0].id,
        },
      });
      const {
        first_name,
        last_name,
        middle_name,
        email,
        iso_code,
        country_code,
        raw_phone_numbers,
      } = rows?.[0] ?? {};

      if (response) {
        toast.success('Internal User details submitted successfully');
        return {
          rows: {
            first_name,
            last_name,
            middle_name,
            email: [
              {
                email,
                is_primary: true,
              },
            ],
            phone: [
              {
                raw_phone_number: raw_phone_numbers?.[0],
                iso_code,
                country_code,
                is_primary: true,
              },
            ],
          },
          filter_entity,
          main_entity_id,
        };
      }
    } catch (error) {
      toast.error('Failed to select Internal User');
    }
  };

  const handleFieldSelectRecord = async (data: Record<string, any>) => {
    try {
      const response = await update.mutateAsync({
        id: params.id,
        entity: 'organization_account',
        data: {
          contact_id: data.id,
        },
      });
      const {
        first_name,
        last_name,
        middle_name,
        email,
        raw_phone_numbers,
        iso_code,
        country_code,
      } = data ?? {};

      if (response) {
        toast.success('Internal User details submitted successfully');
        return {
          first_name,
          last_name,
          middle_name,
          email: [
            {
              email,
              is_primary: true,
            },
          ],
          phone: [
            {
              raw_phone_number: raw_phone_numbers?.[0],
              iso_code,
              country_code,
              is_primary: true,
            },
          ],
        };
      }
    } catch (error) {
      toast.error('Failed to select Internal User');
    }
  };

  return (
    <FormBuilder
      create_mode={false}
      defaultValues={defaultValues}
      enableFormRegisterToParent={true}
      features={{
        enableFormFilterCreate: false,
        enableUnlockFormFilter: params.shell_type !== 'record',
      }}
      fields={[
        {
          id: 'phone',
          formType: 'phone-input',
          name: 'phone',
          label: 'Phone Number',
          required: true,
          placeholder: '',
          gridPosition: 'left',
          withGridFilter: true,
          filterFieldConfig: {
            entity: 'contact_phone_numbers',
            field: 'raw_phone_number',
          },
        },
        {
          id: 'email',
          formType: 'email-input',
          name: 'email',
          label: 'Email',
          required: true,
          placeholder: 'Example: yourmail@example.com',
          withGridFilter: true,
          gridPosition: 'right',
          filterFieldConfig: {
            entity: 'contact_emails',
            field: 'email',
          },
        },
        {
          id: 'first_name',
          formType: 'input',
          name: 'first_name',
          label: 'First Name',
          required: true,
          placeholder: 'Example: John',
        },
        {
          id: 'last_name',
          formType: 'input',
          name: 'last_name',
          label: 'Last Name',
          required: true,
          placeholder: 'Example: Smith',
        },
        {
          id: 'middle_name',
          formType: 'input',
          name: 'middle_name',
          label: 'Middle Name',
          required: false,
          placeholder: 'Example: Robert',
        },
      ]}
      filterGridConfig={{
        selectedRecords,
        statusesIncluded: ['Active'],
        actionType: 'single-select',
        hideSearch: false,
        pluck: params?.pluck_fields,
        filter_entity: 'contact',
        is_same_entity_id: true,
        main_entity_id: params.id,
        gridColumns,
        fieldFilterGridColumns: FIELD_FILTER_GRID_COLUMNS,
        current: 1,
        limit: 1000,
        label: 'Contacts',
        searchConfig: {
          router: 'account',
          resolver: 'getUserGridItem',
          query_params: {
            entity: 'contact',
            pluck: params?.pluck_fields,
            default_advance_filters: defaultAdvanceFilter,
            default_sorting: [
              {
                id: 'created_date',
                desc: true,
                sort_key: 'created_date',
              },
            ],
          },
        },
        onSelectRecords: async ({ filter_entity, main_entity_id, rows }) => {
          const response = (await handleSelectRecord({
            rows,
            filter_entity,
            main_entity_id,
          })) as {
            rows: any;
            main_entity_id: string;
            filter_entity: string;
          };
          return {
            rows: response.rows,
            filter_entity: response.filter_entity,
            main_entity_id: response.main_entity_id,
          };
        },
        handleSelectFieldFilterGrid: handleFieldSelectRecord,
        onRemoveSelectedRecords: async ({
          filter_entity,
          main_entity_id,
          rows,
        }) => {
          const response = (await handleRemoveRecord({
            rows,
            filter_entity,
            main_entity_id,
          })) as {
            rows: any[];
            filter_entity: string;
            main_entity_id: string;
          };
          return {
            rows: response.rows,
            filter_entity: response.filter_entity,
            main_entity_id: response.main_entity_id,
          };
        },
        onFilterFieldChange: (search_params, options) => {
          const { data } = api.account.getUserGridItem.useQuery(
            {
              ...search_params,
              advance_filters: [
                ...defaultAdvanceFilter,
                {
                  operator: 'and',
                  type: 'operator',
                },
                ...(search_params.advance_filters ?? []),
              ],
            },
            options,
          );
          return data;
        },
        renderComponentSelected: (record) => {
          return <SelectedView record={record} />;
        },
      }}
      formKey={'UserDetails'}
      formLabel={params.shell_type === 'record' ? 'Contact Details' : 'User'}
      formProps={params}
      formSchema={FormSchema}
      myParent={params.shell_type}
    />
  );
}
