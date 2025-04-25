import {
  FormItem,
} from '~/components/ui/form'

import {
  type IField,
} from '../../types'
import { Badge } from '~/components/ui/badge'

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
