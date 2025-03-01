import { EyeSlashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import React, { useContext } from 'react';
import { Button as Button2 } from '@headlessui/react';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import SelectedActions from '../../selected/components/SelectedActions';
import FormFilterOpenedActions from './FormFilterOpenedActions';
import { AccordionTrigger } from '~/components/ui/accordion';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';
import {
  type ICustomActions,
  type IFeatures,
} from '~/components/platform/FormBuilder/types';
import { Separator } from '~/components/ui/separator';
import { useRouter } from 'next/navigation';
import { WizardContext } from '~/components/platform/Wizard/Provider';

const FormBodyMainActions = ({
  isListLoading,
  displayType,
  filterGridConfig,
  formGridSelected,
  handleUpdateDisplayType,
  handleAppendForm,
  selectedRecords,
  isButtonLoading,
  onSubmitFormGrid,
  formLabel,
  form,
  handleRemovedSelectedRecords,
  customFormFilterViewFormActions,
  customFormFilterLockFormActions,
  features,
  searchActive,
  formProps,
}: {
  isListLoading: boolean;
  displayType: string;
  filterGridConfig: any;
  formGridSelected: any;
  handleUpdateDisplayType: any;
  handleAppendForm: any;
  isButtonLoading: boolean;
  onSubmitFormGrid: any;
  selectedRecords: any;
  formLabel: string;
  form: any;
  handleRemovedSelectedRecords: any;
  features: IFeatures | undefined;
  customFormFilterViewFormActions: ICustomActions[] | undefined;
  customFormFilterLockFormActions: ICustomActions[] | undefined;
  searchActive: boolean;
  formProps?: any;
}) => {
  const { state } = useContext(WizardContext);
  const { entityName } = state ?? {};
  const { enableFormFilterCreate = true } = features ?? {};

  return (
    <div className="me-4 ms-auto mt-4 flex justify-end gap-2 md:mb-3 lg:mb-0">
      {displayType !== 'selected' && !!Object.keys(filterGridConfig).length && (
        <>
          {!!selectedRecords?.length && !formProps?.isOpenSearch && (
            <Button
              variant={'outline'}
              data-test-id={entityName + '-wzrd' + '-cancel-btn'}
              onClick={() => {
                form.reset(form.formState.defaultValues);
                handleUpdateDisplayType('selected');
              }}
              type="button"
              loading={isButtonLoading}
              size={'xs'}
            >
              <XMarkIcon className="h-4 w-4" />
              Cancel
            </Button>
          )}
          {!formProps?.isOpenSearch && enableFormFilterCreate && (
            <>
              <Button
                variant={'default'}
                name={
                  formLabel.split(' ').join('') +
                  `${selectedRecords.length ? 'FormUpdateButton' : 'FormCreateButton'}`
                }
                data-test-id={
                  selectedRecords.length
                    ? entityName + '-wzrd' + '-update-btn'
                    : entityName + '-wzrd' + '-create-btn'
                }
                onClick={form.handleSubmit(onSubmitFormGrid)}
                type="button"
                loading={isButtonLoading}
                size={'xs'}
                className="items-center gap-1 text-sm"
              >
                <PlusIcon className="h-4 w-4" />
                {selectedRecords.length ? 'Update' : 'Create'}
              </Button>
              <Separator orientation="vertical" className="mr-1 py-3" />
            </>
          )}

          <div>
            {isListLoading ? (
              <Loader2 className={cn('h-5 w-5 animate-spin text-gray-400')} />
            ) : (
              <>
                <Button2
                  onClick={() => {
                    formProps?.handleSearchOpen();
                  }}
                  data-test-id={
                    !formProps?.isOpenSearch
                      ? entityName + '-wzrd' + '-show-grd-btn'
                      : entityName + '-wzrd' + '-hide-grd-btn'
                  }
                  className="inline-flex h-7 items-center gap-1 rounded bg-indigo-100 px-2 py-2 text-sm text-primary hover:bg-indigo-200"
                >
                  {!formProps?.isOpenSearch ? (
                    <MagnifyingGlassIcon className="h-4 w-4 text-primary transition-none" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4 text-primary transition-none" />
                  )}
                  <span className="text-primary">
                    {!formProps?.isOpenSearch ? 'Show Grid' : 'Hide Grid'}
                  </span>
                </Button2>
              </>
            )}
          </div>
        </>
      )}
      {displayType === 'selected' && (
        <SelectedActions
          form={form}
          features={features}
          filterGridConfig={filterGridConfig}
          customFormFilterLockFormActions={customFormFilterLockFormActions}
        />
      )}
      {!form?.formState?.disabled &&
        filterGridConfig &&
        displayType !== 'selected' &&
        !formProps?.isOpenSearch && (
          <FormFilterOpenedActions
            features={features}
            selectedRecords={selectedRecords}
            customFormFilterViewFormActions={customFormFilterViewFormActions}
            onSubmitFormGrid={onSubmitFormGrid}
            handleRemovedSelectedRecords={handleRemovedSelectedRecords}
            form={form}
            filterGridConfig={filterGridConfig}
          />
        )}
    </div>
  );
};

export default FormBodyMainActions;
