import { Badge } from '~/components/ui/badge'
import {
  FormItem,
} from '~/components/ui/form'

import {
  type IField,
} from '../../types'

interface IProps {
  fieldConfig: IField
}

export default function FormBadge({ fieldConfig }: IProps) {
  return (
    <FormItem>
      <Badge {...fieldConfig.badgeConfig} />
    </FormItem>
  )
}
