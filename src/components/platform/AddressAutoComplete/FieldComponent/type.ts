import {
  type UseFormReturn,
} from "react-hook-form";
import { type IField } from "../../FormBuilder/type";

export interface IFieldComponentProps {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  formKey: string;
  fieldConfig: IField;
}
