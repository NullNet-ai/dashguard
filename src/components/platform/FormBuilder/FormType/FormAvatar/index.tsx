import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  FormItem,
} from '~/components/ui/form'

import {
  type IField,
} from '../../types'

interface IProps {
  fieldConfig: IField
}

export default function FormAvatar({ fieldConfig }: IProps) {
  return (
    <FormItem>
      <Avatar {...fieldConfig.avatarConfig?.avatar}>
        <AvatarImage {...fieldConfig.avatarConfig?.image} />
        <AvatarFallback {...fieldConfig.avatarConfig?.fallback}>
          {fieldConfig.avatarConfig?.fallbackText || 'CN'}
          {' '}
        </AvatarFallback>
      </Avatar>
    </FormItem>
  )
}
