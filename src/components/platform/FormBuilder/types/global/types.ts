import { type z } from "zod";

type TDisplayType = "form" | "selected";

 type TFormType =
  | "input"
  | "draggable"
  | "multi-field"
  | "input-grid"
  | "time-picker"
  | "number-input"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "smart-date"
  | "file"
  | "multi-select"
  | "inputs"
  | "input-label-value"
  | "phone-input"
  | "email-input"
  | "date-range"
  | "address-input"
  | "slider"
  | "password"
  | "switch"
  | "rich-text-editor"
  | "currency-input";

type TSelectionType = "single" | "multiple";

type DateTimeGranularity = "year" | "month" | "day" | "hour" | "minute" | "second";

type TFormSchema = z.ZodObject<any, any> | z.ZodEffects<z.ZodObject<any, any>>;

export type {
  DateTimeGranularity, TDisplayType, TFormSchema, TFormType, TSelectionType
};

