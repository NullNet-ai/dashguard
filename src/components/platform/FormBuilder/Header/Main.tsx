import { CardDescription, CardHeader } from "~/components/ui/card";
import DebugButton from "../Buttons/Debug";
import { Fragment } from "react";
import UnLockButton from "../Buttons/Unlock";
import SubmitForm from "../Buttons/Submit";
import LockButton from "../Buttons/Lock";
import ShowHideForm from "../Buttons/ShowHideForm";
import {
  type IButtonConfig,
  type IFilterGridConfig,
  type TDisplayType,
} from "../type";
import { type z } from "zod";
import { type UseFormReturn } from "react-hook-form";
import { cn } from "~/lib/utils";
import { AccordionTrigger } from "~/components/ui/accordion";
import {
  MagnifyingGlassCircleIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";

export default function FormHeader({
  buttonConfig,
  form,
  formLabel,
  formSchema,
  formKey,
  isButtonLoading,
  isListLoading,
  open,
  headerClassName,
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
}: {
  buttonConfig?: IButtonConfig;
  form: UseFormReturn<Record<string, any>, any, undefined>;
  formLabel: string;
  formSchema: z.ZodObject<any, any> | z.ZodEffects<z.ZodObject<any, any>>;
  isButtonLoading: boolean;
  isListLoading?: boolean;
  open: boolean;
  headerClassName?: string;
  buttonHeaderRender?: JSX.Element;
  filterGridConfig?: IFilterGridConfig;
  displayType: TDisplayType;
  enableAppendForm?: boolean;
  handleAppendForm(): void;
  handleNewRecordFormFilterGrid: () => void;
  handleDebug: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleLock: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleOpen: (e: React.MouseEvent<HTMLButtonElement>) => void;
  saveForm(data: z.infer<typeof formSchema>): Promise<void>;
  onSubmitFormGrid(data: z.infer<typeof formSchema>): Promise<void>;
  selectedRecords: any[];
  handleUpdateDisplayType: (type: TDisplayType) => void;
  formKey?: string;
}) {
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
        {process.env.NEXT_NODE_ENV === "local" ? (
          <DebugButton
            handleDebug={handleDebug}
            dataTestID={formLabel.split(" ").join("") + "FormDebugButton"}
          />
        ) : null}
        {form.formState.disabled ? (
          <Fragment>
            {buttonConfig?.hideLockButton ? null : (
              <UnLockButton
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
                  data-test-id={`submitFormButton${formKey}`}
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

            {!filterGridConfig && (
              <SubmitForm
                saveForm={saveForm}
                form={form}
                formKey={formKey}
                formSchema={formSchema}
                isLoading={isButtonLoading}
              />
            )}
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
            data-test-id={`${formKey}AppendFormButton`}
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
