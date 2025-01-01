import { EllipsisVertical } from "lucide-react";
import { Fragment, useContext } from "react";
import { CardContent } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { cn, formatFormTestID } from "~/lib/utils";
import DebuggerComponent from "../../../custom/Debugger";
import { IFilterGridConfig } from "~/components/platform/FormBuilder/types";
import { z } from "zod";
import { TFormSchema } from "~/components/platform/FormBuilder/types";
import FormModule from "~/components/platform/FormBuilder/components/ui/FormModule/FormModule";
import { WizardContext } from "~/components/platform/Wizard/Provider";

// TODO: replace any with the correct type
interface IOpenedFormLayoutProps {
  myParent?: "wizard" | "record";
  customDesign?: any;
  customRender?: any;
  fields: any;
  form: any;
  fieldConfig: any;
  formKey: string;
  appendFormKey: string;
  checkboxOptions: any;
  multiSelectOptions: any;
  multiSelectOnSearch: any;
  radioOptions: any;
  selectOptions: any;
  currencyInputOptions: any;
  showFormActions: boolean;
  setShowFormActions: any;
  debugOn: boolean;
  formProps: any;
  handleDebug: any;
  handleLock: any;
  filterGridConfig?: IFilterGridConfig;
  onSelectFieldFilterGrid: (data: z.infer<TFormSchema>) => Promise<void>;
  formSchema: TFormSchema;
}

const OpenedFormLayout = (props: IOpenedFormLayoutProps) => {
  const {
    customDesign,
    customRender,
    fields,
    form,
    formKey,
    fieldConfig,
    appendFormKey,
    checkboxOptions,
    multiSelectOptions,
    multiSelectOnSearch,
    radioOptions,
    selectOptions,
    currencyInputOptions,
    showFormActions,
    setShowFormActions,
    debugOn,
    formProps,
    handleDebug,
    handleLock,
    filterGridConfig,
    onSelectFieldFilterGrid,
    formSchema,
    myParent
  } = props;

  const { state } = useContext(WizardContext);
  const { entityName } = state ?? {};
  const formattedFormKey = formatFormTestID(
    (entityName ?? "no-entity") + " " + (myParent ?? "no-parent")+ " " + formKey,
  );
  return (
    <CardContent
      className={cn(
        "grid grid-cols-1 gap-4 pt-8 sm:grid-cols-2",
        "shadow-none",
        customDesign?.formClassName,
      )}
    >
      <Form {...form} data-test-id={entityName + "-" + myParent + "-" + formKey}>
        <Fragment>
          {!customRender ? (
            <FormModule
              // fieldConfig={fieldConfig}
              fields={fields}
              form={form}
              myParent={myParent}
              subConfig={{
                checkboxOptions,
                multiSelectOptions,
                multiSelectOnSearch,
                radioOptions,
                selectOptions,
                currencyInputOptions,
              }}
              formKey={formattedFormKey}
              gridConfig={filterGridConfig}
              onSelectFieldFilterGrid={onSelectFieldFilterGrid}
              formSchema={formSchema}
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
  );
};

export default OpenedFormLayout;
