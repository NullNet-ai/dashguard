import { z } from "zod";

export const PositionPostingsSchema = z.object({
  postings: z
    .array(
      z.object({
        id: z.string().min(1),
        posting_site: z.string().optional(),
        posting_link: z
          .string()
          .refine(
            (link) => {
              if (!link) return true;
              try {
                new URL(link);
                return true;
              } catch {
                return false;
              }
            },
            {
              message: "Invalid URL",
            },
          )
          .optional(),
      }),
    )
    .superRefine((postings, ctx) => {
      const postingSites = new Map();
      const postingLinks = new Map();

      postings.forEach((posting, index) => {
        if (posting.posting_site) {
          if (postingSites.has(posting.posting_site)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Duplicate Posting Site",
              path: [index, "posting_site"],
            });
          } else {
            postingSites.set(posting.posting_site, index);
          }
        }

        if (posting.posting_link) {
          if (postingLinks.has(posting.posting_link)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Duplicate Posting Link",
              path: [index, "posting_link"],
            });
          } else {
            postingLinks.set(posting.posting_link, index);
          }
        }
      });
    }),
});
