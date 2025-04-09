'use server';

import { api } from '~/trpc/server';

interface IProps {
  entity: string;
}

const customVariables = [
  {
    value: 'link',
    label: 'link',
  },
];

export async function GetVariables({ entity }: IProps) {
  const result = await api.communicationTemplate.fetchVariables({
    entity,
  });
  const options = result?.data?.map((variable: any) => ({
    value: variable,
    label: variable,
  }));
  return [...options, ...customVariables];
}
