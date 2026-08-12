import { PhoneInput } from "react-international-phone";
import { EnvelopeIcon } from "@heroicons/react/20/solid";
import { cn } from "~/lib/utils";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import SelectedPhoneNumber from './SelectedPhoneNumber';
import { usePathname } from 'next/navigation';

const SelectedView = ({ record }: Record<string, any>) => {
  const { phones, emails } = record || {};
  const [phone_data] = phones || [];
  const [email_data] = emails || [];
  const path = usePathname();
  const [, , entity, app] = path.split("/");
  return (
    <div className="flex flex-col gap-y-4 gap-x-4 md:gap-y-0 md:flex-row">
      <div className="w-full md:w-1/2 relative">

        {/* <PhoneInput
          countrySelectorStyleProps={{
            buttonStyle: {
              padding: "1.2rem",
              paddingInline: "0.5rem",
              backgroundColor: "inherit",
              borderColor: "transparent",
              borderRightColor: `inherit`,
              colorScheme: "normal",
            },
          }}
          
          defaultCountry={phone_data?.iso_code || "us"}
          required={true}
          value={`+${phone_data?.raw_phone_number}`}
          className={cn(
            "mr-[1px] w-[90%] rounded-md !border-input bg-transparent text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:border-transparent disabled:opacity-100",
            "border-transparent opacity-100 disabled:pointer-events-none",
          )}
          inputProps={{
            readOnly: true
          }}
          disableCountryGuess
          inputStyle={{
            width: "100%",
            backgroundColor: "transparent",
            color: "inherit",
            borderColor: `transparent`,
            padding: "1.2rem",
            opacity: "inherit",
          }}
          inputClassName="ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:border-transparent text-foreground disabled:opacity-100"
        /> */}

        <SelectedPhoneNumber
            options={{
              type: "default",
            }}
            value={phone_data?.raw_phone_number}
            fields={[
              {
                id: "phone_number",
                name: "phone_number",
                type: "phone_number",
                formType: "phone-input",
                label: "Primary Phone Number: *",
                placeholder: "Phone Number",
                readonly: true,
              }
            ]}
        />
        <div className='top-[24px] w-[59px] h-[65%] absolute left-[-3px] z-[100]' />
      </div>

      <div className="w-full md:w-1/2">
        <Label 
          className={cn("text-sm font-medium text-slate-700")}
          data-test-id={`${entity}-${app}-frm-lbl-prmry-email`}
        >
          Primary Email: *
        </Label>
        <Input
          type="email"
          readOnly={true}
          className={`${true && "placeholder:text-muted-foreground disabled:text-foreground disabled:opacity-100 mt-2"}`}
          data-test-id={`${entity}-${app}-frm-input-prmry-email`}
          disabled={false}
          placeholder={"Primary Email"}
          value={email_data?.email}
          Icon={EnvelopeIcon}
          iconPlacement="left"
        />
      </div>
    </div>
  );
};

export default SelectedView;
