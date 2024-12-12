import { EllipsisVertical } from "lucide-react";
import { Fragment } from "react";
import FormModule from "~/components/platform/FormBuilder/FormModule";
import { CardContent } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { cn } from "~/lib/utils";
import DebuggerComponent from "../../../custom/Debugger";

// TODO: replace any with the correct type
interface IOpenedFormLayoutProps {
  customDesign?: any;
  customRender?: any;
  fields: any;
  form: any;
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
}

const OpenedFormLayout = (props: IOpenedFormLayoutProps) => {
  const {
    customDesign,
    customRender,
    fields,
    form,
    formKey,
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
  } = props;

  return (
    <CardContent
      className={cn(
        customDesign?.formClassName
          ? customDesign?.formClassName
          : "grid grid-cols-1 gap-4 sm:grid-cols-2 pt-8",
        !customRender ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "",
        "shadow-none",
      )}
    >
      <Form {...form}>
        <Fragment>
          {!customRender ? (
            <FormModule
              fields={fields}
              form={form}
              subConfig={{
                checkboxOptions,
                multiSelectOptions,
                multiSelectOnSearch,
                radioOptions,
                selectOptions,
                currencyInputOptions,
              }}
              formKey={formKey}
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
