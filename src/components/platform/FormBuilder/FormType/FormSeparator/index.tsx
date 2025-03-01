
import {
  FormItem,
} from '~/components/ui/form';

import {
  type IField,
} from '../../types';
import { Separator } from '~/components/ui/separator';

interface IProps {
  fieldConfig: IField;

}

export default function FormSeparator({ fieldConfig }: IProps) {
  return (
    <FormItem>
      {fieldConfig?.separatorType === 'dashed' ? (
        <Separator dashed />
      ) : fieldConfig?.separatorType === 'decorative' ? (
        <Separator decorative />
      ) : (
        <Separator />
      )}
    </FormItem>
  );
}
