import { EnvelopeIcon } from '@heroicons/react/20/solid'
import { usePathname } from 'next/navigation'
import { PhoneInput } from 'react-international-phone'

import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { cn } from '~/lib/utils'

const form_filter_entity = ''
const SelectedView = ({ record }: Record<string, any>) => {
  const { phone, [form_filter_entity]: email } = record || {};
  const [email_data] = email || [];
  const path = usePathname();
  const [, , entity, app] = path.split("/");
  return (
    <div className={"flex"}>
      <div className={"w-1/2"}>
        <Label 
          className={cn("text-sm font-medium text-slate-700")}
          data-test-id={`${entity}-${app}-frm-lbl-prmry-email`}
        >
          Primary Email: *
        </Label>
        <Input
          type="email"
          className={ `${true && 'border-transparent placeholder:text-muted-foreground disabled:text-foreground disabled:opacity-100'}` }
          data-test-id={`${entity}-${app}-frm-input-prmry-email`}
          disabled={ true }
          Icon={ EnvelopeIcon }
          iconPlacement='left'
          placeholder="Primary Email"
          readOnly={ true }
          value={ email_data?.email }
        />
      </div>
    </div>
  )
}

export default SelectedView
