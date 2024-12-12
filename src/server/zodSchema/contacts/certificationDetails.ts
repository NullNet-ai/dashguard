import { z } from "zod";

export const CertificationDetailsSchema = z.object({
  contact_id: z.string().optional(),
  certifications: z.array(
    z
      .object({
        id: z.string().nullable().optional(),
        certificate_name: z.string().nullable().optional(),
        institution: z.string().nullable().optional(),
        issued_on_date: z.string().nullable().optional(),
        expiration_date: z.string().nullable().optional(),
      })
      .refine(
        (data) => {
          return (
            data.id ||
            data.certificate_name ||
            data.institution ||
            data.issued_on_date ||
            data.expiration_date
          );
        },
        {
          message: "At least one field must be provided",
        },
      ),
  ),
});
