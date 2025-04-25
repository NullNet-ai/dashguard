import { Button } from '~/components/ui/button'
import {
  FormItem,
} from '~/components/ui/form'

import {
  type IField,
} from '../../types'

interface IProps {
  fieldConfig: IField
}

export default function FormButton({ fieldConfig }: IProps) {
  return (
    <FormItem>
      <Button {...fieldConfig.buttonConfig} />
    </FormItem>
  )
}
