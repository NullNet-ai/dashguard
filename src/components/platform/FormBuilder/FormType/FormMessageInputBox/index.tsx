import {
  FormItem,
} from '~/components/ui/form'
import { MessageThread } from '~/components/ui/message'

import {
  type IField,
} from '../../types'

interface IProps {
  fieldConfig: IField
}

export default function FormMessageInputBox({ fieldConfig }: IProps) {
  return (
    <FormItem>
      <MessageThread {...fieldConfig.messageThreadConfig} />
    </FormItem>
  )
}
