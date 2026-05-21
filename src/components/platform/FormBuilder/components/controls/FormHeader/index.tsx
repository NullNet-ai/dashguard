import { LockIcon, PlusIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { CardDescription, CardHeader } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { testIDFormatter } from '~/utils/formatter';

import { type IFormHeaderProps } from '../../../types/controls/interface';
import { DebugButton, UnlockButton } from '../../ui';
import ShowHideForm from '../../ui/Buttons/ShowHideForm';
import { Fragment } from 'react';
import { isUndefined } from 'lodash';

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
    properties,
  } = props;
  const { isEditable = true, hasActions = true } = properties ?? {};
  const { enableUnlockFormFilter = true } = features ?? {};

  return (
    <CardHeader
      className={cn(
        'flex flex-row items-center justify-between bg-slate-100',
        headerClassName,
      )}
    >
      <CardDescription
        className="text-md font-semibold text-slate-800"
        data-test-id={testIDFormatter(
          `${formProps?.entity ?? 'no_entity'}-wizard-${formKey}-form-name`,
        )}
      >
        {formLabel}{' '}
      </CardDescription>
      <div className="flex flex-row space-x-2">
      {process.env.NODE_ENV !== "production" && (
        <DebugButton
          handleDebug={handleDebug}
          dataTestID={testIDFormatter(
            `${formProps?.entity ?? 'no_entity'}-wizard-${formKey}-debug-button`,
          )}
        />
      )}

        {properties?.hasActions ? (
          <Fragment>
            {displayType === 'selected' && enableUnlockFormFilter && (
              <Button
                className="size-[22px] rounded-full"
                type="button"
                variant="ghost"
                onClick={() => handleUpdateDisplayType('form')}
                size="icon"
                data-test-id={testIDFormatter(
                  `${formProps?.entity ?? 'no_entity'}-wizard-${formKey}-lock-button`,
                )}
              >
                <LockIcon className="h-4 w-4 cursor-pointer rounded-full border text-gray-700" />
              </Button>
            )}
          </Fragment>
        ) : null}

        {properties?.hasActions ? (
          <Fragment>
            {isEditable && (
              <Fragment>
                {form.formState.disabled &&
                  !filterGridConfig &&
                  (buttonConfig?.hideLockButton ? null : (
                    <UnlockButton
                      dataTestID={testIDFormatter(
                        `${formProps?.entity ?? 'no_entity'}-wizard-${formKey}-unlock-button`,
                      )}
                      handleLock={handleLock}
                    />
                  ))}
              </Fragment>
            )}
          </Fragment>
        ) : null}
        {buttonHeaderRender}

        {displayType === 'selected' &&
          filterGridConfig?.actionType === 'multi-select' && (
            <Button
              data-test-id={testIDFormatter(
                `${formProps?.entity ?? 'no_entity'}-wizard-${formKey}-form-filter-grid-add-button`,
              )}
              size="xs"
              type="button"
              onClick={() => {
                handleNewRecordFormFilterGrid();
              }}
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add</span>
            </Button>
          )}
        {enableAppendForm && (
          <Button
            data-test-id={testIDFormatter(
              `${formProps?.entity ?? 'no_entity'}-wizard-${formKey}-form-append-button`,
            )}
            size="xs"
            type="button"
            onClick={() => {
              handleAppendForm();
            }}
          >
            <PlusIcon className="h-4 w-4" />
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
            `${formProps?.entity ?? 'no_entity'}-wizard-${formKey}-${open ? 'hide' : 'show'}-form-button`,
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
