/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { Card, CardContent } from "~/components/ui/card";
import { Collapsible, CollapsibleContent } from "~/components/ui/collapsible";
import { Form } from "~/components/ui/form";
import { useEventEmitter } from "~/context/EventEmitterProvider";
import { useWizard } from "../Wizard/Provider";
import DebuggerComponent from "./Debugger";
import { type TDisplayType, type IPropsForms } from "./type";
import { cn } from "~/lib/utils";
import FormHeader from "./Header/Main";
import FormModule from "./FormModule";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "~/components/ui/accordion";
import FormFilterGrid from "./FilterGrid/List";
import SelectedView from "./FilterGrid/SelectedView";
import { useToast } from "~/context/ToastProvider";
import { EllipsisVertical } from "lucide-react";

export function FormBuilder({
  fields,
  fieldConfig,
  selectOptions,
  currencyInputOptions,
  defaultValues,
  checkboxOptions,
  multiSelectOptions,
  multiSelectOnSearch,
  formSchema,
  radioOptions,
  formKey,
  formLabel = "Basic Form",
  formProps,
  myParent,
  enableFormRegisterToParent = true,
  customDesign,
  buttonConfig,
  buttonHeaderRender,
  filterGridConfig,
  enableAppendForm,
  appendFormKey,
  defaultDisplay = "expanded",
  handleSubmitFormGrid,
  handleSubmit,
  onFormChange,
  customRender,
  onDataChange,
}: IPropsForms) {
  const { actions } = useWizard();
  const eventEmitter = useEventEmitter();

  const [debugOn, setDebugOn] = useState(false);
  //@Button Loading
  const [saveLoading, setSaveLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  //@Button

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenGrid, setOpenGrid] = useState("");
  const [displayType, setDisplayType] = useState<TDisplayType>("form");
  const [formGridSelected, setFormGridSelected] = useState<any[]>([]);
  const [open, setOpen] = useState(
    defaultDisplay === "expanded" ? true : false,
  );
  const toast = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema), // is this where the validation relies?
    defaultValues,
    shouldFocusError: true,
  });

  useEffect(() => {
    if (!form?.formState?.isDirty) return;
    eventEmitter.emit(`formStatus:${formKey}`, {
      status: "dirty",
      form_key: formKey,
    });
  }, [form?.formState?.isDirty]);
  useEffect(() => {
    if (form?.formState?.errors) {
      console.debug(" 🇦🇨 [Form-Props ERRORS]", form?.formState?.errors);
    }
  }, [form?.formState?.errors]);

  useEffect(() => {
    if (!onFormChange) return;
    onFormChange(form);
  }, [form, onFormChange]);

  useEffect(() => {
    if (!onDataChange) return;

    // `watch` returns the updated form values each time any form field changes.
    const subscription = form.watch((values) => {
      onDataChange(values);
    });

    // Clean up the subscription on unmount
    return () => subscription.unsubscribe();
  }, [form.watch, onDataChange]);

  useEffect(() => {
    if (!filterGridConfig?.selectedRecords?.length) {
      setDisplayType("form");
      return;
    }
    setFormGridSelected(filterGridConfig?.selectedRecords);
    setDisplayType("selected");
  }, [filterGridConfig?.selectedRecords]);

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
  }, []);

  const handleListLoading = (loading: boolean) => {
    setListLoading(loading);
  };

  function disableForm() {
    form.clearErrors();
    form.control._disableForm(!form.formState.disabled);
  }

  const handleDebug = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setDebugOn(!debugOn);
  };

  const handleLock = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    disableForm();
  };

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setOpen(!open);
  };

  const handleCloseGrid = () => {
    setOpenGrid("");
  };

  const handleSelectedGridRecords = (records: any[]) => {
    setFormGridSelected(records);
    setDisplayType("selected");
  };

  const handleNewRecordFormFilterGrid = () => {
    setDisplayType("form");
  };

  const handleRemovedSelectedRecords = (records: any[]) => {
    if (!filterGridConfig?.onRemoveSelectedRecords) {
      toast.error("No onRemoveSelectedRecords function found");
      return;
    }
    Promise.resolve(
      filterGridConfig?.onRemoveSelectedRecords?.({
        rows: records,
        main_entity_id: filterGridConfig?.main_entity_id,
        filter_entity: filterGridConfig?.filter_entity,
      }),
    ).then((data) => {
      const newRecords = formGridSelected?.filter((item) => {
        return !records.some((record) => record.id === item.id);
      });
      setFormGridSelected(newRecords);
      handleCloseGrid();
      if (!newRecords.length) {
        setDisplayType("form");
        return;
      }
      setDisplayType("selected");
    });
  };

  const handleUpdateDisplayType = (type: SetStateAction<TDisplayType>) => {
    setDisplayType(type);
  };

  async function onSubmitFormGrid(data: z.infer<typeof formSchema>) {
    if (!handleSubmitFormGrid) return;
    try {
      setSaveLoading(true);
      const response = await handleSubmitFormGrid({
        data,
        main_id: filterGridConfig?.main_entity_id,
        filter_entity: filterGridConfig?.filter_entity,
        action_type: formGridSelected.length ? "Update" : "Create",
      });
      setFormGridSelected(response);
      setDisplayType("selected");
      setSaveLoading(false);
    } catch (error) {
      setSaveLoading(false);
      toast.error("[Form-Filter] Failed to create new record");
    }
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setSaveLoading(true);
    try {
      if (!form.formState.isDirty && !form.formState.defaultValues) {
        return toast.error("Form is Unchanged");
      }
      // Handle form validation and other checksF
      // if (!form.formState.isDirty) {
      //   eventEmitter.emit(`formStatus:${formKey}`, {
      //     status: "done",
      //     form_key: formKey,
      //   });
      //   setSaveLoading(false);
      //   return;
      // }

      // Trigger handleSubmit if it's defined
      if (handleSubmit) {
        const res = (await handleSubmit({ data, form })) as any;
        const { errors = {}, existing_record, existing = false } = res || {};

        const form_errors = errors?.form || [];
        setSaveLoading(false);

        if (form_errors.length || existing) {
          form_errors.map(
            ({ field, message }: { field: string; message: string }) => {
              form.setError(field, {
                type: "manual",
                message: message,
              });
            },
          );

          // if (existing) {
          //   const { id: existing_id, status } = existing_record || {};
          //   const { entity, navigate } = formProps || {};
          //   const { wizard_step = "1", record_tab = "dashboard" } =
          //     navigate || {};
          //   const last =
          //     status == "Draft"
          //       ? `wizard/${existing_id}/${wizard_step}`
          //       : `record/${existing_id}/${record_tab}`;
          //   router.push(`/portal/${entity}/${last}`);
          // }
          setSaveLoading(false);

          return;
        }

        if (!!Object.keys(form.formState.errors).length || form_errors.length) {
          eventEmitter.emit(`formStatus:${formKey}`, {
            status: "failed",
            form_key: formKey,
          });
          setSaveLoading(false);

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

        setSaveLoading(false);
      }
      setSaveLoading(false);
    } catch (error) {
      setSaveLoading(false);
    }
  }

  function handleAppendForm() {
    if (!enableAppendForm) return;
    eventEmitter.emit(`${formKey}:${appendFormKey}`);
  }

  async function saveForm(data: z.infer<typeof formSchema>) {
    if (!customRender) {
      eventEmitter.emit(`formStatus:${formKey}`, {
        status: "form_save",
        form_key: "action",
      });
      await onSubmit(data);
      return;
    }
    await onSubmit(data);
  }

  return (
    <form data-test-id={formKey + "Form"}>
      <Collapsible open={open} className="space-y-2">
        <Card
          className={cn(
            "border-none shadow-none",
            // form?.formState?.isDirty
            //   ? "border border-t-4 border-destructive/70"
            //   : "border border-t-4 border-primary/70",
            `p-0 sm:p-2`,
          )}
        >
          <Accordion
            type="single"
            collapsible
            className="w-full"
            value={isOpenGrid}
            onValueChange={(value) => {
              setIsOpen(value === "item-1");
              setOpenGrid(value);
            }}
          >
            <AccordionItem value="item-1">
              <FormHeader
                formKey={formKey}
                enableAppendForm={enableAppendForm}
                displayType={displayType}
                buttonHeaderRender={buttonHeaderRender}
                headerClassName={customDesign?.headerClassName}
                buttonConfig={buttonConfig}
                formLabel={formLabel}
                form={form}
                formSchema={formSchema}
                isButtonLoading={saveLoading}
                open={open}
                filterGridConfig={filterGridConfig}
                isListLoading={listLoading}
                saveForm={saveForm}
                handleDebug={handleDebug}
                handleLock={handleLock}
                handleOpen={handleOpen}
                onSubmitFormGrid={onSubmitFormGrid}
                handleNewRecordFormFilterGrid={handleNewRecordFormFilterGrid}
                handleAppendForm={handleAppendForm}
                selectedRecords={formGridSelected}
                handleUpdateDisplayType={handleUpdateDisplayType}
              />
              {filterGridConfig && (
                <AccordionContent
                  className={cn(
                    "fixed z-50 max-w-full",
                    isOpen
                      ? "accordion-content-enter accordion-content-enter-active"
                      : "accordion-content-exit accordion-content-exit-active",
                  )}
                >
                  <FormFilterGrid
                    handleListLoading={handleListLoading}
                    handleSelectedGridRecords={handleSelectedGridRecords}
                    handleCloseGrid={handleCloseGrid}
                    config={{
                      ...filterGridConfig,
                    }}
                  />
                </AccordionContent>
              )}

              <CollapsibleContent>
                {displayType === "form" && (
                  <CardContent
                    className={cn(
                      customDesign?.formClassName
                        ? customDesign?.formClassName
                        : "grid grid-cols-1 gap-4 sm:grid-cols-2",
                      !customRender
                        ? (customDesign?.formClassName ??
                            "grid grid-cols-1 gap-4 sm:grid-cols-2")
                        : "",
                      "shadow-none",
                    )}
                  >
                    <Form {...form}>
                      <Fragment>
                        {!customRender ? (
                          <FormModule
                            fieldConfig={fieldConfig}
                            formKey={formKey}
                            fields={fields}
                            form={form}
                            formSchema={formSchema}
                            subConfig={{
                              checkboxOptions,
                              multiSelectOptions,
                              multiSelectOnSearch,
                              radioOptions,
                              selectOptions,
                              currencyInputOptions,
                            }}
                            gridConfig={filterGridConfig!}
                          />
                        ) : (
                          customRender(form, {
                            appendButtonKey: `${formKey}:${appendFormKey || "not-found"}`,
                          })
                        )}
                      </Fragment>
                      {
                        // Debugger
                        debugOn && (
                          <DebuggerComponent
                            formKey={formKey}
                            formProps={formProps}
                            form={form}
                          />
                        )
                      }
                    </Form>
                  </CardContent>
                )}
                {
                  // Selected View
                  displayType === "selected" && (
                    <CardContent className="w-full">
                      <SelectedView
                        renderComponentSelected={
                          filterGridConfig?.renderComponentSelected
                        }
                        handleRemovedSelectedRecords={
                          handleRemovedSelectedRecords
                        }
                        handleUpdateDisplayType={handleUpdateDisplayType}
                        records={formGridSelected}
                      />
                    </CardContent>
                  )
                }
              </CollapsibleContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </Collapsible>
    </form>
  );
}
