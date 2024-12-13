import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import React from "react";
import {Button as Button2} from '@headlessui/react'
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import SelectedActions from "../../selected/components/SelectedActions";
import FormFilterOpenedActions from "./FormFilterOpenedActions";
import { AccordionTrigger } from "~/components/ui/accordion";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { ICustomActions, IFeatures } from "~/components/platform/EnhancedFormBuilder/types";
import { Separator } from "~/components/ui/separator";
import { useRouter } from 'next/navigation';


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
}) => {

  const router = useRouter();


  return (
    <div className="me-4 ms-auto mt-4 flex justify-end gap-2">
      {displayType !== "selected" && !!Object.keys(filterGridConfig).length && (
        <>
          {!!selectedRecords?.length && (
            <Button
              variant={"outline"}
              name={
                formLabel.split(" ").join("") +
                `${selectedRecords.length ? "FormUpdateButton" : "FormCreateButton"}`
              }
              onClick={() => {
                form.reset(form.formState.defaultValues)
                handleUpdateDisplayType("selected")
              }}
              type="button"
              loading={isButtonLoading}
              size={"xs"}
            >
              <XMarkIcon className="h-4 w-4" />
              Cancel
            </Button>
          )}
          {!searchActive && (
            <>
          <Button
            variant={"default"}
            name={
              formLabel.split(" ").join("") +
              `${selectedRecords.length ? "FormUpdateButton" : "FormCreateButton"}`
            }
            onClick={form.handleSubmit(onSubmitFormGrid)}
            type="button"
            loading={isButtonLoading}
            size={"xs"}
            className="gap-1 items-center text-sm"
          >
            <PlusIcon className="h-4 w-4" />
            {selectedRecords.length ? "Update" : "Create"}
          </Button>
          <Separator orientation="vertical" className="py-3 mr-1"/>
            </>
          )}
          

          <div>
            {isListLoading ? (
              <Loader2 className={cn("h-5 w-5 animate-spin text-gray-400")} />
            ) : (
              <>
              <Button2
                onClick={() => {
                  if(searchActive) {
                    router.push('?');
                    return;
                  }
                  router.push('?search=true');
                }}
              className="bg-indigo-100 hover:bg-indigo-200 text-primary px-2 inline-flex text-sm py-2 h-7 items-center  gap-1 rounded">
                <MagnifyingGlassIcon className="h-4 w-4  text-primary transition-none" />
                <span className="text-primary">Search</span>
              </Button2>
              </>
            )}
          </div>
        </>
      )}
      {displayType === "selected" && (
        <SelectedActions
          form={form}
          features={features}
          filterGridConfig={filterGridConfig}
          customFormFilterLockFormActions={customFormFilterLockFormActions}
        />
      )}

      {!form?.formState?.disabled &&
        filterGridConfig &&
        displayType !== "selected" && (
          <FormFilterOpenedActions
            features={features}
            selectedRecords={selectedRecords}
            customFormFilterViewFormActions={customFormFilterViewFormActions}
            onSubmitFormGrid={onSubmitFormGrid}
            handleRemovedSelectedRecords={handleRemovedSelectedRecords}
            form={form}
          />
        )}
    </div>
  );
};

export default FormBodyMainActions;
