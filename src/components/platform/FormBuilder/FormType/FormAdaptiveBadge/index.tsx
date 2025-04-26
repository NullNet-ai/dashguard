import { AdaptiveBadgeDisplay } from '~/components/ui/adaptive-badge-display'
import {
  FormItem,
} from '~/components/ui/form'

import {
  type IField,
} from '../../types'

interface IProps {
  fieldConfig: IField
}

export default function FormAdaptiveBadge({ fieldConfig }: IProps) {
  return (
    <FormItem>
      <AdaptiveBadgeDisplay {...fieldConfig?.adaptiveBadgeConfig} />
    </FormItem>
  )
}
