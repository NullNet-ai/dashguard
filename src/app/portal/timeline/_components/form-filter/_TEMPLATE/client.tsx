'use client';

import { FormBuilder } from '~/components/platform/FormBuilder';
import { z } from 'zod';
import MultipleForm from './components/MultipleForm';
import GridFilterConfig from './_config/gridConfig';
import type { IFormProps } from '../types';
import { GLOBAL_PARENT_VARIABLE_KEY } from './constants';

// Be back later
const FieldsSchema = z.object({
  id: z.string(),
  // ! Your schema goes here
});

// Be back later
export const FormSchema = z.object({
  [GLOBAL_PARENT_VARIABLE_KEY]: z.array(FieldsSchema),
});

export default function RecordDetails(props: IFormProps) {
  const { params, defaultValues } = props;
  return (
    <FormBuilder
      customDesign={{
        formClassName: 'lg:grid-cols-1 sm:grid-cols-1 ',
      }}
      customRender={(form, options, displayType, handleUpdateDisplayType) => {
        return (
          <MultipleForm
            appendFormKey={options?.appendButtonKey}
            defaultValues={defaultValues}
            displayType={displayType}
            filterGridConfig={GridFilterConfig(props)}
            form={form}
            formSchema={FormSchema}
            handleUpdateDisplayType={handleUpdateDisplayType}
          />
        );
      }}
      defaultValues={defaultValues}
      // ! Add button event handler
      appendFormKey={GLOBAL_PARENT_VARIABLE_KEY}
      // ! Add Button will display on the top of the form
      enableAppendForm={true}
      // ! Registration to wizard application
      enableFormRegisterToParent={true}
      features={{
        enableFormFilterCreate: false,
      }}
      fields={[]}
      filterGridConfig={GridFilterConfig(props)}
      // ! Change form key
      formKey="formFilterMultipleForms"
       // ! Change Form Title
      formLabel="Form Filter with Multiple Forms"
      formProps={params}
      formSchema={FormSchema}
      myParent={params.shell_type}
    />
  );
}
