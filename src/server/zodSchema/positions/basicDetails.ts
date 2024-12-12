import { z } from "zod";

export const PositionBasicDetailsSchema = z.object({
  title: z
    .string({ message: "Title is required." })
    .min(1, { message: "Title is required." }),
  // position_role_id: z
  //   .string({ message: "Role is required." })
  //   .min(1, { message: "Role is required." }),
  employment_type_id: z
    .string({ message: "Employment Type is required." })
    .min(1, { message: "Employment Type is required." }),
  position_type_id: z
    .string({ message: "Position Type is required." })
    .min(1, { message: "Position Type is required." }),
  activation_date: z
    .string({ message: "Activation Date is required." })
    .min(1, { message: "Activation Date is required." })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Activation Date must be a valid date.",
    }),
  expiration_date: z
    .string({ message: "Expiration Date is required." })
    .min(1, { message: "Expiration Date is required." })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Expiration Date must be a valid date.",
    }),
});

export const PositionBasicDetailsFormValidation =
  PositionBasicDetailsSchema.refine(
    (data) =>
      Date.parse(data.expiration_date) > Date.parse(data.activation_date),
    {
      message: "Expiration Date must be after Activation Date.",
      path: ["expiration_date"], // Point to the expiration_date field
    },
  );
