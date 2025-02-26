import { EnvelopeIcon } from '@heroicons/react/20/solid'

import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import PhoneInput from '~/components/ui/phone-input'
import { cn } from '~/lib/utils'

const SelectedView = ({ record }: Record<string, any>) => {
  const { first_name, last_name, middle_name, email, phone } = record || {}
  const [phone_data] = phone || []
  const [email_data] = email || []

  return (
    <>
      <div className='flex flex-col gap-4 md:flex-row md:gap-y-0 mb-5'>
        <div className='w-full md:w-1/2'>
          <Label className={cn('text-md font-semibold')}>
            Phone Number *
          </Label>
          <PhoneInput
            countrySelectorStyleProps={{
              buttonStyle: {
                padding: '1.2rem',
                paddingInline: '0.5rem',
                backgroundColor: 'inherit',
                borderColor: 'inherit',
                colorScheme: 'normal',
              },
            }}
            defaultCountry={phone_data?.iso_code || 'us'}
            disabled={true}
            required={true}
            value={`+${phone_data?.raw_phone_number}`}
            className={"placeholder:text-muted-foreground disabled:text-foreground disabled:opacity-100"}
            inputStyle={{
              width: '100%',
              backgroundColor: 'transparent',
              color: 'inherit',
              borderColor: `inherit`,
              padding: '1.2rem',
              opacity: 'inherit',
            }}
            // inputClassName="ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:border-transparent text-foreground disabled:opacity-100"
          />
        </div>
        <div className='w-full md:w-1/2'>
          <Label className={cn('text-md font-semibold')}>
            Email *
          </Label>
          <Input
            Icon={ EnvelopeIcon }
            iconPlacement="left"
            placeholder={"Primary Email"}
            readOnly={ true }
            value={ email_data?.email }
          />
        </div>
      </div>
      <div className='flex flex-col gap-4 md:flex-row md:gap-y-0 mb-5'>
        <div className='w-full md:w-1/2'>
          <Label className={cn('text-md font-semibold')}>First Name *</Label>
          <Input
            placeholder={"First Name"}
            readOnly={ true }
            required={ true }
            value={ first_name }

          />
        </div>
        <div className='w-full md:w-1/2'>
          <Label className={cn('text-md font-semibold')}>Last Name *</Label>
          <Input
            iconPlacement="left"
            placeholder={"Last Name"}
            readOnly={ true }
            value={ last_name }
          />
        </div>
      </div>
      <div className='flex flex-col gap-4 md:flex-row md:gap-y-0'>
        <div className='w-full md:w-1/2'>
          <Label className={cn('text-md font-semibold')}>{'Middle Name '}</Label>
          <Input
            placeholder={"Middle Name"}
            readOnly={ true }
            required={ true }
            value={ middle_name }
          />
        </div>
      </div>
    </>
  )
}

export default SelectedView
