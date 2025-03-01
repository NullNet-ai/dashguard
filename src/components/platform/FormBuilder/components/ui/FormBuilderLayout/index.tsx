'use client'
import { AccordionContent } from '@radix-ui/react-accordion'

import { Accordion, AccordionItem } from '~/components/ui/accordion'
import { CardContent } from '~/components/ui/card'

import { type IAccordionLayoutProps } from '../../../types/ui/interfaces'
import FormHeader from '../../controls/FormHeader'
import FormFilterGridLayout from '../FormFilterGridLayout'
import OpenedFormLayout from '../layout/opened'
import FormBodyMainActions from '../layout/opened/components/FormBodyMainActions'
import LockFormActions from '../layout/opened/components/LockFormActions'
import ViewFormActions from '../layout/opened/components/ViewFormActions'
import SelectedViewLayout from '../layout/selected'

const FormBuilderLayout = ({
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
  enableAppendForm,
  customFormFilterLockFormActions,
  customFormFilterViewFormActions,
  customFormHostLockFormActions,
  customFormHostViewFormActions,
  buttonHeaderRender,
  customDesign,
  isOpenSearch,
  handleAccordionChange,
  saveForm,
  handleListLoading,
  handleDebug,
  handleLock,
  handleRemovedSelectedRecords,
  onSubmitFormGrid,
  handleNewRecordFormFilterGrid,
  handleSelectedGridRecords,
  handleAppendForm,
  handleUpdateDisplayType,
  handleOpenForm,
  handleCloseGrid,
  setShowFormActions,
  customRender,
  onSelectFieldFilterGrid,
  handleSearchOpen,
}: IAccordionLayoutProps) => {
  const searchActive = isOpenSearch || false

  return (
    <Accordion
      className="w-full"
      collapsible={true}
      defaultValue="item-1"
      type="single"
      onValueChange={handleAccordionChange}
    >
      <AccordionItem value="item-1">
        <FormHeader
          buttonConfig={buttonConfig!}
          buttonHeaderRender={buttonHeaderRender}
          displayType={displayType}
          enableAppendForm={enableAppendForm}
          features={features}
          filterGridConfig={filterGridConfig}
          form={form}
          formKey={formKey}
          formLabel={formLabel!}
          formProps={{ ...formProps, handleSearchOpen, isOpenSearch }}
          formSchema={formSchema}
          handleAppendForm={handleAppendForm}
          handleDebug={handleDebug}
          handleLock={handleLock}
          handleNewRecordFormFilterGrid={handleNewRecordFormFilterGrid}
          handleOpen={handleOpenForm}
          handleUpdateDisplayType={handleUpdateDisplayType}
          headerClassName={customDesign?.headerClassName}
          isButtonLoading={isSaveLoading}
          isListLoading={isListLoading}
          open={isFormOpened}
          saveForm={saveForm}
          selectedRecords={formGridSelected}
        />
        <AccordionContent className="relative">
          {filterGridConfig && !customRender && (
            <>
              <FormBodyMainActions
                customFormFilterLockFormActions={
                  customFormFilterLockFormActions
                }
                customFormFilterViewFormActions={
                  customFormFilterViewFormActions
                }
                displayType={displayType}
                features={features}
                filterGridConfig={filterGridConfig}
                form={form}
                formGridSelected={formGridSelected}
                formLabel={formLabel!}
                formProps={{ ...formProps, handleSearchOpen, isOpenSearch }}
                handleAppendForm={handleAppendForm}
                handleRemovedSelectedRecords={handleRemovedSelectedRecords}
                handleUpdateDisplayType={handleUpdateDisplayType}
                isButtonLoading={isSaveLoading}
                isListLoading={isListLoading}
                searchActive={searchActive}
                selectedRecords={formGridSelected}
                onSubmitFormGrid={onSubmitFormGrid}
              />
              {searchActive && (
                <FormFilterGridLayout
                  filterGridConfig={filterGridConfig}
                  formKey={formKey}
                  handleCloseGrid={handleCloseGrid}
                  handleListLoading={handleListLoading}
                  handleSelectedGridRecords={handleSelectedGridRecords}
                  isFormOpen={isFormOpened}
                />
              )}
            </>
          )}
          {/* accommodate customRender for multiple form filters first */}
          {(displayType === 'form' || (filterGridConfig && customRender))
          && !searchActive && (
            <>
              {!form?.formState?.disabled && !filterGridConfig
                ? (
                    <CardContent className="absolute right-2">
                      <ViewFormActions
                        customFormHostViewFormActions={
                          customFormHostViewFormActions
                        }
                        features={features}
                        form={form}
                        formKey={formKey}
                        formProps={formProps}
                        formSchema={formSchema}
                        isButtonLoading={isSaveLoading}
                        saveForm={saveForm}
                      />
                    </CardContent>
                  )
                : (
                    !filterGridConfig && (
                      <CardContent className="absolute right-2">
                        <LockFormActions
                          customFormHostLockFormActions={
                            customFormHostLockFormActions
                          }
                          features={features}
                          form={form}
                          formKey={formKey}
                          formProps={formProps}
                          formSchema={formSchema}
                          isButtonLoading={isSaveLoading}
                          saveForm={saveForm}
                        />
                      </CardContent>
                    )
                  )}

              <OpenedFormLayout
                appendFormKey={appendFormKey!}
                checkboxOptions={checkboxOptions}
                currencyInputOptions={currencyInputOptions}
                customDesign={customDesign}
                customRender={customRender}
                debugOn={debugOn}
                displayType={displayType}
                fieldConfig={fieldConfig}
                fields={fields}
                filterGridConfig={filterGridConfig}
                form={form}
                formKey={formKey}
                formProps={formProps}
                formSchema={formSchema}
                handleDebug={handleDebug}
                handleLock={handleLock}
                handleUpdateDisplayType={handleUpdateDisplayType}
                multiSelectOnSearch={multiSelectOnSearch}
                multiSelectOptions={multiSelectOptions}
                myParent={myParent}
                radioOptions={radioOptions}
                selectOptions={selectOptions}
                setShowFormActions={setShowFormActions}
                showFormActions={showFormActions}
                onSelectFieldFilterGrid={onSelectFieldFilterGrid}
              />
            </>
          )}
          {displayType === 'selected' && (
            <SelectedViewLayout
              filterGridConfig={filterGridConfig}
              formGridSelected={formGridSelected}
              handleRemovedSelectedRecords={handleRemovedSelectedRecords}
              handleUpdateDisplayType={handleUpdateDisplayType}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default FormBuilderLayout
