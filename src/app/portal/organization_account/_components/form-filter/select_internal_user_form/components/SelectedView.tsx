import { PhoneInput } from 'react-international-phone';
import { EnvelopeIcon } from '@heroicons/react/20/solid';
import { cn } from '~/lib/utils';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';

const SelectedView = ({ record }: Record<string, any>) => {
  const { first_name, last_name, middle_name, raw_phone_number, iso_code, email } = record?.[0] || {};

  return (
    <>
      <div className="flex flex-col gap-y-4 md:flex-row md:gap-y-0 mb-5">
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
                borderColor: 'transparent',
                borderRightColor: `inherit`,
                colorScheme: 'normal',
              },
            }}
            defaultCountry={iso_code || 'us'}
            disabled={true}
            required={true}
            value={`+${raw_phone_number}`}
            className={cn(
              'mr-[1px] w-[90%] rounded-md !border-input bg-transparent text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:border-transparent disabled:opacity-100',
              'border-transparent opacity-100 disabled:pointer-events-none',
            )}
            inputStyle={{
              width: '100%',
              backgroundColor: 'transparent',
              color: 'inherit',
              borderColor: `transparent`,
              padding: '1.2rem',
              opacity: 'inherit',
            }}
            inputClassName="ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:border-transparent text-foreground disabled:opacity-100"
          />
        </div>
        <div className="w-full md:w-1/2">
          <Label className={cn('text-md font-semibold')}>
            Primary Email *
          </Label>
          <Input
            readOnly={true}
            className={`${true && 'border-transparent placeholder:text-muted-foreground disabled:text-foreground disabled:opacity-100'}`}
            placeholder={'Primary Email'}
            value={email}
            Icon={EnvelopeIcon}
            iconPlacement="left"
          />
        </div>
      </div>
      <div className="flex flex-col gap-y-4 md:flex-row md:gap-y-0 mb-5">
        <div className="w-full md:w-1/2">
          <Label className={cn('text-md font-semibold')}>First Name *</Label>
          <Input
            readOnly={true}
            required={true}
            value={first_name}
            placeholder={'First Name'}
            className={`${true && 'border-transparent placeholder:text-muted-foreground disabled:text-foreground disabled:opacity-100'}`}

          />
        </div>
        <div className="w-full md:w-1/2">
          <Label className={cn('text-md font-semibold')}>Last Name *</Label>
          <Input
            readOnly={true}
            className={`${true && 'border-transparent placeholder:text-muted-foreground disabled:text-foreground disabled:opacity-100'}`}
            placeholder={'Last Name'}
            value={last_name}
            Icon={EnvelopeIcon}
            iconPlacement="left"
          />
        </div>
      </div>
      <div className="flex flex-col gap-y-4 md:flex-row md:gap-y-0">
        <div className="w-full md:w-1/2">
          <Label className={cn('text-md font-semibold')}>Middle Name </Label>
          <Input
            readOnly={true}
            required={true}
            value={middle_name}
            placeholder={'Middle Name'}
            className={`${true && 'border-transparent placeholder:text-muted-foreground disabled:text-foreground disabled:opacity-100'}`}
          />
        </div>
      </div>
    </>
  );
};

export default SelectedView;
