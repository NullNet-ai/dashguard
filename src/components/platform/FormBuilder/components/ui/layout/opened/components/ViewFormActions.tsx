import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu';
import { EllipsisVertical, XIcon } from 'lucide-react';
import React, { useContext } from 'react';
import SubmitForm from '../../../Buttons/Submit';
import CancelFormButton from '../../../Buttons/Cancel';
import { camelCase, isUndefined } from 'lodash';
import {
  type IFormProperties,
  type ICustomActions,
  type IFeatures,
} from '~/components/platform/FormBuilder/types';
import { testIDFormatter } from '~/utils/formatter';
import { WizardContext } from '~/components/platform/Wizard/Provider';

const ViewFormActions = ({
  saveForm,
  form,
  formKey,
  formSchema,
  isButtonLoading,
  features,
  formProps,
  customFormHostViewFormActions = [],
  properties,
  formSaveButtonTitle,
  formSaveIcon,
}: {
  saveForm: any;
  form: any;
  formSchema: any;
  isButtonLoading: boolean;
  formKey: string;
  features: IFeatures | undefined;
  formProps?: any;
  customFormHostViewFormActions: ICustomActions[] | undefined;
  properties?: IFormProperties;
  formSaveButtonTitle?: string;
  formSaveIcon?: React.ReactNode;
}) => {
  const { hasActions = true } = properties ?? {};
  const { enableFormHostViewActions = true, enableViewFormEllipsis = true} = features ?? {};
  const { state } = useContext(WizardContext);
  const { entityName } = state ?? {};
  if (!enableFormHostViewActions) return null;

  if (!hasActions) return null;

  return (
    <div className="flex flex-row gap-2">
      <SubmitForm
        saveForm={saveForm}
        data-test-id={testIDFormatter(
          `${entityName ?? 'no_entity'}-wizard-${formKey}-save-form-button`,
        )}
        form={form}
        formSchema={formSchema}
        isLoading={isButtonLoading}
        formSaveButtonTitle={formSaveButtonTitle}
        formSaveIcon={formSaveIcon}
      />
      <CancelFormButton
        saveForm={saveForm}
        form={form}
        data-test-id={testIDFormatter(
          `${entityName ?? 'no_entity'}-wizard-${formKey}-cancel-form-button`,
        )}
        formSchema={formSchema}
        isLoading={isButtonLoading}
      />
      {enableViewFormEllipsis && <DropdownMenu>
        <DropdownMenuTrigger
          data-test-id={testIDFormatter(
            `${entityName ?? 'no_entity'}-wizard-${formKey}-more-actions-menu`,
          )}
        >
          <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            data-test-id={testIDFormatter(
              `${entityName ?? 'no_entity'}-wizard-${formKey}-more-actions-clear-form`,
            )}
            onClick={() => {
              const currentValues = form.getValues();
              Object.keys(currentValues).forEach((key) => {
                const value = currentValues[key];

                if (Array.isArray(value)) {
                  if (key.toLowerCase() === 'email') {
                    currentValues[key] = [
                      {
                        ...value,
                        email: '',
                      },
                    ];
                  } 
                  else if (key.toLowerCase() === 'emails') {
                    currentValues[key] = [
                      {
                        ...value[0],
                        email: '',
                        is_primary: true,
                      },
                    ];
                  }
                  else if (
                    ['phone_numbers', 'phones', 'phone'].includes(
                      key.toLowerCase(),
                    )
                  ) {
                    currentValues[key] = [
                      {
                        raw_phone_number: '',
                        iso_code: 'us',
                        country_code: '+1',
                        is_primary: true,
                      },
                    ];
                  } else {
                    currentValues[key] = [];
                  }
                } else if (typeof value === 'string') {
                  currentValues[key] = '';
                } else if (typeof value === 'object' && value !== null) {
                  currentValues[key] = {};
                } else {
                  currentValues[key] = null;
                }
              });
              form.reset(currentValues, {
                keepDefaultValues: true,
              });
            }}
            className="flex gap-2"
          >
            <XIcon className="h-3 w-3 text-slate-500" strokeWidth={3} />
            Clear
          </DropdownMenuItem>
          {!!customFormHostViewFormActions.length &&
            customFormHostViewFormActions.map((action, index) => (
              <DropdownMenuItem
                key={index}
                data-test-id={testIDFormatter(
                  `${entityName ?? 'no_entity'}-wizard-${formKey}-more-actions-${camelCase(action.label)}`,
                )}
                onClick={action.onClick}
                className="flex gap-2"
                disabled={action.disabled}
              >
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>}
    </div>
  );
};

export default ViewFormActions;
