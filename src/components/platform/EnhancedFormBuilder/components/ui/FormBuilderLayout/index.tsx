import { Accordion, AccordionItem } from "~/components/ui/accordion";
import { CollapsibleContent } from "~/components/ui/collapsible";
import { IAccordionLayoutProps } from "../../../types/ui/interfaces";
import FormHeader from "../../controls/FormHeader";
import FormFilterGridLayout from "../FormFilterGridLayout";
import OpenedFormLayout from "../layout/opened";
import SelectedViewLayout from "../layout/selected";
import { CardContent } from "~/components/ui/card";
import ViewFormActions from "../layout/opened/components/ViewFormActions";

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
  //* actions
  handleAccordionChange,
  enableAppendForm,
  saveForm,
  handleListLoading,
  handleDebug,
  handleLock,
  handleAccordionExpand,
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
}: IAccordionLayoutProps) => {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={isOpenGrid}
      onValueChange={handleAccordionChange}
    >
      <AccordionItem value="item-1">
        <FormHeader
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
          onSubmitFormGrid={onSubmitFormGrid}
          handleNewRecordFormFilterGrid={handleNewRecordFormFilterGrid}
          handleAppendForm={handleAppendForm}
          selectedRecords={formGridSelected}
          handleUpdateDisplayType={handleUpdateDisplayType}
        />
        {filterGridConfig && (
          <FormFilterGridLayout
            isFormOpen={isFormOpened}
            handleListLoading={handleListLoading}
            handleSelectedGridRecords={handleNewRecordFormFilterGrid}
            handleCloseGrid={handleCloseGrid}
            filterGridConfig={filterGridConfig}
          />
        )}
        <CollapsibleContent>
          {displayType === "form" && (
            <>
            {
              !form?.formState?.disabled &&
               <CardContent className="absolute right-2">
               <ViewFormActions
                 saveForm={saveForm}
                 isButtonLoading={isSaveLoading}
                 form={form}
                 formSchema={formSchema}
               />
             </CardContent>
            }
              
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
              />
            </>
          )}
          {displayType === "selected" && (
            <SelectedViewLayout
              formGridSelected={formGridSelected}
              handleUpdateDisplayType={handleUpdateDisplayType}
              filterGridConfig={filterGridConfig}
              handleRemovedSelectedRecords={handleAppendForm}
            />
          )}
        </CollapsibleContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FormBuilderLayout;
