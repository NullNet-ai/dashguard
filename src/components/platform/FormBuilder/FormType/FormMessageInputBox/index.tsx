import {
  FormItem,
} from '~/components/ui/form'

import {
  type IField,
} from '../../types'
import { MessageThread } from '~/components/ui/message'

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
