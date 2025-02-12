import { EnvelopeIcon } from '@heroicons/react/20/solid'
import { PhoneInput } from 'react-international-phone'

import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { cn } from '~/lib/utils'

const form_filter_entity = ''
const SelectedView = ({ record }: Record<string, any>) => {
  const { phone, [form_filter_entity]: email } = record || {}
  const [email_data] = email || []
  return (
    <div className='flex'>
      <div className='w-1/2'>
        <Label className={cn('text-md font-semibold')}>Primary Email: *</Label>
        <Input
          className={ `${true && 'border-transparent placeholder:text-muted-foreground disabled:text-foreground disabled:opacity-100'}` }
          disabled={ true }
          Icon={ EnvelopeIcon }
          iconPlacement="left"
          placeholder={"Primary Email"}
          readOnly={ true }
          value={ email_data?.email }
        />
      </div>
    </div>
  )
}

export default SelectedView
