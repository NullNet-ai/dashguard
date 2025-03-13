/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Fragment, useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { ulid } from 'ulid';
import { Separator } from '~/components/ui/separator';
import { useEventListener } from '~/hooks/useEventListener';
import { GLOBAL_PARENT_VARIABLE_KEY } from '../constants';
import BasicFormFilterBody from './BasicFormFilterBody';
import useEnableEditMode from '../hooks/displayFunction';
import FormFields from '../_config/formFields';
import { IMultipleFormProps } from './types';
import { useEditMode } from '../hooks/editModeFunction';

const MultipleForm: React.FC<IMultipleFormProps> = (props) => {
  const {
    defaultValues,
    form,
    appendFormKey,
    filterGridConfig,
    formSchema,
    displayType,
  } = props;
  form.watch(GLOBAL_PARENT_VARIABLE_KEY);
  const [previousValues, setPreviousValues] =
    useState<Record<string, any>>(defaultValues);
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: GLOBAL_PARENT_VARIABLE_KEY,
    keyName: '_id',
  });
  const { editMode, setEditMode } = useEditMode(fields);

  const appendContainer = () => {
    append({
      id: ulid(),
      code: '',
    });

    editMode?.push({
      index: editMode?.length,
      in_edit_mode: true,
    });
    setEditMode(editMode);
  };

  /**
   *
   * @param field
   * @param index
   *
   */
  const handleRemoveSelectedRecords = async (
    field: Record<string, any>,
    index: number,
  ) => {
    // ! Remove this later
    alert(`[Remove Selected Record]:${field?.code}:${index}`);
    // ! Remove this later
    // eslint-disable-next-line no-console
    console.log('[Remove Selected Record]', {
      field,
    });

    /**
     *
     * @Promise
     * ! Your logic goes here
     *
     */

    form?.setValue(`${GLOBAL_PARENT_VARIABLE_KEY}.${index}.code`, '');
    // ? Use this after mutation success
    // ? This is to toggle the selected view to form mode
    handleToggleEditMode(index, true);
  };

  const handleOnClickSubmit = async (
    index: number,
    fieldData: Record<string, any>,
  ) => {
    alert(`[Submit Create/Update Record]:${index}`);
    // ! Remove this later
    // eslint-disable-next-line no-console
    console.log('[Submit Create/Update Record]', {
      index,
      fieldData,
    });

    /**
     *
     * @Promise
     * ! Your logic goes here
     *
     */

    // ? Use this after mutation success
    // ? This is to toggle the selected view to form mode
    handleToggleEditMode(index, false);
    handleUpdateDefaultValue(index);
  };

  const handleSelectedGridRecords = async (
    record: Record<string, any>,
    index: number,
  ) => {
    console.info({
      record,
    });

    /**
     *
     * @Promise
     * ! Your logic goes here
     *
     */

    handleToggleEditMode(index, false);
    // setIsFormOpened(false);
  };

  const handleCancel = (index: number) => {
    handleToggleEditMode(index, false);
    const toBeReset = previousValues[GLOBAL_PARENT_VARIABLE_KEY][index];
    form?.setValue(`${GLOBAL_PARENT_VARIABLE_KEY}.${index}`, toBeReset);
  };

  const handleUpdateDefaultValue = (index: number) => {
    const toBeReset = form.getValues()[GLOBAL_PARENT_VARIABLE_KEY][index];
    const payload = form
      .getValues()
      [GLOBAL_PARENT_VARIABLE_KEY].map((item: any, idx: number) => {
        if (index === idx) {
          return {
            ...item,
            ...toBeReset,
          };
        }
        return item;
      });
    form.setValue(GLOBAL_PARENT_VARIABLE_KEY, payload);
    setPreviousValues({
      [GLOBAL_PARENT_VARIABLE_KEY]: payload,
    });
  };

  const handleToggleEditMode = (index: number, edit_mode?: boolean) => {
    const res = editMode?.map((item) => {
      if (item?.index === index) {
        return {
          ...item,
          in_edit_mode: !!edit_mode,
        };
      }
      return item;
    });
    setEditMode(res);
  };

  useEventListener({
    eventKey: appendFormKey,
    listener: appendContainer,
  });

  /**
   * *This effect is used to set the in_edit_mode to true for all the fields when the display type is form
   */
  useEnableEditMode({
    form,
    displayType,
    fieldArrayName: GLOBAL_PARENT_VARIABLE_KEY,
  });

  return (
    <Fragment>
      {/* <pre>{JSON.stringify(previousValues, null, 2)}</pre> */}
      {form
        .getValues()
        [GLOBAL_PARENT_VARIABLE_KEY]?.map(
          (field: Record<string, any>, index: number, array: Array<any>) => {
            const prefix = `${GLOBAL_PARENT_VARIABLE_KEY}.${index}` as const;
            const isEditMode = editMode?.find((item) => {
              const match = item?.index === index;
              return match;
            });
            return (
              <Fragment key={field._id}>
                <BasicFormFilterBody
                  defaultValues={defaultValues[GLOBAL_PARENT_VARIABLE_KEY][0]}
                  field={{
                    ...field,
                  }}
                  fieldList={FormFields({
                    field,
                    prefix,
                  })}
                  filterGridConfig={filterGridConfig}
                  form={form}
                  formSchema={formSchema}
                  index={index}
                  key={field.id}
                  prefix={prefix}
                  remove={remove}
                  update={update}
                  onClickSubmit={handleOnClickSubmit}
                  onRemoveSelectedRecords={handleRemoveSelectedRecords}
                  onSelectedGridRecords={(record) => {
                    handleSelectedGridRecords(record, index);
                  }}
                  isEditMode={isEditMode?.in_edit_mode}
                  handleToggleEditMode={handleToggleEditMode}
                  previousValues={previousValues}
                  handleCancel={handleCancel}
                />
                {form.getValues()[GLOBAL_PARENT_VARIABLE_KEY].length - 1 >
                  0 && <Separator className="!my-4" dashed={true} />}
              </Fragment>
            );
          },
        )
        .reverse()}
    </Fragment>
  );
};

export default MultipleForm;
