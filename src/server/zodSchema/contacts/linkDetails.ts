import { z } from "zod";

export const LinkSchema = z.object({
  id: z.string(),
  title: z
    .string({ message: "Title is required." })
    .min(1, { message: "Title is required." }),
  link: z
    .string({ message: "Link is required." })
    .min(1, { message: "Link is required." })
    .url({ message: "Link must be a valid URL." }),
});

export const LinkDetailsSchema = z
  .object({
    links: z.array(LinkSchema),
  })
  .superRefine((data, ctx) => {
    const { links } = data;
    if (!links.length) return false;
    links.reduce((acc: Record<string, boolean>, link, index) => {
      const key = `${link.link}`;

      // Check for duplicates
      if (acc[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate link found ${link.link}`,
          path: [index, "link"],
        });
      } else {
        acc[key] = true;
      }

      return acc;
    }, {});
  });

export type TLinkSchema = z.infer<typeof LinkSchema>;

export type TLinkDetailsSchema = z.infer<typeof LinkDetailsSchema> & {
  contact_id: string;
};
