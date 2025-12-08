'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IField } from '~/components/platform/FormBuilder/types';
import CustomField from './_component/custom-field';
import { FormSchema } from './schema';


export default function Page () {


  return (
    <FormBuilder 
    formLabel="User Profile Form"
    formKey="user-profile"
         fields={[
        {
          id: 'radio',
          name: 'radio',
          type: 'radio',
          formType: 'radio',
          radioOrientation: 'vertical',
          label: 'Radio with Sub Component',
          placeholder: 'Radio',
          required: true,
        },
      ]}
        formSchema={FormSchema}
        radioOptions={{
            radio: [
              { label: 'Radio 1', value: 'radio1' },
              { label: 'Radio 2', value: 'radio2' },
              { label: 'Radio 3', value: 'radio3' },
               {
                      label: 'Other',
                      value: 'other',
                      renderComponent: ({ form, field, fieldConfig }: any) => {
                        return <CustomField form={form} fieldConfig={fieldConfig} />;
                      },
                    },
            ],
          }}
    />
  );
};

