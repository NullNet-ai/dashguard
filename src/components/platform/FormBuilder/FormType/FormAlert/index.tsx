// import {
//     type UseFormReturn,
//     type ControllerFieldState,
//     type ControllerRenderProps,
// } from "react-hook-form";
import { Alert, AlertContent, AlertTitle } from '~/components/ui/alert'
import {
  // FormControl,
  FormItem,
  // FormLabel,
  // FormMessage,
} from '~/components/ui/form'

import {
  //  type IFieldFilterActions,
  type IField,
} from '../../types'

interface IProps {
  fieldConfig: IField
  // formRenderProps: {
  //     field: ControllerRenderProps<Record<string, any[]>>;
  //     fieldState: ControllerFieldState;
  // };
  // form: UseFormReturn<Record<string, any>, any, undefined>;
  // icon?: React.ElementType;
  // value?: string;
  // fieldFilterActions?: IFieldFilterActions;
  // formKey: string;
}

export default function AlertComponent({ fieldConfig }: IProps) {
  return (
    <FormItem>
      {fieldConfig?.alertIcon
        ? (
            <Alert
              Icon={fieldConfig?.alertIcon}
              variant={fieldConfig?.alertVariant || 'default'}
              withAccentBorder={fieldConfig?.alertWithAccentBorder}
            >
              <AlertTitle>{fieldConfig?.alertTitle}</AlertTitle>
              <AlertContent>{fieldConfig?.alertContent}</AlertContent>
            </Alert>
          )
        : (
            <Alert
              variant={fieldConfig?.alertVariant || 'default'}
              withAccentBorder={fieldConfig?.alertWithAccentBorder}
            >
              <AlertTitle>{fieldConfig?.alertTitle}</AlertTitle>
              <AlertContent>{fieldConfig?.alertContent}</AlertContent>
            </Alert>
          )}
    </FormItem>
  )
}
