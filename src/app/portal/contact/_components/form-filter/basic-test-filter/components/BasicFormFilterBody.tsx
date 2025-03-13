import { Lock, Repeat, X } from "lucide-react";
import React, { Fragment, useState } from "react";
import FormFilterGridLayout from "~/components/platform/FormBuilder/components/ui/FormFilterGridLayout";
import FormModule from "~/components/platform/FormBuilder/components/ui/FormModule/FormModule";
import FormFilterOpenedActions from "~/components/platform/FormBuilder/components/ui/layout/opened/components/FormFilterOpenedActions";
import SelectedActions from "~/components/platform/FormBuilder/components/ui/layout/selected/components/SelectedActions";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { GLOBAL_PARENT_VARIABLE_KEY } from "../constants";
import CreateUpdateButton from "./buttons/CreateUpdate";
import ShowGridButton from "./buttons/ShowGrid";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import CancelButton from "./buttons/Cancel";
import { IBasicFormFilterBodyProps } from "./types";

const BasicFormFilterBody: React.FC<IBasicFormFilterBodyProps> = (props) => {
  const {
    fieldList,
    defaultValues,
    field,
    index,
    form,
    formSchema,
    prefix,
    filterGridConfig,
    isEditMode,
    previousValues,
    handleCancel,
    handleToggleEditMode,
    onClickSubmit,
    onRemoveSelectedRecords,
    onSelectedGridRecords,
    update,
    remove,
  } = props;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFormOpened] = useState(true);
  const [isListLoading, setIsListLoading] = useState(false);

  const handleSubmitFieldValues = async () => {
    const isValid = await form?.trigger(
      `${GLOBAL_PARENT_VARIABLE_KEY}.${index}`,
    );
    if (isValid) {
      const fieldData = form?.getValues(
        `${GLOBAL_PARENT_VARIABLE_KEY}.${index}`,
      );
      onClickSubmit(index, fieldData);
      // Handle API submission for this specific fieldData
    } else {
      console.info(`Validation failed for index ${index}`);
    }
  };
  const handleRemovedSelectedRecords = (
    field: Record<string, any>,
    index: number,
  ) => onRemoveSelectedRecords(field, index);
  const handleListLoading = (loading: boolean) => setIsListLoading(loading);
  const handleResetForm = () =>
    field.code ? update(index, defaultValues) : remove(index);
  const handleSetIsSearchOpen = () => setIsSearchOpen(!isSearchOpen);
  const handleChangeSelection = () => handleToggleEditMode(index, true);
  const handleUnLock = () => handleToggleEditMode(index, true);

  return (
    <Fragment key={field._id}>
      <div className="flex flex-row items-center justify-between">
        {!isSearchOpen && (
          <div>
            <Label className="text-lg font-bold">
              {GLOBAL_PARENT_VARIABLE_KEY} {index + 1}
            </Label>
          </div>
        )}

        <div
          className={cn(
            `me-4 mt-4 flex justify-end gap-2`,
            `${isSearchOpen ? "w-full flex-col" : ""}`,
          )}
        >
          {!isEditMode ? (
            <Button onClick={handleUnLock} variant={"ghost"}>
              <Lock className="h-4 w-4" />
            </Button>
          ) : (
            <Fragment>
              {field?.code && !isSearchOpen && (
                <CancelButton
                  field={field}
                  handleResetForm={() => {
                    handleCancel(index);
                  }}
                  index={index}
                />
              )}
            </Fragment>
          )}
          {isEditMode && (
            <div className="flex flex-row gap-x-2 self-end">
              <CreateUpdateButton
                field={field}
                handleSubmitFieldValues={handleSubmitFieldValues}
                index={index}
                isSearchOpen={isSearchOpen}
              />
              <ShowGridButton
                handleSetIsSearchOpen={handleSetIsSearchOpen}
                index={index}
                isListLoading={isListLoading}
                isSearchOpen={isSearchOpen}
              />
            </div>
          )}
          {/**UNLOCK */}
          {!isEditMode && (
            <SelectedActions
              customFormFilterLockFormActions={[
                {
                  icon: <Repeat className="h-4 w-4 text-foreground" />,
                  label: "Change Selection",
                  onClick: handleChangeSelection,
                },
                {
                  icon: <X className="h-4 w-4 text-foreground" />,
                  label: "Remove Selection",
                  onClick: () => handleRemovedSelectedRecords(field, index),
                },
              ]}
              features={{
                enableLockFormEllipsis: true,
                enableLockFormCopy: true,
                enableLockFormView: true,
              }}
              filterGridConfig={filterGridConfig}
              form={form}
            />
          )}
          {isEditMode && !isSearchOpen && (
            <FormFilterOpenedActions
              customFormFilterViewFormActions={
                index !== 0
                  ? [
                      {
                        icon: <X className="h-4 w-4 text-foreground" />,
                        label: "Remove",
                        onClick: handleResetForm,
                      },
                    ]
                  : []
              }
              features={{
                enableViewFormClear: true,
                enableViewFormCopy: true,
                enableViewFormEllipsis: true,
                enableViewFormPaste: true,
                enableAutoSelect: false,
              }}
              filterGridConfig={filterGridConfig}
              form={form}
              selectedRecords={field.code ? [field] : []}
              onSubmitFormGrid={handleSubmitFieldValues}
              handleRemovedSelectedRecords={() => {
                console.info("[Work if single filter grid]");
              }}
            />
          )}
          {isSearchOpen && (
            <FormFilterGridLayout
              className="w-full"
              filterGridConfig={filterGridConfig}
              handleCloseGrid={() => {
                console.info("Closing Grid...");
              }}
              handleListLoading={handleListLoading}
              handleSelectedGridRecords={(record) => {
                setIsSearchOpen(!isSearchOpen);
                onSelectedGridRecords(record);
              }}
              isFormOpen={isFormOpened}
            />
          )}
        </div>
      </div>

      {/** OPENED FORM LAYOUT */}
      {isEditMode && !isSearchOpen && (
        <div className="border-l-[3px] border-gray-200 pl-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FormModule
              fields={fieldList}
              form={form}
              formKey={GLOBAL_PARENT_VARIABLE_KEY}
              formSchema={formSchema}
              gridConfig={filterGridConfig}
            />
          </div>
        </div>
      )}

      {/* SELECTED VIEW LAYOUT */}
      {!isEditMode && (
        <CardContent>
          <Fragment key={prefix}>
            <Card className="border-none shadow-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">{field.code}</CardTitle>
              </CardHeader>
              <CardContent>
                {filterGridConfig?.renderComponentSelected ? (
                  filterGridConfig.renderComponentSelected(
                    previousValues[GLOBAL_PARENT_VARIABLE_KEY][index],
                  )
                ) : (
                  <pre>
                    {JSON.stringify(
                      previousValues[GLOBAL_PARENT_VARIABLE_KEY][index],
                      null,
                      2,
                    )}
                  </pre>
                )}
              </CardContent>
            </Card>
            {/* {index !== records.length - 1 && <Separator />} */}
          </Fragment>
        </CardContent>
      )}
    </Fragment>
  );
};

export default BasicFormFilterBody;
