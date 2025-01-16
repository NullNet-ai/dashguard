"use client";
import { Accordion, AccordionItem } from "~/components/ui/accordion";
import { type IAccordionLayoutProps } from "../../../types/ui/interfaces";
import FormHeader from "../../controls/FormHeader";
import FormFilterGridLayout from "../FormFilterGridLayout";
import OpenedFormLayout from "../layout/opened";
import SelectedViewLayout from "../layout/selected";
import { CardContent } from "~/components/ui/card";
import ViewFormActions from "../layout/opened/components/ViewFormActions";

import FormBodyMainActions from "../layout/opened/components/FormBodyMainActions";
import LockFormActions from "../layout/opened/components/LockFormActions";
import { AccordionContent } from "@radix-ui/react-accordion";

const FormBuilderLayout = ({
  //* data
  isOpenGrid,
  displayType,
  formLabel,
  form,
  fieldConfig,
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
  myParent,
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
  handleSelectedGridRecords,
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
  onSelectFieldFilterGrid,
  handleSearchOpen,
  isOpenSearch,
}: IAccordionLayoutProps) => {
  const searchActive = isOpenSearch || false;

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
          formProps={{ ...formProps, handleSearchOpen, isOpenSearch }}
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
          handleNewRecordFormFilterGrid={handleNewRecordFormFilterGrid}
          handleAppendForm={handleAppendForm}
          selectedRecords={formGridSelected}
          handleUpdateDisplayType={handleUpdateDisplayType}
          formKey={formKey}
        />
        <AccordionContent className="relative">
          {filterGridConfig && !customRender && (
            <>
              <FormBodyMainActions
                formProps={{ ...formProps, handleSearchOpen, isOpenSearch }}
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
                customFormFilterViewFormActions={
                  customFormFilterViewFormActions
                }
                customFormFilterLockFormActions={
                  customFormFilterLockFormActions
                }
              />
              {searchActive && (
                <FormFilterGridLayout
                  isFormOpen={isFormOpened}
                  handleListLoading={handleListLoading}
                  handleSelectedGridRecords={handleSelectedGridRecords}
                  handleCloseGrid={handleCloseGrid}
                  filterGridConfig={filterGridConfig}
                />
              )}
            </>
          )}
          {/* accommodate customRender for multiple form filters first */}
          {(displayType === "form" || (filterGridConfig && customRender)) &&
            !searchActive && (
              <>
                {!form?.formState?.disabled && !filterGridConfig ? (
                  <CardContent className="absolute right-2">
                    <ViewFormActions
                      formProps={formProps}
                      saveForm={saveForm}
                      isButtonLoading={isSaveLoading}
                      form={form}
                      formSchema={formSchema}
                      formKey={formKey}
                      features={features}
                      customFormHostViewFormActions={
                        customFormHostViewFormActions
                      }
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
                          customFormHostLockFormActions={
                            customFormHostLockFormActions
                          }
                        />
                      </CardContent>
                    )}
                  </>
                )}

                <OpenedFormLayout
                  displayType={displayType}
                  fieldConfig={fieldConfig}
                  myParent={myParent}
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
                  handleUpdateDisplayType={handleUpdateDisplayType}
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
