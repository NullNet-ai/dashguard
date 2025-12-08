import { IField } from '~/components/platform/FormBuilder/types';

export default function FormFields({
  prefix,
  field,
}: {
  prefix: string;
  field: Record<string, any>;
}): IField[] {
  return [
    {
      id: `${prefix}.id`,
      formType: 'input',
      placeholder: 'Identification',
      name: `${prefix}.id`,
      label: 'Identification',
      readonly: field?.readonly || false,
      disabled: field?.readonly || false,
      required: true,
      gridPosition: 'left',
      withGridFilter: true,
      // ! Pick your entity and field to be searched
      // filterFieldConfig: {
      //   entity: 'contact',
      //   field: 'first_name',
      // },
    },
    {
      id: `${prefix}.code`,
      formType: 'input',
      placeholder: 'Code',
      name: `${prefix}.code`,
      label: 'Code',
      readonly: field?.readonly || false,
      disabled: field?.readonly || false,
      required: false,
      withGridFilter: true,
      gridPosition: 'right',
      // ! Pick your entity and field to be searched
      // filterFieldConfig: {
      //   entity: 'contact',
      //   field: 'middle_name',
      // },
    },
  ] as IField[];
}
