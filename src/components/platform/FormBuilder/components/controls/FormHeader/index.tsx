import { LockIcon, PlusIcon } from "lucide-react";
import { Fragment } from "react";

import { Button } from "~/components/ui/button";
import { CardDescription, CardHeader } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { type IFormHeaderProps } from "../../../types/controls/interface";
import { DebugButton, UnlockButton } from "../../ui";
import ShowHideForm from "../../ui/Buttons/ShowHideForm";
import { testIDFormatter } from "~/utils/formatter";

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
    handleAppendForm,
    selectedRecords,
    handleUpdateDisplayType,
    formKey,
    features,
    formProps,
  } = props;

  const { enableUnlockFormFilter = true } = features ?? {}

  return (
    <CardHeader
      className={cn(
        "flex flex-row items-center justify-between bg-slate-100",
        headerClassName,
      )}
    >
      <CardDescription className="text-md font-semibold text-foreground">
        {formLabel}{" "}
      </CardDescription>
      <div className="flex flex-row space-x-2">
        <DebugButton
          handleDebug={handleDebug}
          // dataTestID={`${formKey}${formLabel.split(" ").join("")}FormDebugButton`}
          dataTestID={testIDFormatter(`${formProps?.entity ?? "no_entity"}-wzrd-${formKey}-debug-btn`)}
        />

        {displayType === "selected" && enableUnlockFormFilter && <Button
          type="button"
          variant={"ghost"}
          onClick={() => handleUpdateDisplayType("form")}
          className="h-6 w-6 rounded-full bg-primary/10 hover:bg-primary/20"
          size={"icon"}
          // data-test-id={`${formKey}${formLabel.split(" ").join("")}FormLockButton`}
          data-test-id={testIDFormatter(`${formProps?.entity ?? "no_entity"}-wzrd-${formKey}-lock-btn`)}
        >
          <LockIcon className="h-4 w-4 cursor-pointer rounded-full border text-primary" />
        </Button>}

        {form.formState.disabled && !filterGridConfig && (
          <Fragment>
            {buttonConfig?.hideLockButton ? null : (
              <UnlockButton
                handleLock={handleLock}
                dataTestID={testIDFormatter(`${formProps?.entity ?? "no_entity"}-wzrd-${formKey}-unlock-btn`)}
              />
            )}
          </Fragment>
        )}
        {buttonHeaderRender}

        {displayType === "selected" &&
          filterGridConfig?.actionType === "multi-select" && (
            <Button
              data-test-id={
                testIDFormatter(`${formProps?.entity ?? "no_entity"}-wzrd-${formKey}-form-filter-grd-add-btn`)
              }
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
            data-test-id={  testIDFormatter(`${formProps?.entity ?? "no_entity"}-wzrd-${formKey}-form-append-btn`)}
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
          data-test-id={  testIDFormatter(`${formProps?.entity ?? "no_entity"}-wzrd-${formKey}-${open ? "hide" : "show"}-form-btn`)}
        />
      </div>
    </CardHeader>
  );
};

export default FormHeader;
