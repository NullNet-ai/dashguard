import { MagnifyingGlassCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Loader2, PlusIcon } from 'lucide-react';
import { Fragment } from 'react';

import { AccordionTrigger } from '~/components/ui/accordion';
import { Button } from '~/components/ui/button';
import { CardDescription, CardHeader } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { IFormHeaderProps } from '../../../types/controls/interface';
import { DebugButton, LockButton, UnlockButton } from '../../ui';
import ShowHideForm from '../../ui/Buttons/ShowHideForm';
import SubmitForm from '../../ui/Buttons/Submit';


const FormHeader = (props: IFormHeaderProps) => {
  const {
    headerClassName,
    buttonConfig,
    formLabel,
    form,
    formSchema,
    isButtonLoading,
    isListLoading,
    open,
    buttonHeaderRender,
    filterGridConfig,
    displayType,
    enableAppendForm,
    handleNewRecordFormFilterGrid,
    handleDebug,
    handleLock,
    handleOpen,
    saveForm,
    onSubmitFormGrid,
    handleAppendForm,
    selectedRecords,
    handleUpdateDisplayType,
  } = props;

  return (
    <CardHeader
      className={cn(
        "flex flex-row items-center justify-between bg-gray-100",
        headerClassName,
      )}
    >
      <CardDescription className="text-sm text-foreground">
        {formLabel}{" "}
      </CardDescription>
      <div className="flex flex-row space-x-2">
        <DebugButton
          handleDebug={handleDebug}
          dataTestID={formLabel.split(" ").join("") + "FormDebugButton"}
        />
        {form.formState.disabled ? (
          <Fragment>
            {buttonConfig?.hideLockButton ? null : (
              <UnlockButton
                handleLock={handleLock}
                dataTestID={formLabel.split(" ").join("") + "FormUnlockButton"}
              />
            )}
          </Fragment>
        ) : (
          <>
            {displayType === "form" && filterGridConfig && (
              <>
                {!!selectedRecords.length && (
                  <Button
                    name={
                      formLabel.split(" ").join("") +
                      `${selectedRecords.length ? "FormUpdateButton" : "FormCreateButton"}`
                    }
                    onClick={() => handleUpdateDisplayType("selected")}
                    type="submit"
                    loading={isButtonLoading}
                    size={"xs"}
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Cancel
                  </Button>
                )}
                <Button
                  name={
                    formLabel.split(" ").join("") +
                    `${selectedRecords.length ? "FormUpdateButton" : "FormCreateButton"}`
                  }
                  onClick={form.handleSubmit(onSubmitFormGrid)}
                  type="submit"
                  loading={isButtonLoading}
                  size={"xs"}
                >
                  <PlusIcon className="h-4 w-4" />
                  {selectedRecords.length ? "Update" : "Create"}
                </Button>
              </>
            )}

            {/* {!filterGridConfig && (
              <SubmitForm
                saveForm={saveForm}
                form={form}
                formSchema={formSchema}
                isLoading={isButtonLoading}
              />
            )} */}
            {buttonConfig?.hideLockButton || filterGridConfig ? null : (
              <LockButton
                handleLock={handleLock}
                dataTestID={formLabel.split(" ").join("") + "FormLockButton"}
              />
            )}
          </>
        )}
        {buttonHeaderRender}
        {filterGridConfig && (
          <AccordionTrigger
            disabled={isListLoading}
            hideTriggerIcon={true}
            className="m-0 p-0"
          >
            {isListLoading ? (
              <Loader2 className={cn("h-5 w-5 animate-spin text-gray-400")} />
            ) : (
              <MagnifyingGlassCircleIcon className="h-6 w-6 text-sky-500 transition-none" />
            )}
          </AccordionTrigger>
        )}

        {/**
         *
         * @POLISHING LATER
         *
         */}

        {displayType === "selected" &&
          filterGridConfig?.actionType === "multi-select" && (
            <Button
              onClick={() => {
                handleNewRecordFormFilterGrid();
              }}
              type="button"
              size={"xs"}
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add</span>
            </Button>
          )}
        {enableAppendForm && (
          <Button
            onClick={() => {
              handleAppendForm();
            }}
            type="button"
            size={"xs"}
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
          handleOpen={handleOpen}
          open={open}
          hideAccordions={!!buttonConfig?.hideAccordions}
        />
      </div>
    </CardHeader>
  );
}

export default FormHeader