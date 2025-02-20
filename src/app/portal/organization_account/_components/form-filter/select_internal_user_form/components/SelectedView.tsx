import  PhoneInput  from '~/components/ui/phone-input';
import { EnvelopeIcon } from '@heroicons/react/20/solid';
import { cn } from '~/lib/utils';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';

const SelectedView = ({ record }: Record<string, any>) => {
  const { first_name, last_name, middle_name, email, phone } = record || {};
  const [phone_data] = phone || [];
  const [email_data] = email || [];
  
  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:gap-y-0 mb-5">
        <div className="w-full md:w-1/2">
          <Label className={cn('text-md font-semibold')}>
            Primary Phone Number *
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
        <div className="w-full md:w-1/2">
          <Label className={cn('text-md font-semibold')}>
            Primary Email *
          </Label>
          <Input
            readOnly={true}
            placeholder={'Primary Email'}
            value={email_data?.email}
            Icon={EnvelopeIcon}
            iconPlacement="left"
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:gap-y-0 mb-5">
        <div className="w-full md:w-1/2">
          <Label className={cn('text-md font-semibold')}>First Name *</Label>
          <Input
            readOnly={true}
            required={true}
            value={first_name}
            placeholder={'First Name'}

          />
        </div>
        <div className="w-full md:w-1/2">
          <Label className={cn('text-md font-semibold')}>Last Name *</Label>
          <Input
            readOnly={true}
            placeholder={'Last Name'}
            value={last_name}
            Icon={EnvelopeIcon}
            iconPlacement="left"
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:gap-y-0">
        <div className="w-full md:w-1/2">
          <Label className={cn('text-md font-semibold')}>Middle Name </Label>
          <Input
            readOnly={true}
            required={true}
            value={middle_name}
            placeholder={'Middle Name'}
          />
        </div>
      </div>
    </>
  );
};

export default SelectedView;
