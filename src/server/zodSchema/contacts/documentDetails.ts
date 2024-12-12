import { z } from "zod";

export const DocumentDetailsSchema = z.object({
  file_ids: z.array(z.string()),
});

export type TDocumentDetailsSchema = z.infer<typeof DocumentDetailsSchema> & {
  contact_id: string;
};
