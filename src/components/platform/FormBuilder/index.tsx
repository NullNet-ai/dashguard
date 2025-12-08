/* eslint-disable @typescript-eslint/no-misused-promises */
import { zodResolver } from '@hookform/resolvers/zod';
import React, { type SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { type z } from 'zod';

import { isSuccessStatus } from '~/components/platform/FormBuilder/Utils/http';
import { CardComponent as Card } from '~/components/ui/card/index';
import { Collapsible } from '~/components/ui/collapsible';
import { useEventEmitter } from '~/context/EventEmitterProvider';
import { useToast } from '~/context/ToastProvider';
import { cn } from '~/lib/utils';
import { testIDFormatter } from '~/utils/formatter';

import { useWizard } from '../Wizard/Provider';

import { UpdateCurrentSubTab } from './Actions/UpdateCurrentSubTab';
import { FormBuilderLayout } from './components/ui';
import { type IPropsForms, type TDisplayType } from './types';
import { isUndefined } from 'lodash';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

export const FormBuilder = (props: IPropsForms) => {
  const {
    //* data
    formSchema,
    defaultValues,
    formKey,
    appendFormKey,
    //* actions
    onFormChange,
    onDataChange,
    handleSubmitFormGrid,
    handleSubmit,
    enableAppendForm,
    //* other
    enableFormRegisterToParent: _enableFormRegisterToParent = true,
    filterGridConfig,
    defaultDisplay = 'expanded',
    customRender,
    formProps,
    features,
    create_mode = true,
    myParent,
    fieldConfig,
    customConfig,
    properties = {
      isEditable: true,
      hasActions: true,
      allowCopyPaste: true,
      allowRemoveSelection: true,
      allowUpdateRecord: true,
      selectOnly: false,
    },
  } = props;
  const { isEditable = true } = properties ?? {};
  const { actions } = useWizard();
  const router = useRouter();

  const enableFormRegisterToParent =
    myParent === 'record' ? false : _enableFormRegisterToParent;

  const eventEmitter = useEventEmitter();
  const toast = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
    shouldFocusError: false,
  });

  //* LOCAL STATES
  const [isOpenGrid, setOpenGrid] = useState('');
  const [formGridSelected, setFormGridSelected] = useState<any[]>([]);
  const [displayType, setDisplayType] = useState<TDisplayType>('form');
  const [isAccordionExpanded, setIsAccordionExpanded] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);
  const [debugOn, setDebugOn] = useState(false);
  const [isFormOpened, setIsFormOpened] = useState(
    defaultDisplay === 'expanded',
  );
  const [showFormActions, setShowFormActions] = useState(false);
  const [isOpenSearch, setIsOpenSearch] = useState(false);

  const pathname = usePathname();
  const [, , , app_type] = pathname.split('/');

  const { formHostInitialView } = features ?? {};
  //* EFFECTS

  //* Effect to listen to form submission
  useEffect(() => {
    if (!form?.formState?.isDirty) return;
    eventEmitter.emit(`formStatus:${formKey}`, {
      status: 'dirty',
      form_key: formKey,
    });
  }, [form?.formState?.isDirty]);

  //* Effect to listen to form errors
  useEffect(() => {
    if (form?.formState?.errors) {
      // eslint-disable-next-line no-console
      console.debug(' 🇦🇨 [Form-Props ERRORS]', form?.formState?.errors);
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
      const parsingResult = formSchema.safeParseAsync(defaultValues);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      parsingResult.then((result) => {
        if (result.success) {
          // form.control._disableForm(result.success)
          setDisplayType('form');
        }
      });

      // ! Testing
      if (!create_mode && formGridSelected?.length) {
        handleRemovedSelectedRecords(formGridSelected);
        return;
      }
    } else {
      setFormGridSelected(filterGridConfig?.selectedRecords);
      setDisplayType('selected');
    }
  }, [filterGridConfig?.selectedRecords]);

  //* Effect to listen to event emitter
  useEffect(() => {
    if (!eventEmitter) return;
    if (
      myParent === 'wizard' &&
      actions?.registerSaveHandler &&
      enableFormRegisterToParent
    ) {
      actions?.registerSaveHandler?.(formKey);
    }

    if (myParent === 'record') {
      disableForm();
    }

    // Register the event listener for external submissions with a callback
    const eventSubmitHandler = async (
      resolve: () => any,
      reject: (reason: any) => any,
    ) => {
      try {
        //
        await form.handleSubmit((args) => {
          return onSubmit(args, 'Next');
        })();

        if (Object.keys(form?.formState?.errors).length > 0) {
          reject({
            message: 'Validation failed',
            errors: form?.formState?.errors,
            status_code: 422,
          });
          return;
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    eventEmitter.on(`submitForm:${formKey}`, eventSubmitHandler);
    // Clean up the listener when the component unmounts
    return () => {
      eventEmitter.off(`submitForm:${formKey}`, eventSubmitHandler);
    };
  }, [enableFormRegisterToParent, eventEmitter, form, formKey, myParent]);

  useEffect(() => {
    if (
      formHostInitialView === 'lock' &&
      enableFormRegisterToParent === undefined &&
      myParent === undefined
    ) {
      disableForm();
    }
  }, [formHostInitialView, myParent, enableFormRegisterToParent]);

  useEffect(() => {
    if (!filterGridConfig) {
      if (!formHostInitialView) {
        setTimeout(() => {
          const defaultLock = myParent === 'record' ? true : false;
          form.control._disableForm(defaultLock);
        }, 100);
        return;
      }

      if (formHostInitialView === 'lock') {
        setTimeout(() => {
          form.control._disableForm(true);
        }, 100);
        return;
      }

      if (formHostInitialView === 'unlock') {
        setTimeout(() => {
          form.control._disableForm(false);
        }, 100);
        return;
      }
    }
  }, [form.control, formHostInitialView, myParent]);

  //* HANDLERS

  //* handler to disable form
  const handleCloseGrid = () => {
    setOpenGrid('');
  };

  const handleRemovedSelectedRecords = (records: any[]) => {
    if (!filterGridConfig?.onRemoveSelectedRecords) {
      toast.error('No onRemoveSelectedRecords function found');
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Promise.resolve(
      filterGridConfig?.onRemoveSelectedRecords?.({
        rows: records,
        main_entity_id: filterGridConfig?.main_entity_id,
        filter_entity: filterGridConfig?.filter_entity,
      }),
    ).then(() => {
      const newRecords = records.length
        ? formGridSelected?.filter((item) => {
            return !records.some((record) => record.id === item.id);
          })
        : [];

      eventEmitter.emit(`formStatus:${formKey}`, {
        status: 'done',
        form_key: formKey,
      });

      setFormGridSelected(newRecords);
      setOpenGrid('');

      if (!newRecords.length) {
        const currentValues = form.getValues();
        Object.keys(currentValues).forEach((key) => {
          const value = currentValues[key];

          if (Array.isArray(value)) {
            if (key === 'email' || key === 'emails') {
              currentValues[key] = [{ email: '' }];
            } else if (key === 'phone') {
              currentValues[key] = [
                {
                  raw_phone_number: '',
                  iso_code: 'us',
                  country_code: '+1',
                  is_primary: true,
                },
              ];
            } else {
              currentValues[key] = [];
            }
          } else if (typeof value === 'string') {
            currentValues[key] = '';
          } else if (typeof value === 'object' && value !== null) {
            currentValues[key] = {};
          } else {
            currentValues[key] = null;
          }
        });
        form.reset(currentValues);
        setDisplayType('form');
        router.refresh();
        return;
      }

      setDisplayType('selected');
      router.refresh();
    });
  };

  const handleSearchOpen = () => {
    setIsOpenSearch(!isOpenSearch);
  };

  const handleAccordionChange = (value: string) => {
    setIsAccordionExpanded(value === 'item-1');
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
    setDisplayType('form');
  };

  const handleSelectedGridRecords = (data: Record<string, any>[]) => {
    const record =
      filterGridConfig?.actionType === 'single-select' ? data?.[0] : data;

    form.reset(record, {
      keepDirty: false,
      keepTouched: true,
    });

    setFormGridSelected(data);
    handleSearchOpen();
    handleCloseGrid();
    setDisplayType('selected');
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
        status: 'form_save',
        form_key: 'action',
      });
      await onSubmit(data);
      return;
    }
    await onSubmit(data);
  };

  const onSubmit = async (
    data: z.infer<typeof formSchema>,
    action_type?: string,
  ) => {
    setIsSaveLoading(true);
    try {
      if (!form.formState.isDirty && !form.formState.defaultValues) {
        console.debug('[Form Status]: Pristine and No default values');
        return;
      }
      // Handle form validation and other checks
      // what's the use of this function???
      if (!form.formState.isDirty) {
        eventEmitter.emit(`formStatus:${formKey}`, {
          status: 'done',
          form_key: formKey,
        });
        setIsSaveLoading(false);
        form.control._disableForm(true);
        console.debug('[Form Status]: Pristine');
        console.debug('[Action Type]: ', action_type);
        if (handleSubmit && action_type === 'Next') {
          handleSubmit({
            data,
            form,
            action_type: 'Pristine:Next',
          }) as any;
          return;
        }

        return;
      }
      console.debug('[Form Status]: Dirty');

      if (handleSubmitFormGrid) {
        await onSubmitFormGrid(data, {
          action_type: action_type,
        });
        return;
      }

      // Trigger handleSubmit if it's defined
      if (handleSubmit) {
        const res = (await handleSubmit({
          data,
          form,
          action_type: action_type,
        })) as any;
        const {
          errors = {},
          existing = false,
          data: response_data,
        } = res || {};
        const { httpStatus } = response_data ?? {};

        const form_errors = errors?.form || [];
        setIsSaveLoading(false);

        if (form_errors.length || existing) {
          form_errors.map(
            ({ field, message }: { field: string; message: string }) => {
              form.setError(field, {
                type: 'manual',
                message,
              });
            },
          );
          setIsSaveLoading(false);

          return;
        }

        if (
          !!Object.keys(form.formState.errors).length ||
          form_errors.length ||
          (httpStatus && !isSuccessStatus(httpStatus))
        ) {
          eventEmitter.emit(`formStatus:${formKey}`, {
            status: 'failed',
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
          status: 'done',
          form_key: formKey,
        });
        eventEmitter.emit('record:summary_content');

        form.control._disableForm(true);

        setIsSaveLoading(false);
      }
      setIsSaveLoading(false);
    } catch (error) {
      setIsSaveLoading(false);
      console.error('[Form-Filter] Failed to create new record', error);
    }
  };

  const onSubmitFormGrid = async (
    data: z.infer<typeof formSchema>,
    options?: {
      action_type?: string;
    },
  ) => {
    if (!handleSubmitFormGrid) return;
    try {
      setIsSaveLoading(true);

      const response = await handleSubmitFormGrid({
        data,
        main_id: filterGridConfig?.main_entity_id,
        filter_entity: filterGridConfig?.filter_entity,
        action_type:
          options?.action_type ||
          (formGridSelected.length ? 'Update' : 'Create'),
        form,
      });

      if (!response?.length) {
        eventEmitter.emit(`formStatus:${formKey}`, {
          status: 'failed',
          form_key: formKey,
        });
        throw new Error('Failed to submit form grid');
      }

      eventEmitter.emit(`formStatus:${formKey}`, {
        status: 'done',
        form_key: formKey,
      });
      eventEmitter.emit('record:summary_content');

      setFormGridSelected(response);
      setIsSaveLoading(false);
      setDisplayType('selected');
    } catch (error) {
      setIsSaveLoading(false);
      console.error('[Form-Filter] Failed to create new record', error);
    }
  };

  const onSelectFieldFilterGrid = async () => {
    try {
      const data = form.getValues();
      if (data?.code && create_mode) {
        await UpdateCurrentSubTab({ tab_name: data.code });
      }
      await filterGridConfig?.onSelectRecords?.({
        rows: [data],
        main_entity_id: filterGridConfig?.main_entity_id,
        filter_entity: filterGridConfig?.filter_entity,
      });
      setFormGridSelected([data]);
      eventEmitter.emit(`formStatus:${formKey}`, {
        status: 'done',
        form_key: formKey,
      });
      eventEmitter.emit('record:summary_content');

      setDisplayType('selected');
    } catch (error) {
      console.error('[Form-Filter] Failed onSelectFieldFilterGrid', error);
    }
  };
  useEffect(() => {
    if (isUndefined(properties?.isEditable)) return;
    form?.control._disableForm(!properties?.isEditable);
  }, [properties?.isEditable]);

  //* RENDER
  return (
    <form
      data-test-id={testIDFormatter(
        `${formProps?.entity}-${formProps?.shell_type}-${formKey}-form`,
      )}
    >
      <Collapsible className="space-y-2" open={defaultDisplay === 'expanded'}>
        <Card className="!rounded-b-[8px] !rounded-t-[2px] ![overflow:unset]">
          <FormBuilderLayout
            {...props}
            debugOn={debugOn}
            displayType={displayType}
            features={features}
            fieldConfig={fieldConfig}
            form={form}
            formGridSelected={formGridSelected}
            handleAccordionChange={handleAccordionChange}
            handleAccordionExpand={handleAccordionExpand}
            handleAppendForm={handleAppendForm}
            handleCloseGrid={handleCloseGrid}
            handleDebug={handleDebug}
            handleListLoading={handleListLoading}
            handleLock={handleLock}
            handleNewRecordFormFilterGrid={handleNewRecordFormFilterGrid}
            handleOpenForm={handleOpenForm}
            handleRemovedSelectedRecords={handleRemovedSelectedRecords}
            handleSearchOpen={handleSearchOpen}
            handleSelectedGridRecords={handleSelectedGridRecords}
            handleUpdateDisplayType={handleUpdateDisplayType}
            isAccordionExpanded={isAccordionExpanded}
            isFormOpened={isFormOpened}
            isListLoading={isListLoading}
            isOpenGrid={isOpenGrid}
            isOpenSearch={isOpenSearch}
            isSaveLoading={isSaveLoading}
            myParent={myParent}
            saveForm={saveForm}
            setIsSaveLoading={setIsSaveLoading}
            setShowFormActions={setShowFormActions}
            showFormActions={showFormActions}
            onSelectFieldFilterGrid={onSelectFieldFilterGrid}
            onSubmitFormGrid={onSubmitFormGrid}
            properties={properties}
          />
        </Card>
      </Collapsible>
    </form>
  );
};
