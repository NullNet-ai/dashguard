import { PhoneInput } from "react-international-phone";
import { EnvelopeIcon } from "@heroicons/react/20/solid";
import { cn } from "~/lib/utils";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

const form_filter_entity = ''
const SelectedView = ({ record }: Record<string, any>) => {
  const { phone, [form_filter_entity]: email } = record || {};
  const [email_data] = email || [];
  return (
    <div className="flex">
      <div className="w-1/2">
        <Label className={cn("text-md font-semibold")}>Primary Email: *</Label>
        <Input
          readOnly={true}
          className={`${true && "border-transparent placeholder:text-muted-foreground disabled:text-foreground disabled:opacity-100"}`}
          disabled={true}
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
