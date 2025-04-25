import {
  FormItem,
} from '~/components/ui/form'
import ImageViewer from '~/components/ui/image-viewer'

import {
  type IField,
} from '../../types'

interface IProps {
  fieldConfig: IField
}

export default function FormImageViewer({ fieldConfig }: IProps) {
  return (
    <FormItem>
      <ImageViewer {...fieldConfig.imageConfig} />
    </FormItem>
  )
}
