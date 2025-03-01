import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment, SetStateAction, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { type z } from "zod";
import { useWizard } from "~/components/platform/Wizard/Provider";
import { Accordion, AccordionItem } from "~/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button as Button2 } from "@headlessui/react";
import { Collapsible } from "~/components/ui/collapsible";
import { useEventEmitter } from "~/context/EventEmitterProvider";
import { useToast } from "~/context/ToastProvider";
import { cn } from "~/lib/utils";
import { testIDFormatter } from "~/utils/formatter";
import { UpdateCurrentSubTab } from "../../../Actions/UpdateCurrentSubTab";
import { IPropsForms, TDisplayType } from "../../../types";
import FormHeader from "../../controls/FormHeader";
import FormFilterGridLayout from "../../ui/FormFilterGridLayout";
import OpenedFormLayout from "../../ui/layout/opened";
import FormBodyMainActions from "../../ui/layout/opened/components/FormBodyMainActions";
import SelectedViewLayout from "../../ui/layout/selected";
import { ulid } from "ulid";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { XMarkIcon } from "@heroicons/react/24/solid";
import {
  EyeSlashIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import SelectedActions from "../../ui/layout/selected/components/SelectedActions";
import FormFilterOpenedActions from "../../ui/layout/opened/components/FormFilterOpenedActions";

export const MultipleFormBuilder: React.FC<IPropsForms> = (props) => {
  const {
    //* data
    fields,
    formSchema,
    defaultValues,
    formKey,
    appendFormKey,
    checkboxOptions,
    multiSelectOptions,
    multiSelectOnSearch,
    radioOptions,
    selectOptions,
    currencyInputOptions,
    //* actions
    onFormChange,
    onDataChange,
    handleSubmitFormGrid,
    handleSubmit,
    enableAppendForm,
    //* other
    enableFormRegisterToParent: _enableFormRegisterToParent,
    filterGridConfig,
    defaultDisplay = "expanded",
    customRender,
    formProps,
    features,
    create_mode = true,
    myParent,
    fieldConfig,
    buttonHeaderRender,
    buttonConfig,
    formLabel,
    customDesign,
    customFormFilterViewFormActions,
    customFormFilterLockFormActions,
  } = props;

  const { actions, state } = useWizard();
  const { entityName } = state ?? {};

  // this is to override the enableFormRegisterToParent if the parent is record which will cause rerendering of form builder
  const enableFormRegisterToParent =
    myParent === "record" ? false : _enableFormRegisterToParent;

  const eventEmitter = useEventEmitter();
  const toast = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema), // is this where the validation relies?
    defaultValues,
    shouldFocusError: false,
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: "form_builder_fields",
    keyName: "_id",
  });

  form.watch("form_builder_fields");

  //* LOCAL STATES
  const [isOpenGrid, setOpenGrid] = useState("");
  const [formGridSelected, setFormGridSelected] = useState<any[]>([]);
  const [displayType, setDisplayType] = useState<TDisplayType>("form");
  const [isAccordionExpanded, setIsAccordionExpanded] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);
  const [debugOn, setDebugOn] = useState(false);
  const [isFormOpened, setIsFormOpened] = useState(
    defaultDisplay === "expanded",
  );
  const [showFormActions, setShowFormActions] = useState(false);
  const [isOpenSearch, setIsOpenSearch] = useState(false);

  //* EFFECTS

  //* Effect to listen to form submission
  useEffect(() => {
    if (!form?.formState?.isDirty) return;
    eventEmitter.emit(`formStatus:${formKey}`, {
      status: "dirty",
      form_key: formKey,
    });
  }, [form?.formState?.isDirty]);

  //* Effect to listen to form errors
  useEffect(() => {
    if (form?.formState?.errors) {
      console.debug(" 🇦🇨 [Form-Props ERRORS]", form?.formState?.errors);
    }
  }, [form?.formState?.errors]);

  //* Effect to listen to form changes
  useEffect(() => {
    if (!onFormChange) return;
    onFormChange(form);
  }, [form, onFormChange]);

  //* Effect to listen to data changes
  useEffect(() => {
    if (!onDataChange) return;

    // `watch` returns the updated form values each time any form field changes.
    const subscription = form.watch((values) => {
      onDataChange(values);
    });

    // Clean up the subscription on unmount
    return () => subscription.unsubscribe();
  }, [form.watch, onDataChange]);

  //* Effect to listen to filter grid config changes
  useEffect(() => {
    if (!filterGridConfig?.selectedRecords?.length) {
      setDisplayType("form");
      return;
    }
    setFormGridSelected(filterGridConfig?.selectedRecords);
    setDisplayType("selected");
  }, [filterGridConfig?.selectedRecords]);

  //* Effect to listen to event emitter
  useEffect(() => {
    if (!eventEmitter) return;
    if (!enableFormRegisterToParent) return;
    if (myParent === "wizard" && actions?.registerSaveHandler) {
      actions?.registerSaveHandler?.(formKey);
    }

    if (myParent === "record") {
      disableForm(); //when it is a record form is default disabled
    }

    // Register the event listener for external submissions with a callback
    const eventSubmitHandler = async (
      resolve: () => any,
      reject: (reason: any) => any,
    ) => {
      try {
        await form.handleSubmit(onSubmit)(); // Trigger form submit and validation

        if (Object.keys(form?.formState?.errors).length > 0) {
          reject({
            message: "Validation failed",
            errors: form?.formState?.errors,
            status_code: 422, // 422 Unprocessable Entity
          });
          return;
        }
        resolve(); // Resolve when submission succeeds
      } catch (error) {
        reject(error); // Reject in case of errors
      }
    };
    eventEmitter.on(`submitForm:${formKey}`, eventSubmitHandler);
    // Clean up the listener when the component unmounts
    return () => {
      eventEmitter.off(`submitForm:${formKey}`, eventSubmitHandler);
    };
  }, [enableFormRegisterToParent, eventEmitter, form, formKey, myParent]);

  //* HANDLERS

  //* handler to disable form
  const handleCloseGrid = () => {
    setOpenGrid("");
  };

  const handleRemovedSelectedRecords = (
    currentFieldRecord: Record<string, any>[] = [],
    index = -1,
    records: any[],
  ) => {
    if (!filterGridConfig?.onRemoveSelectedRecords) {
      toast.error("No onRemoveSelectedRecords function found");
      return;
    }

    const mergedRecord = index > -1 ? currentFieldRecord : records;

    Promise.resolve(
      filterGridConfig?.onRemoveSelectedRecords?.({
        rows: mergedRecord,
        main_entity_id: filterGridConfig?.main_entity_id,
        filter_entity: filterGridConfig?.filter_entity,
      }),
    ).then(() => {
      const fields = form.getValues().form_builder_fields;
      fields.splice(index, 1);

      setFormGridSelected(fields);
      handleCloseGrid();
      fieldArray.remove(index);
      if (!fields.length) {
        setDisplayType("form");
        return;
      }
      setDisplayType("selected");
    });
  };

  const handleSearchOpen = () => {
    setIsOpenSearch(!isOpenSearch);
  };

  const handleAccordionChange = (value: string) => {
    setIsAccordionExpanded(value === "item-1");
    setOpenGrid(value);
  };

  const handleOpenForm = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsFormOpened(!isFormOpened);
  };

  const handleListLoading = (loading: boolean) => {
    setIsListLoading(loading);
  };

  const handleDebug = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setDebugOn(!debugOn);
  };

  const handleLock = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    disableForm();
  };

  const handleAccordionExpand = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsAccordionExpanded(!isAccordionExpanded);
  };

  const handleNewRecordFormFilterGrid = () => {
    // setDisplayType("form");
    const mappedFields = fields.reduce((acc, field) => {
      return {
        ...acc,
        [field.id]: "",
      };
    }, {});
    fieldArray.append({
      ...mappedFields,
      id: filterGridConfig?.main_entity_id,
    });
  };

  const handleAppendForm = () => {
    if (!enableAppendForm) return;
    eventEmitter.emit(`${formKey}:${appendFormKey}`);
  };

  const handleUpdateDisplayType = (type: SetStateAction<TDisplayType>) => {
    setDisplayType(type);
  };

  //* ACTIONS
  const disableForm = () => {
    form.clearErrors();
    form.control._disableForm(!form.formState.disabled);
  };

  const saveForm = async (data: z.infer<typeof formSchema>) => {
    if (!customRender) {
      eventEmitter.emit(`formStatus:${formKey}`, {
        status: "form_save",
        form_key: "action",
      });
      await onSubmit(data);
      return;
    }
    await onSubmit(data);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSaveLoading(true);
    try {
      if (!form.formState.isDirty && !form.formState.defaultValues) {
        return toast.error("Form is Unchanged");
      }
      // Handle form validation and other checks
      if (!form.formState.isDirty) {
        eventEmitter.emit(`formStatus:${formKey}`, {
          status: "done",
          form_key: formKey,
        });
        setIsSaveLoading(false);
        return;
      }

      // Trigger handleSubmit if it's defined
      if (handleSubmit) {
        const res = (await handleSubmit({ data, form })) as any;
        const { errors = {}, existing = false } = res || {};

        const form_errors = errors?.form || [];
        setIsSaveLoading(false);

        if (form_errors.length || existing) {
          form_errors.map(
            ({ field, message }: { field: string; message: string }) => {
              form.setError(field, {
                type: "manual",
                message: message,
              });
            },
          );
          setIsSaveLoading(false);

          return;
        }

        if (!!Object.keys(form.formState.errors).length || form_errors.length) {
          eventEmitter.emit(`formStatus:${formKey}`, {
            status: "failed",
            form_key: formKey,
          });
          setIsSaveLoading(false);

          return;
        }
        form.reset(data, {
          keepDirty: false,
          keepTouched: true,
        });

        eventEmitter.emit(`formStatus:${formKey}`, {
          status: "done",
          form_key: formKey,
        });

        form.control._disableForm(true);

        setIsSaveLoading(false);
      }
      setIsSaveLoading(false);
    } catch (error) {
      setIsSaveLoading(false);
      console.error("[Form-Filter] Failed to create new record", error);
    }
  };

  const onSubmitFormGrid = async (
    index: number,
    data: z.infer<typeof formSchema>,
  ) => {
    if (!handleSubmitFormGrid) return;
    const fields = form.getValues().form_builder_fields;
    const selected_item = fields[index];
    try {
      setIsSaveLoading(true);
      const response = await handleSubmitFormGrid({
        data: selected_item,
        main_id: filterGridConfig?.main_entity_id,
        filter_entity: filterGridConfig?.filter_entity,
        action_type: selected_item.id ? "Update" : "Create",
        form,
      });
      //TODO: Please cater setting error message in field and don't proceed to view mode.
      if (!response?.length) throw new Error("Failed to submit form grid");
      fields.splice(index, 1, response[0]);
      setFormGridSelected(fields);
      setDisplayType("selected");
      setIsSaveLoading(false);
    } catch (error) {
      setIsSaveLoading(false);
      console.error("[Form-Filter] Failed to create new record", error);
    }
  };

  const onSelectFieldFilterGrid = async (data: z.infer<typeof formSchema>) => {
    try {
      if (data?.code && create_mode) {
        UpdateCurrentSubTab({ tab_name: data.code });
      }
      setFormGridSelected([...formGridSelected, data]);
      setDisplayType("selected");
    } catch (error) {
      console.error("[Form-Filter] Failed onSelectFieldFilterGrid", error);
    }
  };

  const searchActive = isOpenSearch || false;

  return (
    <form
      data-test-id={testIDFormatter(
        `${formProps?.entity}-${formProps?.shell_type}-${formKey}-form`,
      )}
    >
      <Collapsible open={defaultDisplay === "expanded"} className="space-y-2">
        <Card className={cn("border-none shadow-none", `p-0 sm:p-2`)}>
          <div className="flex flex-col gap-2">
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
                {form
                  .getValues()
                  .form_builder_fields.map(
                    (field: Record<string, any>, index: number) => {
                      const prefix = `form_builder_fields.${index}`;
                      return (
                        <Fragment key={prefix}>
                          <>
                            {/* <FormBodyMainActions
                              formProps={{
                                ...formProps,
                                handleSearchOpen,
                                isOpenSearch,
                              }}
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
                              handleRemovedSelectedRecords={handleRemovedSelectedRecords.bind(
                                null,
                                [field],
                                index,
                              )}
                              customFormFilterViewFormActions={
                                customFormFilterViewFormActions
                              }
                              customFormFilterLockFormActions={
                                customFormFilterLockFormActions
                              }
                            /> */}
                            <div className="me-4 ms-auto mt-4 flex justify-end gap-2">
                              {displayType !== "selected" &&
                                filterGridConfig &&
                                !!Object.keys(filterGridConfig).length && (
                                  <>
                                    {!!field.code &&
                                      !formProps?.isOpenSearch && (
                                        <Button
                                          variant={"outline"}
                                          data-test-id={
                                            entityName + "-wzrd" + "-cancel-btn"
                                          }
                                          onClick={() => {
                                            form.reset(
                                              form.formState.defaultValues,
                                            );
                                            handleUpdateDisplayType("selected");
                                          }}
                                          type="button"
                                          loading={isSaveLoading}
                                          size={"xs"}
                                        >
                                          <XMarkIcon className="h-4 w-4" />
                                          Cancel
                                        </Button>
                                      )}
                                    {formLabel && !formProps?.isOpenSearch && (
                                      <>
                                        <Button
                                          variant={"default"}
                                          name={
                                            formLabel.split(" ").join("") +
                                            `${field.code ? "FormUpdateButton" : "FormCreateButton"}`
                                          }
                                          data-test-id={
                                            field.code
                                              ? entityName +
                                                "-wzrd" +
                                                "-update-btn"
                                              : entityName +
                                                "-wzrd" +
                                                "-create-btn"
                                          }
                                          onClick={form.handleSubmit(
                                            onSubmitFormGrid.bind(null, index),
                                          )}
                                          type="button"
                                          loading={isSaveLoading}
                                          size={"xs"}
                                          className="items-center gap-1 text-sm"
                                        >
                                          <PlusIcon className="h-4 w-4" />
                                          {field.code ? "Update" : "Create"}
                                        </Button>
                                        <Separator
                                          orientation="vertical"
                                          className="mr-1 py-3"
                                        />
                                      </>
                                    )}

                                    <div>
                                      {isListLoading ? (
                                        <Loader2
                                          className={cn(
                                            "h-5 w-5 animate-spin text-gray-400",
                                          )}
                                        />
                                      ) : (
                                        <>
                                          <Button2
                                            onClick={() => {
                                              formProps?.handleSearchOpen();
                                            }}
                                            data-test-id={
                                              !formProps?.isOpenSearch
                                                ? entityName +
                                                  "-wzrd" +
                                                  "-show-grd-btn"
                                                : entityName +
                                                  "-wzrd" +
                                                  "-hide-grd-btn"
                                            }
                                            className="inline-flex h-7 items-center gap-1 rounded bg-indigo-100 px-2 py-2 text-sm text-primary hover:bg-indigo-200"
                                          >
                                            {!formProps?.isOpenSearch ? (
                                              <MagnifyingGlassIcon className="h-4 w-4 text-primary transition-none" />
                                            ) : (
                                              <EyeSlashIcon className="h-4 w-4 text-primary transition-none" />
                                            )}
                                            <span className="text-primary">
                                              {!formProps?.isOpenSearch
                                                ? "Show Grid"
                                                : "Hide Grid"}
                                            </span>
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
                                  customFormFilterLockFormActions={
                                    customFormFilterLockFormActions
                                  }
                                />
                              )}

                              {!form?.formState?.disabled &&
                                filterGridConfig &&
                                displayType !== "selected" &&
                                !formProps?.isOpenSearch && (
                                  <FormFilterOpenedActions
                                    features={features}
                                    /**TODO: MODIFY */
                                    selectedRecords={field.code ? [field] : []}
                                    customFormFilterViewFormActions={
                                      customFormFilterViewFormActions
                                    }
                                    onSubmitFormGrid={onSubmitFormGrid}
                                    /**TODO: MODIFY */
                                    handleRemovedSelectedRecords={handleRemovedSelectedRecords.bind(
                                      null,
                                      [field],
                                      index,
                                    )}
                                    form={form}
                                    filterGridConfig={filterGridConfig}
                                  />
                                )}
                            </div>

                            {searchActive && (
                              <FormFilterGridLayout
                                isFormOpen={isFormOpened}
                                handleListLoading={handleListLoading}
                                handleSelectedGridRecords={
                                  handleNewRecordFormFilterGrid
                                }
                                handleCloseGrid={handleCloseGrid}
                                filterGridConfig={filterGridConfig!}
                              />
                            )}
                          </>
                          {displayType === "form" && !searchActive && (
                            <OpenedFormLayout
                              fieldConfig={fieldConfig}
                              myParent={myParent}
                              customDesign={customDesign}
                              customRender={customRender}
                              fields={fields.map((item) => {
                                return {
                                  ...item,
                                  id: `${prefix}.${item.id}`,
                                  name: `${prefix}.${item.id}`,
                                  disabled: field.disabled || false,
                                };
                              })}
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
                          )}
                          {displayType === "selected" && (
                            <CardContent>
                              <Fragment key={prefix}>
                                <Card className="border-none shadow-none">
                                  <CardHeader
                                    className={
                                      "flex flex-row items-center justify-between"
                                    }
                                  >
                                    <CardTitle className="text-sm">
                                      {field.code}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    {filterGridConfig?.renderComponentSelected ? (
                                      filterGridConfig.renderComponentSelected(
                                        field,
                                      )
                                    ) : (
                                      <pre>
                                        {JSON.stringify(field, null, 2)}
                                      </pre>
                                    )}
                                  </CardContent>
                                </Card>
                                {/* {index !== records.length - 1 && <Separator />} */}
                              </Fragment>
                            </CardContent>
                          )}
                          <Separator dashed />
                        </Fragment>
                      );
                    },
                  )}
              </AccordionItem>
            </Accordion>
          </div>
        </Card>
      </Collapsible>
    </form>
  );
};

// export the MultipleForm context
export default MultipleFormBuilder;
