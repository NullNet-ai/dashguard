import { LockIcon, PlusIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { CardDescription, CardHeader } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { testIDFormatter } from '~/utils/formatter';

import { type IFormHeaderProps } from '../../../types/controls/interface';
import { DebugButton, UnlockButton } from '../../ui';
import ShowHideForm from '../../ui/Buttons/ShowHideForm';

const FormHeader = (props: IFormHeaderProps) => {
  const {
    headerClassName,
    buttonConfig,
    formLabel,
    form,
    open,
    buttonHeaderRender,
    filterGridConfig,
    displayType,
    enableAppendForm,
    handleNewRecordFormFilterGrid,
    handleDebug,
    handleLock,
    handleOpen,
    handleAppendForm,
    handleUpdateDisplayType,
    formKey,
    features,
    formProps,
  } = props;

  const { enableUnlockFormFilter = true } = features ?? {};

  return (
    <CardHeader
      className={cn(
        'flex flex-row items-center justify-between bg-slate-100', headerClassName,
      )}
    >
      <CardDescription className='text-md font-semibold text-foreground'>
        {formLabel}
        {' '}
      </CardDescription>
      <div className='flex flex-row space-x-2'>
        <DebugButton
          handleDebug={handleDebug}
          dataTestID={testIDFormatter(
            `${formProps?.entity ?? 'no_entity'}-wzrd-${formKey}-debug-btn`,
          )}
        />

        {displayType === 'selected' && enableUnlockFormFilter && (
          <Button
            className="h-6 w-6 rounded-full bg-primary/10 hover:bg-primary/20"
            type="button"
            variant="ghost"
            onClick={() => handleUpdateDisplayType('form')}
            size="icon"
            data-test-id={testIDFormatter(
              `${formProps?.entity ?? 'no_entity'}-wzrd-${formKey}-lock-btn`,
            )}
          >
            <LockIcon
              className="h-4 w-4 cursor-pointer rounded-full border text-primary"
            />
          </Button>
        )}

        {form.formState.disabled
        && !filterGridConfig
        && (buttonConfig?.hideLockButton
          ? null
          : (
              <UnlockButton
                dataTestID={testIDFormatter(
                  `${formProps?.entity ?? 'no_entity'}-wzrd-${formKey}-unlock-btn`,
                )}
                handleLock={handleLock}
              />
            ))}
        {buttonHeaderRender}

        {displayType === 'selected'
        && filterGridConfig?.actionType === 'multi-select' && (
          <Button
            data-test-id={testIDFormatter(
              `${formProps?.entity ?? 'no_entity'}-wzrd-${formKey}-form-filter-grd-add-btn`,
            )}
            size='xs'
            type='button'
            onClick={() => {
              handleNewRecordFormFilterGrid();
            }}
          >
            <PlusIcon className='h-4 w-4' />
            <span>Add</span>
          </Button>
        )}
        {enableAppendForm && (
          <Button
            data-test-id={testIDFormatter(
              `${formProps?.entity ?? 'no_entity'}-wzrd-${formKey}-form-append-btn`,
            )}
            size='xs'
            type='button'
            onClick={() => {
              handleAppendForm();
            }}
          >
            <PlusIcon className='h-4 w-4' />
            <span>Add</span>
          </Button>
        )}
        {/**
         *
         * @POLISHING LATER
         *
         */}
        <ShowHideForm
          data-test-id={testIDFormatter(
            `${formProps?.entity ?? 'no_entity'}-wzrd-${formKey}-${open ? 'hide' : 'show'}-form-btn`,
          )}
          handleOpen={handleOpen}
          hideAccordions={!!buttonConfig?.hideAccordions}
          open={open}
        />
      </div>
    </CardHeader>
  );
};

export default FormHeader;
