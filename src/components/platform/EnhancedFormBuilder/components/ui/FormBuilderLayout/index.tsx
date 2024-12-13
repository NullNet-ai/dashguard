import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { CollapsibleContent } from "~/components/ui/collapsible";
import { IAccordionLayoutProps } from "../../../types/ui/interfaces";
import FormHeader from "../../controls/FormHeader";
import FormFilterGridLayout from "../FormFilterGridLayout";
import OpenedFormLayout from "../layout/opened";
import SelectedViewLayout from "../layout/selected";
import { CardContent } from "~/components/ui/card";
import ViewFormActions from "../layout/opened/components/ViewFormActions";
import { Loader2 } from "lucide-react";
import {
  MagnifyingGlassCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { cn } from "~/lib/utils";
import SelectedActions from "../layout/selected/components/SelectedActions";
import FormFilterOpenedActions from "../layout/opened/components/FormFilterOpenedActions";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import FormBodyMainActions from "../layout/opened/components/FormBodyMainActions";
import LockFormActions from "../layout/opened/components/LockFormActions";
import { AccordionContent } from "@radix-ui/react-accordion";
import { useSearchParams } from "next/navigation";

const FormBuilderLayout = ({
  //* data
  isOpenGrid,
  displayType,
  formLabel,
  form,
  buttonConfig,
  formSchema,
  isSaveLoading,
  isListLoading,
  filterGridConfig,
  formGridSelected,
  isFormOpened,
  fields,
  formKey,
  appendFormKey,
  checkboxOptions,
  multiSelectOptions,
  multiSelectOnSearch,
  radioOptions,
  selectOptions,
  currencyInputOptions,
  showFormActions,
  debugOn,
  formProps,
  features,
  //* actions
  handleAccordionChange,
  enableAppendForm,
  saveForm,
  handleListLoading,
  handleDebug,
  handleLock,
  handleAccordionExpand,
  handleRemovedSelectedRecords,
  onSubmitFormGrid,
  handleNewRecordFormFilterGrid,
  handleAppendForm,
  handleUpdateDisplayType,
  handleOpenForm,
  handleCloseGrid,
  setShowFormActions,
  //* other
  buttonHeaderRender,
  customDesign,
  customRender,
  customFormFilterLockFormActions,
  customFormFilterViewFormActions,
  customFormHostLockFormActions,
  customFormHostViewFormActions,
  onSelectFieldFilterGrid
}: IAccordionLayoutProps) => {

  const searchParams = useSearchParams();
  const searchActive = searchParams.get('search') === 'true';


  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      // value={isOpenGrid}
      onValueChange={handleAccordionChange}
      defaultValue="item-1"
    >
      <AccordionItem value="item-1">
        
        <FormHeader
          formProps={formProps}
          enableAppendForm={enableAppendForm}
          displayType={displayType}
          buttonHeaderRender={buttonHeaderRender}
          headerClassName={customDesign?.headerClassName}
          buttonConfig={buttonConfig!}
          formLabel={formLabel!}
          form={form}
          formSchema={formSchema}
          isButtonLoading={isSaveLoading}
          open={isFormOpened}
          filterGridConfig={filterGridConfig}
          isListLoading={isListLoading}
          saveForm={saveForm}
          handleDebug={handleDebug}
          handleLock={handleLock}
          handleOpen={handleOpenForm}
          features={features}
          onSubmitFormGrid={onSubmitFormGrid}
          handleNewRecordFormFilterGrid={handleNewRecordFormFilterGrid}
          handleAppendForm={handleAppendForm}
          selectedRecords={formGridSelected}
          handleUpdateDisplayType={handleUpdateDisplayType}
          formKey={formKey}
        />
        <AccordionContent className="relative">
        {filterGridConfig && (
          <>
            <FormBodyMainActions
              searchActive={searchActive}
              isListLoading={isListLoading}
              displayType={displayType}
              filterGridConfig={filterGridConfig}
              formGridSelected={formGridSelected}
              handleUpdateDisplayType={handleUpdateDisplayType}
              handleAppendForm={handleAppendForm}
              form={form}
              formLabel={formLabel!}
              isButtonLoading={isSaveLoading}
              features={features}
              onSubmitFormGrid={onSubmitFormGrid}
              selectedRecords={formGridSelected}
              handleRemovedSelectedRecords={handleRemovedSelectedRecords}
              customFormFilterViewFormActions={customFormFilterViewFormActions}
              customFormFilterLockFormActions={customFormFilterLockFormActions}
            />
            {
              searchActive && (
            <FormFilterGridLayout
              isFormOpen={isFormOpened}
              handleListLoading={handleListLoading}
              handleSelectedGridRecords={handleNewRecordFormFilterGrid}
              handleCloseGrid={handleCloseGrid}
              filterGridConfig={filterGridConfig}
            />
              )
            }
          </>
        )}
          {displayType === "form" && !searchActive && (
            <>
              {!form?.formState?.disabled && !filterGridConfig  ? (
                <CardContent className="absolute right-2">
                  <ViewFormActions
                    formProps={formProps}
                    saveForm={saveForm}
                    isButtonLoading={isSaveLoading}
                    form={form}
                    formSchema={formSchema}
                    formKey={formKey}
                    features={features}
                    customFormHostViewFormActions={customFormHostViewFormActions}
                  />
                </CardContent>
              ) : (
                <>
                 {!filterGridConfig && (
                <CardContent className="absolute right-2">
                  <LockFormActions
                    formProps={formProps}
                    saveForm={saveForm}
                    isButtonLoading={isSaveLoading}
                    form={form}
                    formSchema={formSchema}
                    formKey={formKey}
                    features={features}
                    customFormHostLockFormActions={customFormHostLockFormActions}
                  />
                </CardContent>
                 )}
                  
                </>
              )}

              <OpenedFormLayout
                customDesign={customDesign}
                customRender={customRender}
                fields={fields}
                form={form}
                formKey={formKey}
                appendFormKey={appendFormKey!}
                checkboxOptions={checkboxOptions}
                multiSelectOptions={multiSelectOptions}
                multiSelectOnSearch={multiSelectOnSearch}
                radioOptions={radioOptions}
                selectOptions={selectOptions}
                currencyInputOptions={currencyInputOptions}
                showFormActions={showFormActions}
                setShowFormActions={setShowFormActions}
                debugOn={debugOn}
                formProps={formProps}
                handleDebug={handleDebug}
                handleLock={handleLock}
                filterGridConfig={filterGridConfig}
                onSelectFieldFilterGrid={onSelectFieldFilterGrid}
                formSchema={formSchema}
              />
            </>
          )}
          {displayType === "selected" && (
            <SelectedViewLayout
              formGridSelected={formGridSelected}
              handleUpdateDisplayType={handleUpdateDisplayType}
              filterGridConfig={filterGridConfig}
              handleRemovedSelectedRecords={handleRemovedSelectedRecords}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FormBuilderLayout;
